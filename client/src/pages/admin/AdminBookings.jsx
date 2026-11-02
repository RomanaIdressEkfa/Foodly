import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../api';

const STATUSES = ['pending', 'confirmed', 'cancelled'];

const STATUS_STYLE = {
  pending:   'status-pending',
  confirmed: 'status-fulfilled',
  cancelled: 'status-cancelled',
};

// Matches the amber/blue/rose tones already used for the status pills, so
// the accent bar and the pill always agree with each other at a glance.
const STATUS_ACCENT = {
  pending:   '#e3a93c',
  confirmed: '#4a86b5',
  cancelled: '#c25a70',
};

// Local date (not UTC) so "today" lines up with what the customer picked.
function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const TODAY = localDate();
const YESTERDAY = localDate(new Date(Date.now() - 86400000));
const TOMORROW = localDate(new Date(Date.now() + 86400000));

const DATE_FILTERS = [
  { key: 'all', label: 'All dates' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
];

function matchesDate(b, key) {
  if (key === 'yesterday') return b.date === YESTERDAY;
  if (key === 'today') return b.date === TODAY;
  if (key === 'tomorrow') return b.date === TOMORROW;
  return true;
}

/* ── Premium custom select ── */
function StatusSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function outside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  return (
    <div className="bk-select" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        className={`bk-select-btn${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={`status-pill ${STATUS_STYLE[value] ?? ''}`}>{value}</span>
        <svg className="bk-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="bk-select-menu" role="listbox">
          {STATUSES.map((s) => (
            <li
              key={s}
              role="option"
              aria-selected={s === value}
              className={`bk-select-opt${s === value ? ' selected' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setOpen(false); }}
            >
              <span className={`status-pill ${STATUS_STYLE[s] ?? ''}`}>{s}</span>
              {s === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    api.get('/bookings').then(({ data }) => setBookings(data.bookings));
  }, []);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/bookings/${id}`, { status });
      setBookings((prev) => prev.map((b) => (b._id === id ? data.booking : b)));
    } catch { /* no-op */ }
    finally { setUpdatingId(null); }
  }

  const dateCounts = useMemo(() => {
    const counts = { all: bookings?.length || 0, yesterday: 0, today: 0, tomorrow: 0 };
    bookings?.forEach((b) => {
      if (b.date === YESTERDAY) counts.yesterday++;
      if (b.date === TODAY) counts.today++;
      if (b.date === TOMORROW) counts.tomorrow++;
    });
    return counts;
  }, [bookings]);

  const statusCounts = useMemo(() => {
    const counts = { all: bookings?.length || 0, pending: 0, confirmed: 0, cancelled: 0 };
    bookings?.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return counts;
  }, [bookings]);

  const filtered = useMemo(() => {
    if (!bookings) return null;
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (!matchesDate(b, dateFilter)) return false;
      if (q) {
        const haystack = `${b.customerName} ${b.phone} ${b.email || ''} ${b.tableName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  const filtersActive = search || statusFilter !== 'all' || dateFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setDateFilter('all');
  }

  if (!bookings) return <p className="page-loading">Loading…</p>;

  return (
    <div className="bk-wrap">
      <div className="bk-toolbar">
        <div className="bk-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, table…"
          />
        </div>

        <div className="bk-chip-row">
          {DATE_FILTERS.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`bk-chip${dateFilter === d.key ? ' active' : ''}`}
              onClick={() => setDateFilter(d.key)}
            >
              {d.label}
              <span className="bk-chip-count">{dateCounts[d.key]}</span>
            </button>
          ))}
        </div>

        <div className="bk-chip-row">
          <button type="button" className={`bk-chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>
            All status<span className="bk-chip-count">{statusCounts.all}</span>
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`bk-chip bk-chip-status${statusFilter === s ? ' active' : ''}`}
              style={{ '--accent': STATUS_ACCENT[s] }}
              onClick={() => setStatusFilter(s)}
            >
              <i className="bk-chip-dot" />
              {s}
              <span className="bk-chip-count">{statusCounts[s] || 0}</span>
            </button>
          ))}
          {filtersActive && (
            <button type="button" className="bk-chip bk-chip-clear" onClick={clearFilters}>Clear</button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="page-loading" style={{ color: 'var(--ap-muted)' }}>
          {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match these filters.'}
        </p>
      ) : (
        filtered.map((b) => {
          const hasItems = b.items?.length > 0;
          return (
            <div key={b._id} className="bk-row" style={{ '--status-color': STATUS_ACCENT[b.status] }}>

              {/* ── Left: identity ── */}
              <div className="bk-col bk-col-id">
                <span className="bk-id">#{b._id.slice(-6).toUpperCase()}</span>
                <span className={`status-pill ${STATUS_STYLE[b.status] ?? ''}`}>{b.status}</span>
              </div>

              {/* ── Guest info ── */}
              <div className="bk-col bk-col-guest">
                <strong>{b.customerName}</strong>
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" className="bk-inline-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  {b.phone}
                </span>
                {b.email && <span className="bk-email">{b.email}</span>}
              </div>

              {/* ── Reservation details ── */}
              <div className="bk-col bk-col-res">
                <strong>{b.tableName}</strong>
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" className="bk-inline-icon"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  {b.date} · {b.time}
                </span>
                <span>{b.partySize} guest{b.partySize > 1 ? 's' : ''}</span>
              </div>

              {/* ── Pre-order items ── */}
              <div className="bk-col bk-col-items">
                {hasItems ? (
                  <>
                    {b.items.map((it, i) => (
                      <div key={i} className="bk-item">
                        <div className="bk-item-img">
                          {it.image
                            ? <img src={it.image} alt={it.name} />
                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z" /><path d="M12 8v4l3 3" strokeLinecap="round" /></svg>
                          }
                        </div>
                        <div className="bk-item-text">
                          <span className="bk-item-name">{it.name}</span>
                          <span className="bk-item-qty">×{it.qty}</span>
                        </div>
                      </div>
                    ))}
                    <span className="bk-total">${b.total.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="bk-no-items">No pre-order</span>
                )}
              </div>

              {/* ── Date + status changer ── */}
              <div className="bk-col bk-col-actions">
                <span className="bk-date">{new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <StatusSelect
                  value={b.status}
                  disabled={updatingId === b._id}
                  onChange={(s) => updateStatus(b._id, s)}
                />
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}
