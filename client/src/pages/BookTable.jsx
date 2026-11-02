import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import FloorPlan from '../components/FloorPlan.jsx';
import PickerDropdown from '../components/PickerDropdown.jsx';
import { bookingRef, downloadBookingInvoice } from '../lib/invoicePdf.js';
import { useToast } from '../context/ToastContext.jsx';

// Local date (not UTC), so late-night visitors don't get yesterday's date.
function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const TODAY = localDate();

function toMinutes(time) {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + (m || 0);
}
function toTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

// Mirrors api/lib/bookingSettings.js so the picker only ever offers slots
// and dates the server will actually accept — driven by Admin Settings
// instead of a hardcoded schedule.
function timeSlotsFor(settings) {
  const slots = [];
  for (let m = toMinutes(settings.openTime); m <= toMinutes(settings.lastBookingTime); m += settings.slotMinutes) {
    slots.push(toTime(m));
  }
  return slots;
}
function upcomingDaysFor(settings) {
  const days = [];
  for (let i = 0; i < settings.daysAhead; i++) {
    const cursor = new Date();
    cursor.setDate(cursor.getDate() + i);
    days.push(localDate(cursor));
  }
  return days.filter((d) => !settings.closedDays.includes(new Date(`${d}T00:00:00`).getDay()));
}

function formatSlot(slot) {
  const [h, m] = slot.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function slotIsPast(date, slot) {
  if (date !== localDate()) return false;
  const now = new Date();
  return slot <= `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

const ICONS = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  ),
  guests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" /><path d="M16 14.6c2.7.2 5 2 5 5" strokeLinecap="round" />
    </svg>
  ),
};

function Row({ label, value }) {
  return (
    <div className="bs-row">
      <span>{label}</span>
      {value ? <strong>{value}</strong> : <strong className="bs-empty">Not selected</strong>}
    </div>
  );
}

export default function BookTable() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookedIds, setBookedIds] = useState([]);
  const [tableId, setTableId] = useState('');
  const [date, setDate] = useState(TODAY);
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preOrder, setPreOrder] = useState(false);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    api.get('/tables').then(({ data }) => setTables(data.tables));
    api.get('/products').then(({ data }) => setProducts(data.products));
    api.get('/bookings/settings').then(({ data }) => setSettings(data.settings));
  }, []);

  // Driven by Admin Settings, not a hardcoded schedule.
  const TIME_SLOTS = useMemo(() => (settings ? timeSlotsFor(settings) : []), [settings]);
  const UPCOMING_DAYS = useMemo(() => (settings ? upcomingDaysFor(settings) : []), [settings]);
  const SLOT_GROUPS = useMemo(() => {
    if (!settings) return [];
    return [
      { label: 'Lunch', slots: TIME_SLOTS.filter((s) => s < settings.dinnerStart) },
      { label: 'Dinner', slots: TIME_SLOTS.filter((s) => s >= settings.dinnerStart) },
    ];
  }, [settings, TIME_SLOTS]);

  // Once settings load, snap date/time onto a slot the server will accept.
  useEffect(() => {
    if (!settings || UPCOMING_DAYS.length === 0) return;
    if (!UPCOMING_DAYS.includes(date)) setDate(UPCOMING_DAYS[0]);
  }, [settings, UPCOMING_DAYS]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!settings || TIME_SLOTS.length === 0) return;
    if (!TIME_SLOTS.includes(time)) setTime(TIME_SLOTS.find((s) => !slotIsPast(date, s)) || TIME_SLOTS[0]);
  }, [settings, TIME_SLOTS]); // eslint-disable-line react-hooks/exhaustive-deps

  // If the chosen time has already passed today, jump to the next open slot.
  useEffect(() => {
    if (TIME_SLOTS.length === 0 || !slotIsPast(date, time)) return;
    const next = TIME_SLOTS.find((s) => !slotIsPast(date, s));
    if (next) setTime(next);
    else if (UPCOMING_DAYS[1]) setDate(UPCOMING_DAYS[1]); // closed for today — move to tomorrow
  }, [date, time, TIME_SLOTS, UPCOMING_DAYS]);

  useEffect(() => {
    if (!date || !time) return;
    api
      .get('/bookings/availability', { params: { date, time } })
      .then(({ data }) => setBookedIds(data.bookedTableIds))
      .catch(() => setBookedIds([]));
  }, [date, time]);

  const table = tables.find((t) => t._id === tableId);
  const guests = Number(partySize) || 0;
  const maxSeats = Math.max(2, ...tables.map((t) => t.capacity));
  const guestCap = settings?.maxGuests > 0 ? Math.min(maxSeats, settings.maxGuests) : maxSeats;
  const guestOptions = Array.from({ length: guestCap }, (_, i) => i + 1);

  // Drop the selection if it becomes unavailable after a date/time/size change.
  useEffect(() => {
    if (table && (bookedIds.includes(table._id) || table.capacity < guests)) setTableId('');
  }, [bookedIds, guests, table]);

  function tableState(t) {
    if (bookedIds.includes(t._id)) return { disabled: true, note: 'Booked' };
    if (t.capacity < guests) return { disabled: true, note: `Seats ${t.capacity}` };
    return {};
  }

  function qtyOf(productId) {
    return cart.find((i) => i.productId === productId)?.qty || 0;
  }

  function add(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) return prev.map((i) => (i.productId === product._id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { productId: product._id, name: product.name, price: product.price, qty: 1 }];
    });
  }

  function remove(productId) {
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0));
  }

  const items = preOrder ? cart : [];
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  function openConfirm(e) {
    e.preventDefault();
    if (!tableId) {
      setError('Please pick a table on the floor plan.');
      return;
    }
    setError('');
    setConfirmOpen(true);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        tableId,
        customerName: name,
        phone,
        email,
        date,
        time,
        partySize: guests,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      setBooking(data.booking);
      setConfirmOpen(false);
      showToast(`Table ${data.booking.tableName} booked for ${formatSlot(data.booking.time)} 🎉`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not complete the booking.');
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setBooking(null);
    setTableId('');
    setCart([]);
    setPreOrder(false);
    setName('');
    setPhone('');
    setEmail('');
    api.get('/bookings/availability', { params: { date, time } }).then(({ data }) => setBookedIds(data.bookedTableIds));
  }

  if (!settings) {
    return (
      <section className="menu-page booking-page">
        <div className="wrap"><p className="page-loading">Loading…</p></div>
      </section>
    );
  }

  if (!settings.enabled) {
    return (
      <section className="menu-page booking-page">
        <div className="wrap">
          <div className="section-head">
            <h2>Book a Table</h2>
            <p>Online table booking is paused right now — please call the restaurant to reserve a table.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="menu-page booking-page">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 24 }}>
          <h2>Book a Table</h2>
          <p>Pick your time and table, pre-order if you like — your booking builds up on the right.</p>
        </div>

        <form className="booking-layout" onSubmit={openConfirm}>
          <div>
            <div className="booking-step">
              <div className="booking-step-head">
                <span className="booking-step-num">1</span>
                <div>
                  <h3>When are you coming?</h3>
                  <p>Tables already booked around this time are greyed out.</p>
                </div>
              </div>
              <div className="booking-grid">
                <PickerDropdown icon={ICONS.calendar} label="Date" value={formatDate(date)} panelWidth={340}>
                  {(close) => (
                    <>
                      <p className="picker-group">{date === UPCOMING_DAYS[0] ? 'Today' : 'Choose a day'}</p>
                      <div className="chip-grid cols-4">
                        {UPCOMING_DAYS.map((d) => {
                          const isToday = d === TODAY;
                          const isTomorrow = d === localDate(new Date(Date.now() + 86400000));
                          return (
                            <button
                              key={d}
                              type="button"
                              className={`chip chip-date${d === date ? ' active' : ''}`}
                              onClick={() => { setDate(d); close(); }}
                            >
                              <small>{isToday ? 'Today' : isTomorrow ? 'Tomorrow' : new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</small>
                              <strong>{new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</strong>
                            </button>
                          );
                        })}
                      </div>
                      <label className="picker-other">
                        <span>Another date</span>
                        <input
                          type="date"
                          min={TODAY}
                          max={UPCOMING_DAYS[UPCOMING_DAYS.length - 1]}
                          value={date}
                          onChange={(e) => { if (e.target.value) { setDate(e.target.value); close(); } }}
                        />
                      </label>
                    </>
                  )}
                </PickerDropdown>

                <PickerDropdown icon={ICONS.clock} label="Time" value={formatSlot(time)} panelWidth={340}>
                  {(close) =>
                    SLOT_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="picker-group">{group.label}</p>
                        <div className="chip-grid cols-4">
                          {group.slots.map((slot) => {
                            const past = slotIsPast(date, slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={past}
                                className={`chip${slot === time ? ' active' : ''}`}
                                onClick={() => { setTime(slot); close(); }}
                              >
                                {formatSlot(slot)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  }
                </PickerDropdown>

                <PickerDropdown icon={ICONS.guests} label="Guests" value={`${guests} ${guests === 1 ? 'guest' : 'guests'}`} panelWidth={280}>
                  {(close) => (
                    <>
                      <p className="picker-group">How many people?</p>
                      <div className="chip-grid cols-4">
                        {guestOptions.map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`chip chip-guest${n === guests ? ' active' : ''}`}
                            onClick={() => { setPartySize(n); close(); }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <p className="picker-note">
                        {settings?.maxGuests > 0 && settings.maxGuests < maxSeats
                          ? `Online bookings up to ${guestCap} guests.`
                          : `Largest table seats ${maxSeats}.`}
                      </p>
                    </>
                  )}
                </PickerDropdown>
              </div>
            </div>

            <div className="booking-step">
              <div className="booking-step-head">
                <span className="booking-step-num">2</span>
                <div>
                  <h3>Choose your table</h3>
                  <p>Each mark around a table is one chair.</p>
                </div>
              </div>
              {tables.length === 0 ? (
                <p>No tables available right now.</p>
              ) : (
                <>
                  <FloorPlan tables={tables} selectedId={tableId} onSelect={(t) => setTableId(t._id)} getState={tableState} />
                  <div className="floorplan-legend">
                    <span><i style={{ background: 'linear-gradient(150deg, #f5dfb8, #e3bb83)', border: '1px solid #caa06a' }} /> Available</span>
                    <span><i style={{ background: 'linear-gradient(150deg, #f5dfb8, #e3bb83)', boxShadow: '0 0 0 2px var(--orange)' }} /> Your table</span>
                    <span><i style={{ background: '#d4d0c8' }} /> Booked / too small</span>
                    <span><i style={{ background: '#7c9468' }} /> Chair</span>
                  </div>
                </>
              )}
            </div>

            <div className="booking-step">
              <div className="booking-step-head">
                <span className="booking-step-num">3</span>
                <div>
                  <h3>Your details</h3>
                  <p>So we know who to expect.</p>
                </div>
              </div>
              <div className="booking-grid">
                <div>
                  <label>Full name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label>Phone</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label>Email (optional)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="booking-step">
              <div className="booking-step-head">
                <span className="booking-step-num">4</span>
                <div>
                  <h3>Pre-order from the menu?</h3>
                  <p>Optional — have your food ready when you sit down.</p>
                </div>
              </div>
              <div className="booking-toggle">
                <button type="button" className={!preOrder ? 'active' : ''} onClick={() => setPreOrder(false)}>
                  Skip, I'll order there
                </button>
                <button type="button" className={preOrder ? 'active' : ''} onClick={() => setPreOrder(true)}>
                  Pre-order now
                </button>
              </div>

              {preOrder && (
                <div className="booking-menu-grid">
                  {products.map((p) => {
                    const qty = qtyOf(p._id);
                    return (
                      <div key={p._id} className={`booking-menu-item${qty > 0 ? ' in-cart' : ''}`}>
                        <img src={p.image} alt={p.name} />
                        <div className="bm-body">
                          <strong>{p.name}</strong>
                          <span className="bm-price">{p.price}$</span>
                          {qty > 0 ? (
                            <div className="qty-stepper">
                              <button type="button" onClick={() => remove(p._id)}>−</button>
                              <span>{qty}</span>
                              <button type="button" onClick={() => add(p)}>+</button>
                            </div>
                          ) : (
                            <button type="button" className="bm-add" onClick={() => add(p)}>Add</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="booking-summary">
            {booking ? (
              <>
                <div className="bs-confirmed">
                  <div className="success-badge">✓</div>
                  <h3>Table booked!</h3>
                  <p className="bs-sub">Booking #{bookingRef(booking)} · show this at the restaurant</p>
                </div>
                <Row label="Name" value={booking.customerName} />
                <Row label="Table" value={booking.tableName} />
                <Row label="Date" value={booking.date} />
                <Row label="Time" value={formatSlot(booking.time)} />
                <Row label="Guests" value={booking.partySize} />
                {booking.items.length > 0 && (
                  <div className="bs-items">
                    {booking.items.map((i) => (
                      <div key={i.name} className="bs-item">
                        <span>{i.name} ×{i.qty}</span>
                        <strong>{(i.price * i.qty).toFixed(2)}$</strong>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bs-total">
                  <span>Pre-order total</span>
                  <strong>{booking.total.toFixed(2)}$</strong>
                </div>
                <div className="bs-actions">
                  <button type="button" className="btn btn-solid" onClick={() => downloadBookingInvoice(booking)}>
                    Download invoice (PDF)
                  </button>
                  <Link to={`/booking/success/${booking._id}`} className="bs-link">Open invoice page</Link>
                  <button type="button" className="btn btn-ghost" onClick={startOver}>Make another booking</button>
                </div>
              </>
            ) : (
              <>
                <h3>Your booking</h3>
                <p className="bs-sub">Updates as you choose.</p>
                <Row label="Date" value={date} />
                <Row label="Time" value={formatSlot(time)} />
                <Row label="Guests" value={guests || ''} />
                <Row label="Table" value={table ? `${table.name} · ${table.capacity} seats · ${table.floor}` : ''} />
                <Row label="Name" value={name} />
                <Row label="Phone" value={phone} />

                {items.length > 0 && (
                  <div className="bs-items">
                    {items.map((i) => (
                      <div key={i.productId} className="bs-item">
                        <span>{i.name} ×{i.qty}</span>
                        <strong>{(i.price * i.qty).toFixed(2)}$</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bs-total">
                  <span>{preOrder ? 'Pre-order total' : 'Pre-order'}</span>
                  <strong>{preOrder ? `${total.toFixed(2)}$` : 'Skipped'}</strong>
                </div>

                {error && <p className="form-error">{error}</p>}
                <button type="submit" className="btn btn-solid" disabled={loading}>
                  {loading ? 'Booking…' : 'Confirm booking'}
                </button>
              </>
            )}
          </aside>
        </form>

        {confirmOpen && (
          <div className="confirm-overlay" onClick={() => !loading && setConfirmOpen(false)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm your booking?</h3>
              <p className="bs-sub">Please check the details below before we save your table.</p>

              <Row label="Table" value={table ? `${table.name} · ${table.capacity} seats` : ''} />
              <Row label="Date" value={formatDate(date)} />
              <Row label="Time" value={formatSlot(time)} />
              <Row label="Guests" value={guests} />
              <Row label="Name" value={name} />
              <Row label="Phone" value={phone} />

              {items.length > 0 && (
                <div className="bs-items">
                  {items.map((i) => (
                    <div key={i.productId} className="bs-item">
                      <span>{i.name} ×{i.qty}</span>
                      <strong>{(i.price * i.qty).toFixed(2)}$</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="bs-total">
                <span>{preOrder ? 'Pre-order total' : 'Pre-order'}</span>
                <strong>{preOrder ? `${total.toFixed(2)}$` : 'Skipped'}</strong>
              </div>

              {error && <p className="form-error">{error}</p>}
              <div className="confirm-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmOpen(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="button" className="btn btn-solid" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Booking…' : 'Yes, confirm booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
