import { useEffect, useState } from 'react';
import api from '../../api';

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function AdminCustomers() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data.users));
  }, []);

  if (!users) return <p className="page-loading">Loading…</p>;
  if (users.length === 0) return <p className="page-loading" style={{ color: 'var(--ap-muted)' }}>No accounts yet.</p>;

  return (
    <div>
      <p className="admin-hint" style={{ marginBottom: 16 }}>
        Checkout is guest-only (no customer sign-ups), so this lists the staff/admin accounts that can log in to this dashboard.
      </p>
      <div className="cu-grid">
        {users.map((u) => (
          <div key={u._id} className="cu-card">
            <div className={`avatar cu-avatar${u.role === 'admin' ? ' cu-avatar-admin' : ''}`}>{initials(u.name)}</div>
            <div className="cu-body">
              <strong>{u.name}</strong>
              <span className={`status-pill ${u.role === 'admin' ? 'status-fulfilled' : 'status-paid'}`}>{u.role}</span>
            </div>
            <div className="cu-meta">
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M4 4h16v16H4z" /><path d="M4 6l8 7 8-7" /></svg>
                {u.email}
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
