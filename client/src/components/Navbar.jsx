import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { count } = useCart();

  return (
    <nav className="topnav">
      <div className="wrap">
        <Link to="/" className="logo">
          F<span className="o">OO</span>DLY
        </Link>
        <ul className="navlinks">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/menu">MENU</Link></li>
        </ul>
        <div className="navright">
          <Link to="/cart" className="icon-btn cart-icon" aria-label="Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
