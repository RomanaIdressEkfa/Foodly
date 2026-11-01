import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          email: form.email,
        },
      });
      clearCart();
      navigate('/order/success', { state: { order: data.order } });
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
          <p>Cash on Delivery — pay when your order arrives.</p>
        </div>

        <div className="cart-list">
          {items.map((item) => (
            <div key={item.productId} className="cart-row">
              <img src={item.image} alt={item.name} />
              <div className="cart-row-info">
                <h4>{item.name}</h4>
                <span>Qty {item.qty}</span>
              </div>
              <span className="cart-row-total">{(item.price * item.qty).toFixed(2)}$</span>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <span>Total</span>
          <strong>{total.toFixed(2)}$</strong>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <label htmlFor="co-name">Full name</label>
          <input id="co-name" required value={form.name} onChange={update('name')} />

          <label htmlFor="co-phone">Phone</label>
          <input id="co-phone" type="tel" required value={form.phone} onChange={update('phone')} />

          <label htmlFor="co-email">Email (optional)</label>
          <input id="co-email" type="email" value={form.email} onChange={update('email')} />

          <label htmlFor="co-address">Delivery address</label>
          <textarea id="co-address" required rows={3} value={form.address} onChange={update('address')} />

          <div className="checkout-payment-note">
            <strong>Payment method:</strong> Cash on Delivery — pay the rider when your order arrives.
          </div>

          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-solid" disabled={loading}>
            {loading ? 'Placing order…' : `Place order · ${total.toFixed(2)}$`}
          </button>
        </form>
      </div>
    </section>
  );
}
