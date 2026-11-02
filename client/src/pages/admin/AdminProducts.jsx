import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import ImageUploadField from '../../components/ImageUploadField.jsx';
import { categoryIcon, categoryStyle } from '../../lib/categoryMeta.jsx';

const EMPTY = {
  name: '',
  description: '',
  price: '',
  category: 'Mains',
  image: '',
  rating: 4.5,
  featured: false,
  stock: 50,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  function load() {
    api.get('/products').then(({ data }) => setProducts(data.products));
  }

  useEffect(load, []);
  useEffect(() => {
    api.get('/categories').then(({ data }) => setAllCategories(data.categories));
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const visible = products.filter((p) => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function startEdit(p) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      rating: p.rating,
      featured: p.featured,
      stock: p.stock,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, price: Number(form.price), rating: Number(form.rating), stock: Number(form.stock) };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save product.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <div className="admin-grid">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Product' : 'New Product'}</h3>
        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="form-row">
          <div>
            <label>Price ($)</label>
            <input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {allCategories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <ImageUploadField value={form.image} onChange={(image) => setForm({ ...form, image })} />

        <div className="form-row">
          <div>
            <label>Rating</label>
            <input type="number" min="0" max="10" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          </div>
          <div>
            <label>Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured on homepage
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-solid">{editingId ? 'Save Changes' : 'Add Product'}</button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      <div>
        <label className="admin-search" style={{ maxWidth: '100%', marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            type="search"
            placeholder="Search product here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="ap-category-row">
          {categories.map((c, i) => {
            const count = c === 'All' ? products.length : products.filter((p) => p.category === c).length;
            const style = categoryStyle(i);
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                className={`ap-category-tile${active ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >
                <span className="ap-cat-icon" style={{ background: style.bg, color: style.fg }}>
                  {categoryIcon(c)}
                </span>
                {c}
                <span className="ap-cat-count">{count} items</span>
              </button>
            );
          })}
        </div>

        <div className="ap-product-grid">
          {visible.map((p) => (
            <div key={p._id} className="ap-product-card">
              <div className="ap-product-photo">
                <img src={p.image} alt={p.name} />
                {p.featured && <span className="ap-product-badge">Featured</span>}
              </div>
              <div className="ap-product-body">
                <strong>{p.name}</strong>
                <div className="ap-product-meta">
                  <span>{p.category}</span>
                  <span className="ap-product-price">{p.price}$</span>
                </div>
                <div className="ap-product-actions">
                  <button type="button" className="ap-icon-btn" onClick={() => startEdit(p)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                    Edit
                  </button>
                  <button type="button" className="ap-icon-btn danger" onClick={() => handleDelete(p._id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && <p>No products match.</p>}
        </div>
      </div>
    </div>
  );
}
