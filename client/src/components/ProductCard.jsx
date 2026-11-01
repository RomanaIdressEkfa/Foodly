import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { categoryStyle } from '../lib/categoryMeta.jsx';

export default function ProductCard({ product, featured = false, index = 0 }) {
  const { addItem } = useCart();
  const { bg } = categoryStyle(index);

  return (
    <article className={`food-card${featured ? ' featured' : ''}`} style={{ background: bg }}>
      <Link to={`/product/${product._id}`} className="plate" aria-label={product.name}>
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="rating">
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--star)' }}>
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z" />
        </svg>
        <span>{product.rating?.toFixed(1)}</span>
      </div>
      <Link to={`/product/${product._id}`} className="card-title-link">
        <h3>{product.name}</h3>
      </Link>
      <p>{product.description}</p>
      <div className="card-bottom">
        <span className="price">{product.price}$</span>
        <button
          type="button"
          className="plus-btn"
          onClick={() => addItem(product, 1)}
          aria-label={`Add ${product.name} to cart`}
        >
          +
        </button>
      </div>
    </article>
  );
}
