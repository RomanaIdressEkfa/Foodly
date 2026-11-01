import { useEffect, useState } from 'react';
import api from '../../api';

const STATUSES = ['pending', 'paid', 'fulfilled', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.orders));
  }, []);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/orders/${id}`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
    } catch {
      // leave the list as-is; the select will just snap back on next render
    } finally {
      setUpdatingId(null);
    }
  }

  if (!orders) return <p>Loading…</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div className="orders-table">
      {orders.map((o) => (
        <div key={o._id} className="order-row">
          <div>
            <strong>#{o._id.slice(-6).toUpperCase()}</strong>
            <span className={`status-pill status-${o.status}`}>{o.status}</span>
          </div>
          <div className="order-items">
            {o.customer?.name || o.email || 'Walk-in order'}
            {o.customer?.phone && ` · ${o.customer.phone}`}
            {o.paymentMethod === 'cod' && ' · COD'}
          </div>
          <div className="order-items">
            {o.items.map((it) => `${it.name} ×${it.qty}`).join(', ')}
          </div>
          <div className="order-total">{o.total.toFixed(2)}$</div>
          <div className="order-date">{new Date(o.createdAt).toLocaleString()}</div>
          <select
            className="order-status-select"
            value={o.status}
            disabled={updatingId === o._id}
            onChange={(e) => updateStatus(o._id, e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
