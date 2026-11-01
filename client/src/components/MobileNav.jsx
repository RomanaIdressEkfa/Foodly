import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function MobileNav() {
  const { count } = useCart();

  return (
    <nav className="mobile-nav">
      <NavLink to="/" end className="mnav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 11l9-8 9 8M5 10v10h14V10" />
        </svg>
      </NavLink>
      <NavLink to="/menu" className="mnav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </NavLink>

      <NavLink to="/menu" className="mnav-fab" aria-label="Order now">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 2-2 10 0 12v6M17 3v9" strokeLinecap="round" />
        </svg>
      </NavLink>

      <NavLink to="/cart" className="mnav-item mnav-cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
        </svg>
        {count > 0 && <span className="mnav-badge">{count}</span>}
      </NavLink>
    </nav>
  );
}
