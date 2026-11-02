import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    api.get('/settings/site').then(({ data }) => setSiteSettings(data.settings)).catch(() => {});
  }, []);

  const minOrder = siteSettings?.minOrderAmount || 0;
  const belowMinimum = minOrder > 0 && total < minOrder;
  const codNote = siteSettings?.codNote || 'Cash on Delivery — pay the rider when your order arrives.';

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/checkout/cod', {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
        },
      });
      clearCart();
      showToast('Order placed! 🎉');
      navigate(`/order/success/${data.order._id}`, { state: { order: data.order } });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="cart-page">
        <div className="wrap">
          <p>
            Your cart is empty. <Link to="/menu">Browse the menu</Link>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 28 }}>
          <h2>Checkout</h2>
          <p>{codNote}</p>
        </div>

        <div className="checkout-layout">
          <aside className="booking-summary checkout-summary">
            <h3>Your order</h3>
            <div className="checkout-summary-items">
              {items.map((item) => (
                <div key={item.productId} className="checkout-summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-summary-item-text">
                    <strong>{item.name}</strong>
                    <span>Qty {item.qty}</span>
                  </div>
                  <span className="checkout-summary-item-price">{(item.price * item.qty).toFixed(2)}$</span>
                </div>
              ))}
            </div>
            <div className="bs-total">
              <span>Total</span>
              <strong>{total.toFixed(2)}$</strong>
            </div>
            <div className="checkout-payment-note">
              <strong>Payment method:</strong> {codNote}
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Delivery details</h3>
            <div className="form-row">
              <div>
                <label htmlFor="co-name">Full name</label>
                <div className="input-icon-field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
                  <input id="co-name" required value={form.name} onChange={update('name')} />
                </div>
              </div>
              <div>
                <label htmlFor="co-phone">Phone</label>
                <div className="input-icon-field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <input id="co-phone" type="tel" required value={form.phone} onChange={update('phone')} />
                </div>
              </div>
            </div>

            <label htmlFor="co-address">Delivery address</label>
            <div className="input-icon-field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ top: 15, transform: 'none' }}><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              <textarea id="co-address" required rows={4} value={form.address} onChange={update('address')} />
            </div>

            {siteSettings?.estimatedDeliveryMinutes > 0 && (
              <p className="checkout-eta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
                Estimated delivery: within {siteSettings.estimatedDeliveryMinutes} minutes
              </p>
            )}

            {belowMinimum && (
              <p className="form-error">Minimum order is {minOrder.toFixed(2)}$ — add {(minOrder - total).toFixed(2)}$ more to checkout.</p>
            )}
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-solid" disabled={loading || belowMinimum}>
              {loading ? 'Placing order…' : `Place order · ${total.toFixed(2)}$`}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
