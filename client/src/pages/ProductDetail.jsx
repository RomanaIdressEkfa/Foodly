import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const INGREDIENT_ICONS = [
  { label: 'Tomato', color: '#d9443a' },
  { label: 'Onion', color: '#b56fc1' },
  { label: 'Lettuce', color: '#7fa05a' },
  { label: 'Cucumber', color: '#6b9e4a' },
  { label: 'Herbs', color: '#4f7a3f' },
  { label: 'Pepper', color: '#e3a33b' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setError('Could not load this dish.'));
  }, [id]);

  if (error) return <div className="page-loading">{error}</div>;
  if (!product) return <div className="page-loading">Loading…</div>;

  function handleAdd() {
    addItem(product, qty);
    showToast(`${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="pd-page">
      <div className="pd-hero">
        <div className="pd-hero-top">
          <button type="button" className="pd-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="pd-icon-group">
            <Link to="/menu" className="pd-icon-btn" aria-label="Search menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            </Link>
            <Link to="/menu" className="pd-icon-btn" aria-label="All dishes">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            </Link>
          </div>
        </div>
        <h1>{product.name}</h1>
        <p className="pd-meta">{product.category} · {product.rating?.toFixed(1)} ★</p>
      </div>

      <div className="pd-plate">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="pd-body wrap">
        <div className="pd-price-row">
          <span className="pd-price">{product.price}$</span>
          <div className="qty-stepper">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
          </div>
        </div>

        <h2 className="pd-section-title">Ingredients</h2>
        <div className="ingredient-row">
          {INGREDIENT_ICONS.map((ing) => (
            <div key={ing.label} className="ingredient-chip" title={ing.label}>
              <span style={{ background: ing.color }} />
            </div>
          ))}
        </div>

        <h2 className="pd-section-title">Description</h2>
        <p className="pd-description">{product.description}</p>
      </div>

      <button type="button" className="pd-fab" onClick={handleAdd} aria-label="Add to cart">
        {added ? '✓' : '+'}
      </button>
    </div>
  );
}
