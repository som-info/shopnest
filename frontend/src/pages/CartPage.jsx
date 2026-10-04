import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils.js';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>
        <p>Looks like you haven’t added anything yet.</p>
        <Link to="/" className="btn">Start shopping</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      <div className="cart">
        <ul className="cart__list">
          {items.map((item) => (
            <li key={item.id} className="cart-item">
              <img src={item.image_url} alt="" />
              <div className="cart-item__info">
                <Link to={`/products/${item.slug}`}>{item.name}</Link>
                <span className="muted">{formatPrice(item.price)} each</span>
              </div>
              <div className="qty-control" aria-label={`Quantity for ${item.name}`}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">−</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
              <strong className="cart-item__total">{formatPrice(item.price * item.quantity)}</strong>
              <button className="link-btn" onClick={() => removeItem(item.id)}>Remove</button>
            </li>
          ))}
        </ul>

        <aside className="summary">
          <h2>Order summary</h2>
          <div className="summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary__row"><span>Shipping</span><span>Free</span></div>
          <div className="summary__row summary__total"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
          <Link to="/checkout" className="btn btn--block">Proceed to checkout</Link>
        </aside>
      </div>
    </>
  );
}
