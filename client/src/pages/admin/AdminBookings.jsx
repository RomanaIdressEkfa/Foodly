import { useEffect, useRef, useState } from 'react';
import api from '../../api';

const STATUSES = ['pending', 'confirmed', 'cancelled'];

const STATUS_STYLE = {
  pending:   'status-pending',
  confirmed: 'status-fulfilled',
  cancelled: 'status-cancelled',
};

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

  if (!bookings) return <p className="page-loading">Loading…</p>;
  if (!bookings.length) return <p className="page-loading" style={{ color: 'var(--ap-muted)' }}>No bookings yet.</p>;

  return (
    <div className="bk-wrap">
      {bookings.map((b) => {
        const hasItems = b.items?.length > 0;
        return (
          <div key={b._id} className="bk-row">

            {/* ── Left: identity ── */}
            <div className="bk-col bk-col-id">
              <span className="bk-id">#{b._id.slice(-6).toUpperCase()}</span>
              <span className={`status-pill ${STATUS_STYLE[b.status] ?? ''}`}>{b.status}</span>
            </div>

            {/* ── Guest info ── */}
            <div className="bk-col bk-col-guest">
              <strong>{b.customerName}</strong>
              <span>{b.phone}</span>
              {b.email && <span className="bk-email">{b.email}</span>}
            </div>

            {/* ── Reservation details ── */}
            <div className="bk-col bk-col-res">
              <strong>{b.tableName}</strong>
              <span>{b.date} · {b.time}</span>
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
      })}
    </div>
  );
}
