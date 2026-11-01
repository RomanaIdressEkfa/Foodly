import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminCustomers() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data.users));
  }, []);

  if (!users) return <p>Loading…</p>;
  if (users.length === 0) return <p>No customers yet.</p>;

  return (
    <div className="orders-table">
      {users.map((u) => (
        <div key={u._id} className="order-row">
          <div>
            <strong>{u.name}</strong>
            <span className={`status-pill status-${u.role === 'admin' ? 'fulfilled' : 'paid'}`}>{u.role}</span>
          </div>
          <div className="order-items">{u.email}</div>
          <div className="order-date">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}
