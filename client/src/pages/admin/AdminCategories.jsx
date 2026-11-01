import { useEffect, useState } from 'react';
import api from '../../api';
import ImageUploadField from '../../components/ImageUploadField.jsx';
import { CATEGORY_STYLES } from '../../lib/categoryMeta.jsx';

const EMPTY = { name: '', image: '', colorIndex: 0 };

function colorIndexFor(cat) {
  const i = CATEGORY_STYLES.findIndex((s) => s.bg === cat.bg && s.fg === cat.fg);
  return i === -1 ? 0 : i;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }

  useEffect(load, []);

  function startEdit(cat) {
    setEditingId(cat._id);
    setForm({ name: cat.name, image: cat.image || '', colorIndex: colorIndexFor(cat) });
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const { bg, fg } = CATEGORY_STYLES[form.colorIndex];
    const payload = { name: form.name, image: form.image, bg, fg };
    try {
      if (editingId) await api.put(`/categories/${editingId}`, payload);
      else await api.post('/categories', payload);
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    if (editingId === id) resetForm();
    load();
  }

  return (
    <div className="admin-grid">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Category' : 'New Category'}</h3>

        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <ImageUploadField value={form.image} onChange={(image) => setForm({ ...form, image })} />

        <label>Color</label>
        <div className="color-swatch-row">
          {CATEGORY_STYLES.map((style, i) => (
            <button
              key={i}
              type="button"
              className={`color-swatch${form.colorIndex === i ? ' active' : ''}`}
              style={{ background: style.bg, borderColor: style.fg }}
              aria-label={`Color option ${i + 1}`}
              onClick={() => setForm({ ...form, colorIndex: i })}
            />
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-solid" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Save Category'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      <div>
        <div className="ap-product-grid">
          {categories.map((cat) => (
            <div key={cat._id} className={`ap-product-card${editingId === cat._id ? ' in-cart' : ''}`}>
              <div className="ap-product-photo">
                {cat.image && <img src={cat.image} alt={cat.name} />}
                <span className="ap-product-badge" style={{ background: cat.bg, color: cat.fg }}>
                  {cat.name}
                </span>
              </div>
              <div className="ap-product-body">
                <strong>{cat.name}</strong>
                <div className="ap-product-actions">
                  <button type="button" className="ap-icon-btn" onClick={() => startEdit(cat)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                    Edit
                  </button>
                  <button type="button" className="ap-icon-btn danger" onClick={() => handleDelete(cat._id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p>No categories yet.</p>}
        </div>
      </div>
    </div>
  );
}
