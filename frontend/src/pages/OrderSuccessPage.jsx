import { Link, useLocation, useParams } from 'react-router-dom';
import { formatPrice } from '../utils.js';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const order = useLocation().state?.order;

  return (
    <div className="empty">
      <div className="success-icon" aria-hidden="true">✓</div>
      <h1>Thank you for your order!</h1>
      <p>
        Order <strong>#{id}</strong> has been received
        {order && <> – a confirmation will be sent to <strong>{order.email}</strong></>}.
      </p>
      {order && <p className="price price--large">{formatPrice(order.total)}</p>}
      <Link to="/" className="btn">Continue shopping</Link>
    </div>
  );
}
