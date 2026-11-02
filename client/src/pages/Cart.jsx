import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

// Falls back to a plate icon if the image 404s — e.g. an item that was in
// someone's cart before its product photo got removed from the catalog.
function CartItemImage({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div className="cart-row-img-fallback">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z" /><path d="M12 8v4l3 3" strokeLinecap="round" /></svg>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setBroken(true)} />;
}

export default function Cart() {
  const { items, setQty, removeItem, total } = useCart();

  return (
    <section className="cart-page">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 28 }}>
          <h2>Your Cart</h2>
        </div>

        {items.length === 0 ? (
          <p>
            Your cart is empty. <Link to="/menu">Browse the menu</Link>.
          </p>
        ) : (
          <>
            <div className="cart-list">
              {items.map((item) => (
                <div key={item.productId} className="cart-row">
                  <CartItemImage src={item.image} alt={item.name} />
                  <div className="cart-row-info">
                    <h4>{item.name}</h4>
                    <span>{item.price}$</span>
                  </div>
                  <div className="qty-stepper">
                    <button type="button" onClick={() => setQty(item.productId, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
                  </div>
                  <span className="cart-row-total">{(item.price * item.qty).toFixed(2)}$</span>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <span>Total</span>
              <strong>{total.toFixed(2)}$</strong>
            </div>
            <Link to="/checkout" className="btn btn-solid">Checkout</Link>
          </>
        )}
      </div>
    </section>
  );
}
