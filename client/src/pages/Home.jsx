import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard.jsx';
import HeroSlider from '../components/HeroSlider.jsx';

const FULL_MENU_TILE = { name: 'All', label: 'Full Menu', image: '/images/chicken-salad.jpg', bg: '#f3a3ac' };

// The hero slider shows a more dramatic photo for these two dishes than
// their real product photo — product records stay accurate (Top List, Menu,
// Cart, Product Detail all show the real dish), this only swaps what the
// homepage hero banner displays.
const HERO_IMAGE_OVERRIDES = {
  'Maple Glazed Salmon Fillet': '/images/mutton-curry.png',
  'Garden Salad': '/images/spicy-noodles.png',
};

const WHY_FOODLY = [
  {
    title: 'Order as a Guest',
    text: 'No account, no sign-up form. Add dishes to your cart and check out in a couple of taps.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        <path d="M18 3v5M15.5 5.5h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Cash on Delivery',
    text: "Pay the rider when your food arrives — no card details to enter, nothing charged upfront.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="6" width="20" height="13" rx="3" /><circle cx="12" cy="12.5" r="3.2" />
        <path d="M6 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
      </svg>
    ),
  },
  {
    title: 'Reserve a Table',
    text: 'Pick a table on our live floor plan and pre-order from the menu before you even arrive.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="9" width="16" height="4" rx="1.5" /><path d="M6 13v6M18 13v6M4 9l2-4h12l2 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Fresh, Made to Order',
    text: 'Every dish is cooked after you order it — nothing sits around waiting.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2c2 3-1 4-1 6.5a3.5 3.5 0 0 0 7 0C18 4 14 2 12 2Z" />
        <path d="M5 13c1.5 2-1 2.5-1 4.5a3.5 3.5 0 0 0 7 0c0-3-3-4.5-3-7.5" opacity=".7" />
        <path d="M4 21h16" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products', { params: { featured: true } }).then(({ data }) => {
      setFeatured(data.products);
    });
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
            {featured.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
          <div className="toplist-footer">
            <Link to="/menu" className="btn btn-solid">View All</Link>
          </div>
        </div>
      </section>

      <section className="why-foodly">
        <div className="wrap">
          <div className="section-head">
            <h2>Why Order With Foodly</h2>
            <p>No app, no account, no prepayment — just good food, made simple</p>
          </div>
          <div className="why-grid">
            {WHY_FOODLY.map((item, i) => (
              <div key={item.title} className="why-card" style={{ '--tilt': i % 2 === 0 ? '-10px' : '10px' }}>
                <span className="why-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="booking-promo">
        <div className="wrap booking-promo-inner">
          <div className="booking-promo-text">
            <span className="booking-promo-tag">Dine with us</span>
            <h2>Reserve your table in under a minute</h2>
            <p className="lead">
              Pick a table on our live floor plan, choose your time, and pre-order from the
              menu if you'd like your food ready when you sit down.
            </p>
            <Link to="/book-table" className="btn btn-solid">
              Book a Table
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="booking-promo-art">
            <img src="/images/mutton-curry.png" alt="" className="bp-photo bp-photo-1" />
            <img src="/images/pizza.png" alt="" className="bp-photo bp-photo-2" />
            <span className="bp-blob" aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
