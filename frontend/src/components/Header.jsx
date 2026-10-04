import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Header() {
  const { count } = useCart();

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo">
          <span aria-hidden="true">🪺</span> ShopNest
        </Link>
        <nav className="nav">
          <NavLink to="/" end>Shop</NavLink>
          <NavLink to="/cart" className="cart-link">
            Cart
            {count > 0 && <span className="badge" aria-label={`${count} items in cart`}>{count}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
