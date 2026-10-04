import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/client.js';
import { ErrorMessage, Loader } from '../components/Status.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils.js';

export default function ProductPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null);
    setError('');
    getProduct(slug).then(setProduct).catch((err) => setError(err.message));
  }, [slug]);

  if (error) return <ErrorMessage message={error} />;
  if (!product) return <Loader />;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      <Link to="/" className="back-link">← Back to shop</Link>
      <article className="product">
        <img className="product__image" src={product.image_url} alt={product.name} />
        <div className="product__info">
          <span className="card__category">{product.category.name}</span>
          <h1>{product.name}</h1>
          <p className="price price--large">{formatPrice(product.price)}</p>
          <p className="product__description">{product.description}</p>
          <p className={product.in_stock ? 'stock' : 'stock stock--out'}>
            {product.in_stock ? `${product.stock} in stock` : 'Currently out of stock'}
          </p>

          {product.in_stock && (
            <div className="product__actions">
              <label className="sr-only" htmlFor="qty">Quantity</label>
              <input
                id="qty"
                type="number"
                className="input qty"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))
                }
              />
              <button className="btn" onClick={handleAdd}>
                {added ? '✓ Added' : 'Add to cart'}
              </button>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
