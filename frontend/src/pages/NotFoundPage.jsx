import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn">Back to shop</Link>
    </div>
  );
}
