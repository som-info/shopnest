import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils.js';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <article className="card">
      <Link to={`/products/${product.slug}`} className="card__image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {!product.in_stock && <span className="tag tag--muted">Sold out</span>}
      </Link>
      <div className="card__body">
        <span className="card__category">{product.category.name}</span>
        <Link to={`/products/${product.slug}`} className="card__title">{product.name}</Link>
        <div className="card__footer">
          <span className="price">{formatPrice(product.price)}</span>
          <button
            className="btn btn--small"
            onClick={() => addItem(product)}
            disabled={!product.in_stock}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
