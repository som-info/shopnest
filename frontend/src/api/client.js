/**
 * Minimal API client for the ShopNest Django backend.
 * All functions return parsed JSON or throw an Error with a readable message.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(extractError(data) || `Request failed (${res.status})`);
  }
  return data;
}

/** Flatten DRF validation errors ({field: [msg]}) into a single string. */
function extractError(data) {
  if (!data) return '';
  if (typeof data.detail === 'string') return data.detail;
  return Object.entries(data)
    .map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.flat().map(String).join(' ') : String(msgs);
      return field === 'non_field_errors' || field === 'items' ? text : `${field}: ${text}`;
    })
    .join(' ');
}

export function getCategories() {
  return request('/categories/');
}

export function getProducts({ category, search, ordering } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  if (ordering) params.set('ordering', ordering);
  const qs = params.toString();
  return request(`/products/${qs ? `?${qs}` : ''}`);
}

export function getProduct(slug) {
  return request(`/products/${encodeURIComponent(slug)}/`);
}

export function createOrder(payload) {
  return request('/orders/', { method: 'POST', body: JSON.stringify(payload) });
}
