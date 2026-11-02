import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FULL_MENU_TILE = { name: 'All', label: 'Full Menu', image: '/images/chicken-salad.jpg', bg: '#f3a3ac' };

// A warm cream/caramel pair for the non-dark Quick Delivery cards — the
// generic food category palette (green salads, yellow soups…) doesn't fit
// coffee drinks and clashed with the sage Signature Dishes section above it.
const QUICK_STYLES = [
  { bg: '#f4e6c8', fg: '#a3761c' },
  { bg: '#ecd5ae', fg: '#8a5a2e' },
];

// The hero slider shows a more dramatic photo for these two dishes than
// their real product photo — product records stay accurate (Top List, Menu,
// Cart, Product Detail all show the real dish), this only swaps what the
// homepage hero banner displays.
const HERO_IMAGE_OVERRIDES = {
  'Maple Glazed Salmon Fillet': '/images/mutton-curry.png',
  'Garden Salad': '/images/spicy-noodles.png',
};

export default function Home() {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [featured, setFeatured] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products', { params: { featured: true } }).then(({ data }) => {
      setFeatured(data.products);
    });
    api.get('/products', { params: { category: 'Drinks' } }).then(({ data }) => setDrinks(data.products));
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  // Home shows up to 7 real categories plus the "Full Menu" tile — the
  // Categories page (via "View All") shows every category, unlimited.
  const homeCategories = [...categories.slice(0, 7), FULL_MENU_TILE];

  const sliderItems = featured.map((p) => ({
    id: p._id,
    title: p.name,
    category: p.category,
    description: p.description,
    image: HERO_IMAGE_OVERRIDES[p.name] || p.image,
    price: p.price,
    rating: p.rating,
  }));

  return (
    <>
      <HeroSlider items={sliderItems} />

      <section className="home-categories">
        <div className="wrap">
          <div className="home-cat-head">
            <h2>Categories</h2>
            <Link to="/categories">View All</Link>
          </div>
          <div className="cat-tile-row">
            {homeCategories.map((cat) => {
              const to = cat.name === 'All' ? '/menu' : `/menu?category=${encodeURIComponent(cat.name)}`;
              const label = cat.label || cat.name;
              return (
                <Link key={cat.name} to={to} className="cat-tile" style={{ background: cat.bg }}>
                  <span className="cat-tile-photo">
                    <img src={cat.image} alt={label} />
                  </span>
                  <span className="cat-tile-label">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="toplist" id="toplist">
        <div className="wrap">
          <div className="section-head">
            <h2>Top&nbsp;&nbsp;List</h2>
            <p>All Our Best Plats In One Delicious Snap</p>
          </div>
          <div className="cards">
            {featured.slice(0, 6).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
          <div className="toplist-footer">
            <Link to="/menu" className="btn btn-solid">View All</Link>
          </div>
        </div>
      </section>

      <section className="signature-dishes">
        <div className="wrap">
          <div className="section-head">
            <span className="section-eyebrow">Popular Choice</span>
            <h2 className="section-flourish-title">Our Signature Dishes</h2>
          </div>
          <div className="signature-grid">
            {featured.slice(0, 3).map((p) => (
              <div key={p._id} className="signature-card">
                <div className="signature-photo">
                  <span className="signature-blob" />
                  <img src={p.image} alt={p.name} />
                </div>
                <h3>{p.name}</h3>
                <span className="signature-price">{p.price.toFixed(2)}$</span>
                <Link to={`/product/${p._id}`} className="btn btn-solid btn-sm">
                  Order Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quick-delivery">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'left' }}>
            <h2>Quick Delivery</h2>
          </div>
          <div className="quick-grid">
            {drinks.slice(0, 3).map((p, i) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className={`quick-card${i === 0 ? ' quick-card-dark' : ''}`}
                style={i === 0 ? undefined : { background: QUICK_STYLES[(i - 1) % QUICK_STYLES.length].bg }}
              >
                <div className="quick-photo">
                  <span className="quick-photo-blob" />
                  <img src={p.image} alt={p.name} />
                  <span className="quick-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" /><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M7 3c-.5 1 .5 1.5 0 2.5M11 3c-.5 1 .5 1.5 0 2.5" strokeLinecap="round" /></svg>
                  </span>
                </div>
                <div className="quick-body">
                  <strong>{p.name}</strong>
                  <span className="quick-sub">{p.description}</span>
                  <div className="quick-row">
                    <span className="quick-price" style={i === 0 ? undefined : { color: QUICK_STYLES[(i - 1) % QUICK_STYLES.length].fg }}>{p.price.toFixed(2)}$</span>
                    <span className="quick-btn-group">
                      <span className="quick-icon-btn" title={`${p.rating?.toFixed(1)} rating`}>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z" /></svg>
                      </span>
                      <button
                        type="button"
                        className="quick-icon-btn quick-add"
                        aria-label={`Add ${p.name} to cart`}
                        onClick={(e) => { e.preventDefault(); addItem(p, 1); showToast(`${p.name} added to cart`); }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
