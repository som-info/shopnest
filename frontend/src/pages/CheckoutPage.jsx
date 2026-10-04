import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils.js';

const EMPTY_FORM = { full_name: '', email: '', address: '', city: '', postal_code: '' };

const FIELDS = [
  { name: 'full_name', label: 'Full name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'address', label: 'Street address', autoComplete: 'street-address' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'postal_code', label: 'Postal code', autoComplete: 'postal-code' },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0 && !submitting) return <Navigate to="/cart" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const order = await createOrder({
        ...form,
        // Only IDs and quantities are sent – the server is the source of truth for prices.
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      });
      clearCart();
      navigate(`/order/${order.id}`, { state: { order } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <Link to="/cart" className="back-link">← Back to cart</Link>
      <h1>Checkout</h1>
      <div className="cart">
        <form className="form" onSubmit={handleSubmit}>
          {FIELDS.map(({ name, label, type = 'text', autoComplete }) => (
            <label key={name} className="field">
              <span>{label}</span>
              <input
                className="input"
                name={name}
                type={type}
                autoComplete={autoComplete}
                value={form[name]}
                onChange={handleChange}
                required
              />
            </label>
          ))}
          {error && <div className="status status--error" role="alert">{error}</div>}
          <button className="btn btn--block" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place order · ${formatPrice(subtotal)}`}
          </button>
          <p className="muted small">This is a demo store – no payment is taken.</p>
        </form>

        <aside className="summary">
          <h2>Your items</h2>
          {items.map((item) => (
            <div key={item.id} className="summary__row">
              <span>{item.quantity} × {item.name}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary__row summary__total"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
        </aside>
      </div>
    </>
  );
}
