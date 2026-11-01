import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <section className="order-success">
        <div className="wrap">
          <p>
            No order found. <Link to="/menu">Back to menu</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="order-success">
      <div className="wrap">
        <div className="success-badge">✓</div>
        <h2>Thanks, your order is in!</h2>
        <p className="auth-sub">
          Order #{order._id.slice(-6).toUpperCase()} — {order.total.toFixed(2)}$ · Cash on Delivery
        </p>
        <div className="cart-list">
          {order.items.map((item) => (
            <div key={item.name} className="cart-row">
              {item.image && <img src={item.image} alt={item.name} />}
              <div className="cart-row-info">
                <h4>{item.name}</h4>
                <span>Qty {item.qty}</span>
              </div>
              <span className="cart-row-total">{(item.price * item.qty).toFixed(2)}$</span>
            </div>
          ))}
        </div>
        <Link to="/menu" className="btn btn-solid" style={{ marginTop: 24 }}>
          Back to Menu
        </Link>
      </div>
    </section>
  );
}
