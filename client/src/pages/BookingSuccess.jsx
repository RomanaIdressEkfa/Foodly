import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../api';
import { downloadBookingInvoice } from '../lib/invoicePdf.js';

const STATUS_LABEL = {
  pending: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

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
      <section className="order-success">
        <div className="wrap">
          <p>
            Booking not found. <Link to="/book-table">Book a table</Link>
          </p>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="order-success">
        <div className="wrap">
          <p>Loading your booking…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="order-success">
      <div className="wrap">
        <div className="success-badge">✓</div>
        <h2>Your table is booked!</h2>
        <p className="auth-sub">
          Booking #{booking._id.slice(-6).toUpperCase()} · <span className={`status-pill status-${booking.status === 'confirmed' ? 'fulfilled' : booking.status === 'cancelled' ? 'cancelled' : 'pending'}`}>{STATUS_LABEL[booking.status]}</span>
        </p>

        <div className="invoice-card">
          <div className="invoice-row"><span>Name</span><strong>{booking.customerName}</strong></div>
          <div className="invoice-row"><span>Table</span><strong>{booking.tableName}</strong></div>
          <div className="invoice-row"><span>Date</span><strong>{booking.date}</strong></div>
          <div className="invoice-row"><span>Time</span><strong>{booking.time}</strong></div>
          <div className="invoice-row"><span>Party size</span><strong>{booking.partySize}</strong></div>
          <div className="invoice-row"><span>Phone</span><strong>{booking.phone}</strong></div>
        </div>

        {booking.items.length > 0 && (
          <>
            <h3 className="booking-section-title" style={{ textAlign: 'left' }}>Pre-ordered items</h3>
            <div className="cart-list">
              {booking.items.map((item) => (
                <div key={item.name} className="cart-row">
                  <div className="cart-row-info">
                    <h4>{item.name}</h4>
                    <span>Qty {item.qty}</span>
                  </div>
                  <span className="cart-row-total">{(item.price * item.qty).toFixed(2)}$</span>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <span>Pre-order total</span>
              <strong>{booking.total.toFixed(2)}$</strong>
            </div>
          </>
        )}

        <p className="auth-sub" style={{ marginTop: 20 }}>
          Show this confirmation when you arrive at the restaurant.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
          <button type="button" className="btn btn-solid" onClick={() => downloadBookingInvoice(booking)}>
            Download invoice (PDF)
          </button>
          <Link to="/" className="btn btn-ghost">Back to Home</Link>
        </div>
      </div>
    </section>
  );
}
