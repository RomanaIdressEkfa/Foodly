import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

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
                  <img src={item.image} alt={item.name} />
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
