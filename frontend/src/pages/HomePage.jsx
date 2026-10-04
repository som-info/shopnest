import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import { ErrorMessage, Loader } from '../components/Status.jsx';

export default function HomePage() {
  // Filters live in the URL so results are shareable and survive refreshes.
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const ordering = params.get('ordering') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getProducts({ category, search, ordering })
      .then((data) => !cancelled && setProducts(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [category, search, ordering]);

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    if (searchInput.trim() === search) return undefined;
    const id = setTimeout(() => updateParam('search', searchInput.trim()), 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  function updateParam(key, value) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }

  return (
    <>
      <section className="hero">
        <h1>Thoughtfully picked goods for everyday life</h1>
        <p>Browse our curated collection of tech, home essentials, fashion and books.</p>
      </section>

      <section className="toolbar" aria-label="Product filters">
        <input
          type="search"
          className="input"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search products"
        />
        <select
          className="input select"
          value={ordering}
          onChange={(e) => updateParam('ordering', e.target.value)}
          aria-label="Sort products"
        >
          <option value="">Newest</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
          <option value="name">Name: A–Z</option>
        </select>
      </section>

      <div className="chips" role="tablist" aria-label="Categories">
        <button
          className={`chip ${!category ? 'chip--active' : ''}`}
          onClick={() => updateParam('category', '')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${category === c.slug ? 'chip--active' : ''}`}
            onClick={() => updateParam('category', c.slug)}
          >
            {c.name} <span className="chip__count">{c.product_count}</span>
          </button>
        ))}
      </div>

      {loading && <Loader label="Loading products…" />}
      {error && <ErrorMessage message={`Could not load products. ${error}`} />}
      {!loading && !error && products.length === 0 && (
        <div className="status">No products match your filters.</div>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </>
  );
}
