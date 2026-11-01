import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import FloorPlan from '../../components/FloorPlan.jsx';
import { rowSpan } from '../../components/TableShape.jsx';

const EMPTY = { name: '', capacity: 4, shape: 'square', floor: 'Main floor', row: 1, col: 1 };

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    return api.get('/tables').then(({ data }) => setTables(data.tables));
  }

  useEffect(() => {
    load();
  }, []);

  const floors = useMemo(() => [...new Set(tables.map((t) => t.floor))], [tables]);

  // Show unsaved edits on the plan straight away.
  const preview = useMemo(() => {
    const draft = { ...form, _id: editingId || '__draft', capacity: Number(form.capacity) || 1, row: Number(form.row) || 1, col: Number(form.col) || 1 };
    if (editingId) return tables.map((t) => (t._id === editingId ? draft : t));
    return form.name ? [...tables, draft] : tables;
  }, [tables, form, editingId]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function startEdit(table) {
    setEditingId(table._id);
    setForm({
      name: table.name,
      capacity: table.capacity,
      shape: table.shape,
      floor: table.floor,
      row: table.row,
      col: table.col,
    });
    setError('');
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = { ...form, capacity: Number(form.capacity), row: Number(form.row), col: Number(form.col) };
    try {
      if (editingId) await api.put(`/tables/${editingId}`, payload);
      else await api.post('/tables', payload);
      await load();
      reset();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save table.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingId || !confirm(`Delete ${form.name}?`)) return;
    await api.delete(`/tables/${editingId}`);
    await load();
    reset();
  }

  return (
    <div className="admin-tables-layout">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? `Edit ${form.name || 'table'}` : 'New Table'}</h3>
        <p className="admin-hint">Click a table on the plan to edit it.</p>

        <label>Name</label>
        <input required value={form.name} onChange={set('name')} placeholder="e.g. T13" />

        <label>Seats</label>
        <input type="number" min="1" max="20" required value={form.capacity} onChange={set('capacity')} />
        <p className="admin-hint">Square tables with 6+ seats become long tables (2 rows tall).</p>

        <label>Shape</label>
        <div className="shape-toggle">
          {['square', 'round'].map((s) => (
            <button key={s} type="button" className={form.shape === s ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, shape: s }))}>
              {s === 'square' ? 'Square' : 'Round'}
            </button>
          ))}
        </div>

        <label>Floor</label>
        <input list="floor-options" required value={form.floor} onChange={set('floor')} />
        <datalist id="floor-options">
          {floors.map((f) => <option key={f} value={f} />)}
        </datalist>

        <div className="form-row">
          <div>
            <label>Row</label>
            <input type="number" min="1" max="12" required value={form.row} onChange={set('row')} />
          </div>
          <div>
            <label>Column</label>
            <input type="number" min="1" max="12" required value={form.col} onChange={set('col')} />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-solid" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save' : 'Add table'}
          </button>
          {editingId && (
            <>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>
            </>
          )}
        </div>
      </form>

      <div>
        {preview.length === 0 ? (
          <p>No tables yet — add one on the left.</p>
        ) : (
          <FloorPlan
            tables={preview}
            selectedId={editingId || (form.name ? '__draft' : null)}
            onSelect={(t) => t._id !== '__draft' && startEdit(t)}
          />
        )}
        <p className="admin-hint" style={{ marginTop: 10 }}>
          {tables.length} tables · {tables.filter((t) => rowSpan(t) === 2).length} long tables · {tables.reduce((n, t) => n + t.capacity, 0)} seats total
        </p>
      </div>
    </div>
  );
}
