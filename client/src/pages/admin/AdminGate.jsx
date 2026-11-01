import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  {
    to: '/admin',
    end: true,
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/admin/products',
    label: 'Products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7l9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" />
      </svg>
    ),
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2h9l3 3v17H6z" /><path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    to: '/admin/customers',
    label: 'Customers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
        <circle cx="17.5" cy="8.5" r="2.4" /><path d="M15.8 14.8c2.6.2 5 1.8 5.7 4.6" />
      </svg>
    ),
  },
  {
    to: '/admin/tables',
    label: 'Tables',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16" />
      </svg>
    ),
  },
  {
    to: '/admin/bookings',
    label: 'Bookings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z" />
      </svg>
    ),
  },
];

function AdminLogin() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedIn = await login(form.email, form.password);
      if (loggedIn.role !== 'admin') {
        setError('This account does not have admin access.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-photo">
          <img src="/images/tom-yum-soup.png" alt="" />
        </div>

        <div className="admin-login-form-side">
          <div className="admin-login-logo">
            <img src="/logo.svg" alt="" className="admin-logo-mark" />
            F<span className="o">OO</span>DLY <span className="admin-login-tag">Admin</span>
          </div>
          <h2 className="admin-login-title">Welcome Back</h2>
          <p className="auth-sub">Sign in to manage products, orders and customers.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="admin-email">Email</label>
            <div className="input-icon-field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="3" /><path d="M3 6l9 7 9-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="you@foodly.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <label htmlFor="admin-password">Password</label>
            <div className="input-icon-field password-field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="10.5" width="16" height="10" rx="2.5" /><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" strokeLinecap="round" /></svg>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" strokeLinecap="round" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.5 5.2A9.8 9.8 0 0 1 12 5c5 0 9 4 10 7-.4 1.1-1.2 2.4-2.3 3.5M6.2 6.6C4 8 2.5 10 2 12c1 3 5 7 10 7 1.3 0 2.6-.3 3.7-.7" strokeLinecap="round" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>

            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-solid" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/admin');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.svg" alt="" className="admin-logo-mark" />
          F<span className="o">OO</span>DLY
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-staff-pill">
          <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
          {user.name}
        </div>
        <button type="button" className="admin-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
          </svg>
          Log Out
        </button>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div />
          <div className="admin-topbar-user">
            <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
            <span>{user.name}</span>
          </div>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminGate() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading…</div>;
  if (user && user.role === 'admin') return <AdminShell />;
  return <AdminLogin />;
}
