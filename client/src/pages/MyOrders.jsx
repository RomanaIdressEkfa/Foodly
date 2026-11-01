import { useEffect, useState } from 'react';
import api from '../api';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders));
  }, []);

  return (
    <section className="menu-page">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: 'left' }}>
          <h2>My Orders</h2>
        </div>

        {!orders ? (
          <p>Loading…</p>
        ) : orders.length === 0 ? (
          <p>You haven't ordered anything yet.</p>
        ) : (
          <div className="orders-table">
            {orders.map((o) => (
              <div key={o._id} className="order-row">
                <div>
                  <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                  <span className={`status-pill status-${o.status}`}>{o.status}</span>
                </div>
                <div className="order-items">
                  {o.items.map((it) => `${it.name} ×${it.qty}`).join(', ')}
                </div>
                <div className="order-total">{o.total.toFixed(2)}$</div>
                <div className="order-date">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
