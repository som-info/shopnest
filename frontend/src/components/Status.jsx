/** Small helpers for loading / error / empty states. */
export function Loader({ label = 'Loading…' }) {
  return <div className="status" role="status"><span className="spinner" />{label}</div>;
}

export function ErrorMessage({ message }) {
  return <div className="status status--error" role="alert">⚠️ {message}</div>;
}
