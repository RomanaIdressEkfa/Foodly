import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';

// The Order model's statuses are shared with the admin POS flow, so they're
// relabeled here into a delivery-flavored timeline for guest customers.
const STEPS = [
  { key: 'pending', label: 'Order Received' },
  { key: 'paid', label: 'Preparing' },
  { key: 'fulfilled', label: 'Delivered' },
];
const STEP_INDEX = { pending: 0, paid: 1, fulfilled: 2 };

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
);
const STEP_ICONS = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 7h16l-1.5 11a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 7Z" /><path d="M8 7a4 4 0 0 1 8 0" /></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 13a8 8 0 0 1 16 0" /><path d="M4 13h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" /><path d="M9 13V9M15 13V9M12 13V7" strokeLinecap="round" /></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7.5" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>,
];

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [order, setOrder] = useState(location.state?.order || null);
  const [settings, setSettings] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (order || !id) return;
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => setNotFound(true));
  }, [id, order]);

  useEffect(() => {
    api.get('/settings/site').then(({ data }) => setSettings(data.settings)).catch(() => {});
  }, []);

  function reorder() {
    order.items.forEach((item) => {
      addItem({ _id: item.product || item.name, name: item.name, price: item.price, image: item.image }, item.qty);
    });
    navigate('/cart');
  }

  if (notFound) {
    return (
      <section className="order-track-page">
        <div className="wrap"><p className="page-loading">Order not found. <Link to="/menu">Back to menu</Link></p></div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="order-track-page">
        <div className="wrap"><p className="page-loading">Loading your order…</p></div>
      </section>
    );
  }

  const cancelled = order.status === 'cancelled';
  const stepIndex = STEP_INDEX[order.status] ?? 0;
  const eta = settings?.estimatedDeliveryMinutes
    ? new Date(new Date(order.createdAt).getTime() + settings.estimatedDeliveryMinutes * 60000)
    : null;

  return (
    <section className="order-track-page">
      <div className="wrap ot-wrap">
        <div className="ot-head">
          <div className={`ot-badge${cancelled ? ' ot-badge-cancelled' : ''}`}>{cancelled ? '✕' : '✓'}</div>
          <h2>{cancelled ? 'Order Cancelled' : 'Thanks, your order is in!'}</h2>
          <p className="ot-ref">Order #{order._id.slice(-6).toUpperCase()} · {order.total.toFixed(2)}$ · Cash on Delivery</p>
        </div>

        {!cancelled && (
          <div className="ot-tracker">
            {STEPS.map((step, i) => (
              <div key={step.key} className={`ot-step${i <= stepIndex ? ' done' : ''}${i === stepIndex ? ' current' : ''}`}>
                <span className="ot-step-icon">{i < stepIndex ? CHECK : STEP_ICONS[i]}</span>
                <span className="ot-step-label">{step.label}</span>
                {i < STEPS.length - 1 && <span className="ot-step-line" />}
              </div>
            ))}
          </div>
        )}

        {!cancelled && eta && stepIndex < 2 && (
          <p className="ot-eta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
            Arriving by {eta.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        )}

        {!cancelled && stepIndex === 0 && (
          <div className="ot-call-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>Our team will call <strong>{order.customer?.phone}</strong> within 5 minutes to confirm your order — please keep your phone handy!</span>
          </div>
        )}

        <div className="ot-layout">
          <div className="ot-items">
            <h3>Items</h3>
            {order.items.map((item) => (
              <div key={item.name} className="ot-item">
                {item.image && <img src={item.image} alt={item.name} />}
                <div className="ot-item-text">
                  <strong>{item.name}</strong>
                  <span>Qty {item.qty}</span>
                </div>
                <span className="ot-item-price">{(item.price * item.qty).toFixed(2)}$</span>
              </div>
            ))}
            <div className="ot-total">
              <span>Total</span>
              <strong>{order.total.toFixed(2)}$</strong>
            </div>
          </div>

          <div className="ot-delivery">
            <h3>Delivering to</h3>
            <p className="ot-address">
              <strong>{order.customer?.name}</strong><br />
              {order.customer?.address}<br />
              {order.customer?.phone}
            </p>
          </div>
        </div>

        <div className="ot-actions">
          <button type="button" className="btn btn-solid" onClick={reorder}>Re-order</button>
          <Link to="/menu" className="btn btn-ghost">Back to Menu</Link>
        </div>
      </div>
    </section>
  );
}
