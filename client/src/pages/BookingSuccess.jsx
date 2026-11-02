import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../api';
import { downloadBookingInvoice } from '../lib/invoicePdf.js';

const STATUS_LABEL = {
  pending: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const ICONS = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" /></svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
  ),
  guests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" strokeLinecap="round" /><circle cx="17" cy="9" r="2.4" /><path d="M16 14.6c2.7.2 5 2 5 5" strokeLinecap="round" /></svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="7" width="18" height="5" rx="2" /><path d="M6 12v6M18 12v6" strokeLinecap="round" /></svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" /></svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
};

function DetailRow({ icon, label, value }) {
  return (
    <div className="bsp-row">
      <span className="bsp-row-icon">{ICONS[icon]}</span>
      <span className="bsp-row-label">{label}</span>
      <strong className="bsp-row-value">{value}</strong>
    </div>
  );
}

export default function BookingSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (booking || !id) return;
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => setNotFound(true));
  }, [id, booking]);

  if (notFound) {
    return (
      <section className="booking-success-page">
        <div className="wrap">
          <p className="page-loading">
            Booking not found. <Link to="/book-table">Book a table</Link>
          </p>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="booking-success-page">
        <div className="wrap"><p className="page-loading">Loading your booking…</p></div>
      </section>
    );
  }

  const statusClass = booking.status === 'confirmed' ? 'fulfilled' : booking.status === 'cancelled' ? 'cancelled' : 'pending';

  return (
    <section className="booking-success-page">
      <div className="wrap bsp-wrap">
        <div className="bsp-hero">
          <div className="bsp-rings">
            <div className="bsp-badge">✓</div>
          </div>
          <h2>Your table is booked!</h2>
          <p className="bsp-ref">
            Booking #{booking._id.slice(-6).toUpperCase()} <span className={`status-pill status-${statusClass}`}>{STATUS_LABEL[booking.status]}</span>
          </p>
          <p className="bsp-hint">Show this confirmation when you arrive at the restaurant — no account or login needed.</p>
          <div className="bsp-actions">
            <button type="button" className="btn btn-solid" onClick={() => downloadBookingInvoice(booking)}>
              Download invoice (PDF)
            </button>
            <Link to="/" className="btn btn-ghost">Back to Home</Link>
          </div>
        </div>

        <div className="bsp-card">
          <h3>Booking details</h3>
          <div className="bsp-rows">
            <DetailRow icon="user" label="Name" value={booking.customerName} />
            <DetailRow icon="table" label="Table" value={booking.tableName} />
            <DetailRow icon="calendar" label="Date" value={booking.date} />
            <DetailRow icon="clock" label="Time" value={booking.time} />
            <DetailRow icon="guests" label="Guests" value={booking.partySize} />
            <DetailRow icon="phone" label="Phone" value={booking.phone} />
          </div>

          {booking.items.length > 0 && (
            <>
              <h4 className="bsp-items-title">Pre-ordered items</h4>
              <div className="bsp-items">
                {booking.items.map((item) => (
                  <div key={item.name} className="bsp-item">
                    <div className="bsp-item-img">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z" /><path d="M12 8v4l3 3" strokeLinecap="round" /></svg>}
                    </div>
                    <div className="bsp-item-text">
                      <strong>{item.name}</strong>
                      <span>Qty {item.qty}</span>
                    </div>
                    <span className="bsp-item-price">{(item.price * item.qty).toFixed(2)}$</span>
                  </div>
                ))}
              </div>
              <div className="bsp-total">
                <span>Pre-order total</span>
                <strong>{booking.total.toFixed(2)}$</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
