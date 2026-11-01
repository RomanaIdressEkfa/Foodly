import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { categoryIcon, categoryStyle } from '../../lib/categoryMeta.jsx';

const ORDER_TYPES = ['Dine in', 'Take Away', 'Delivery'];
const TAX_RATE = 0.05;

const PAY_METHODS = [
  {
    id: 'cash',
    label: 'Cash',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'card',
    label: 'Credit/Debit Card',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: 'qr',
    label: 'QR Code',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('Dine in');
  const [payment, setPayment] = useState('cash');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [justPlaced, setJustPlaced] = useState(false);

  function loadProducts() {
    api.get('/products').then(({ data }) => setProducts(data.products));
  }
  function loadRecent() {
    api.get('/admin/stats').then(({ data }) => {
      setRecentOrders(data.recentOrders);
      setStats(data);
    });
  }

  useEffect(() => {
    loadProducts();
    loadRecent();
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );
  const visible = products.filter((p) => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function cartQty(productId) {
    return cart.find((i) => i.productId === productId)?.qty || 0;
  }

  function addToCart(product) {
    setJustPlaced(false);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) => (i.productId === product._id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, image: product.image, qty: 1 }];
    });
  }

  function decFromCart(productId) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  }

  const subTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subTotal * TAX_RATE;
  const total = subTotal + tax;

  async function placeOrder() {
    if (cart.length === 0) return;
    setPlacing(true);
    setPlaceError('');
    try {
      await api.post('/orders', {
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
        customerLabel: `${orderType} · ${PAY_METHODS.find((p) => p.id === payment).label}`,
      });
      setCart([]);
      setJustPlaced(true);
      loadRecent();
    } catch (err) {
      setPlaceError(err.response?.data?.error || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="pos-layout">
      <div className="pos-main">
        {stats && (
          <div className="pos-stats-row">
            <div className="pos-stat-card">
              <span>Total Revenue</span>
              <strong>{stats.totalRevenue.toFixed(2)}$</strong>
            </div>
            <div className="pos-stat-card">
              <span>Total Orders</span>
              <strong>{stats.totalOrders}</strong>
            </div>
            <div className="pos-stat-card">
              <span>Products</span>
              <strong>{stats.totalProducts}</strong>
            </div>
            <div className="pos-stat-card">
              <span>Customers</span>
              <strong>{stats.totalCustomers}</strong>
            </div>
          </div>
        )}
        <div className="pos-header-row">
          <button type="button" className="pos-burger" aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <label className="admin-search" style={{ maxWidth: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input
              type="search"
              placeholder="Search product here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button type="button" className="pos-filter-btn" aria-label="Filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
          </button>
        </div>

        <div className="ap-category-row">
          {categories.map((c, i) => {
            const count = c === 'All' ? products.length : products.filter((p) => p.category === c).length;
            const style = categoryStyle(i);
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                className={`ap-category-tile${active ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >
                <span className="ap-cat-icon" style={{ background: style.bg, color: style.fg }}>
                  {categoryIcon(c)}
                </span>
                {c}
                <span className="ap-cat-count">{count} items</span>
              </button>
            );
          })}
        </div>

        <div className="ap-product-grid">
          {visible.map((p) => {
            const qty = cartQty(p._id);
            return (
              <div key={p._id} className={`ap-product-card${qty > 0 ? ' in-cart' : ''}`}>
                <div className="ap-product-photo">
                  <img src={p.image} alt={p.name} />
                  {p.featured && <span className="ap-product-badge">Featured</span>}
                </div>
                <div className="ap-product-body">
                  <strong>{p.name}</strong>
                  <div className="ap-product-meta">
                    <span>{p.category}</span>
                    <span className="ap-product-price">{p.price}$</span>
                  </div>
                  {qty > 0 ? (
                    <div className="pos-qty-stepper">
                      <button type="button" onClick={() => decFromCart(p._id)}>−</button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => addToCart(p)}>+</button>
                    </div>
                  ) : (
                    <button type="button" className="pos-add-btn" onClick={() => addToCart(p)}>
                      Add to Dish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && <p>No products match.</p>}
        </div>

        {recentOrders.length > 0 && (
          <div className="pos-tickets-row">
            {recentOrders.map((o) => (
              <div key={o._id} className="pos-ticket">
                <div className="avatar">{(o.email || 'W O').slice(0, 2).toUpperCase()}</div>
                <div className="pos-ticket-info">
                  <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                  <span>{o.items.reduce((n, it) => n + it.qty, 0)} items</span>
                </div>
                <span className={`status-pill status-${o.status}`}>{o.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="pos-panel">
        <h3>New Order</h3>
        <p className="pos-sub">Build an order from the menu to the left.</p>

        <div className="pos-tabs">
          {ORDER_TYPES.map((t) => (
            <button key={t} type="button" className={t === orderType ? 'active' : ''} onClick={() => setOrderType(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="pos-order-list">
          {cart.length === 0 ? (
            <p className="pos-empty-cart">No items yet — tap "Add to Dish" on the left.</p>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="pos-order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <div className="name">{item.name}</div>
                  <div className="qty-line">
                    <button type="button" onClick={() => decFromCart(item.productId)}>−</button>
                    {item.qty}x
                    <button type="button" onClick={() => addToCart(item)}>+</button>
                  </div>
                </div>
                <div className="line-total">{(item.price * item.qty).toFixed(2)}$</div>
              </div>
            ))
          )}
        </div>

        <div className="pos-totals">
          <div className="row"><span>Sub Total</span><span>{subTotal.toFixed(2)}$</span></div>
          <div className="row"><span>Tax 5%</span><span>{tax.toFixed(2)}$</span></div>
          <div className="row total"><span>Total Amount</span><span>{total.toFixed(2)}$</span></div>
        </div>

        <div className="pos-pay-row">
          {PAY_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`pos-pay-btn${payment === m.id ? ' active' : ''}`}
              onClick={() => setPayment(m.id)}
            >
              {m.icon}
              {m.label.split('/')[0]}
            </button>
          ))}
        </div>

        {placeError && <p className="form-error">{placeError}</p>}
        {justPlaced && !placeError && <p style={{ color: 'var(--ap-primary-dark)', fontSize: 12.5, marginBottom: 10 }}>Order placed ✓</p>}

        <button type="button" className="pos-place-btn" disabled={cart.length === 0 || placing} onClick={placeOrder}>
          {placing ? 'Placing…' : 'Place Order'}
        </button>
      </aside>
    </div>
  );
}
