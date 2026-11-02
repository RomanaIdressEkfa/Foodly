import { useEffect, useState } from 'react';
import api from '../../api';
import ImageUploadField from '../../components/ImageUploadField.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TABS = [
  { key: 'booking', label: 'Table Booking' },
  { key: 'site', label: 'Restaurant & Checkout' },
  { key: 'hero', label: 'Hero Carousel' },
  { key: 'account', label: 'My Account' },
];

function BookingSettingsForm() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bookings/settings').then(({ data }) => setSettings(data.settings));
  }, []);

  function set(field) {
    return (e) => setSettings((s) => ({ ...s, [field]: e.target.value }));
  }

  function toggleDay(day) {
    setSettings((s) => {
      const closedDays = s.closedDays.includes(day)
        ? s.closedDays.filter((d) => d !== day)
        : [...s.closedDays, day];
      return { ...s, closedDays };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const payload = {
        ...settings,
        slotMinutes: Number(settings.slotMinutes),
        holdMinutes: Number(settings.holdMinutes),
        daysAhead: Number(settings.daysAhead),
        maxGuests: Number(settings.maxGuests),
      };
      const { data } = await api.put('/bookings/settings', payload);
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="page-loading">Loading…</p>;

  return (
    <form className="admin-form settings-form" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      <h3>Table Booking Settings</h3>
      <p className="admin-hint">Controls the Book a Table page — opening hours, how long a table is held, and how far ahead guests can book.</p>

      <label className="checkbox-row" style={{ marginTop: 18 }}>
        <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} />
        Online table booking enabled
      </label>

      <div className="form-row">
        <div>
          <label>Opens at</label>
          <input type="time" value={settings.openTime} onChange={set('openTime')} />
        </div>
        <div>
          <label>Last booking time</label>
          <input type="time" value={settings.lastBookingTime} onChange={set('lastBookingTime')} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Time slot length</label>
          <select value={settings.slotMinutes} onChange={set('slotMinutes')}>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every hour</option>
          </select>
        </div>
        <div>
          <label>Dinner starts at</label>
          <input type="time" value={settings.dinnerStart} onChange={set('dinnerStart')} />
        </div>
      </div>
      <p className="admin-hint">Times before this split into "Lunch" on the booking page, times at or after it into "Dinner".</p>

      <div className="form-row">
        <div>
          <label>Hold a table for (minutes)</label>
          <input type="number" min="30" max="360" step="15" value={settings.holdMinutes} onChange={set('holdMinutes')} />
        </div>
        <div>
          <label>Guests can book up to (days ahead)</label>
          <input type="number" min="1" max="90" value={settings.daysAhead} onChange={set('daysAhead')} />
        </div>
      </div>
      <p className="admin-hint">
        A table booked at a given time is shown as unavailable for other bookings within this many minutes before or after it.
      </p>

      <label>Max guests per online booking (0 = use the biggest table)</label>
      <input type="number" min="0" max="50" value={settings.maxGuests} onChange={set('maxGuests')} />

      <label>Closed days</label>
      <div className="weekday-row">
        {WEEKDAYS.map((label, day) => (
          <button
            key={day}
            type="button"
            className={`weekday-chip${settings.closedDays.includes(day) ? ' active' : ''}`}
            onClick={() => toggleDay(day)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="admin-hint">Highlighted days are closed for bookings.</p>

      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-solid" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="settings-saved">Saved ✓</span>}
      </div>
    </form>
  );
}

function SiteSettingsForm() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings/site').then(({ data }) => setSettings(data.settings));
  }, []);

  function set(field) {
    return (e) => setSettings((s) => ({ ...s, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const { data } = await api.put('/settings/site', {
        ...settings,
        minOrderAmount: Number(settings.minOrderAmount) || 0,
        estimatedDeliveryMinutes: Number(settings.estimatedDeliveryMinutes) || 0,
      });
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="page-loading">Loading…</p>;

  return (
    <form className="admin-form settings-form" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      <h3>Restaurant Profile</h3>
      <p className="admin-hint">Shown in the site footer and used for checkout rules.</p>

      <label>Restaurant name</label>
      <input value={settings.restaurantName} onChange={set('restaurantName')} />

      <div className="form-row">
        <div>
          <label>Phone</label>
          <input value={settings.phone} onChange={set('phone')} placeholder="+1 555 123 4567" />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={settings.email} onChange={set('email')} placeholder="hello@foodly.com" />
        </div>
      </div>

      <label>Address</label>
      <textarea rows={3} value={settings.address} onChange={set('address')} placeholder={'123 Main Street\nSpringfield'} />
      <p className="admin-hint">One line per address row — shown in the footer exactly as entered.</p>

      <h3 style={{ marginTop: 10 }}>Checkout Rules</h3>
      <div className="form-row">
        <div>
          <label>Minimum order amount ($, 0 = no minimum)</label>
          <input type="number" min="0" step="0.5" value={settings.minOrderAmount} onChange={set('minOrderAmount')} />
        </div>
        <div>
          <label>Estimated delivery time (minutes)</label>
          <input type="number" min="5" step="5" value={settings.estimatedDeliveryMinutes} onChange={set('estimatedDeliveryMinutes')} />
        </div>
      </div>
      <p className="admin-hint">Shown to customers at checkout.</p>

      <label>Cash on Delivery note</label>
      <textarea rows={2} value={settings.codNote} onChange={set('codNote')} />
      <p className="admin-hint">Shown on the Checkout page.</p>

      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-solid" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="settings-saved">Saved ✓</span>}
      </div>
    </form>
  );
}

function AccountSettingsForm() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name, email: user.email }));
  }, [user]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/auth/me', {
        name: form.name,
        email: form.email,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });
      await refresh();
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save account changes.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <p className="page-loading">Loading…</p>;

  return (
    <form className="admin-form settings-form" onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <h3>My Account</h3>
      <p className="admin-hint">Update your own name, email, or password.</p>

      <label>Name</label>
      <input required value={form.name} onChange={set('name')} />

      <label>Email</label>
      <input type="email" required value={form.email} onChange={set('email')} />

      <h3 style={{ marginTop: 10 }}>Change Password</h3>
      <p className="admin-hint">Leave blank to keep your current password.</p>

      <label>Current password</label>
      <input type="password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />

      <div className="form-row">
        <div>
          <label>New password</label>
          <input type="password" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
        </div>
        <div>
          <label>Confirm new password</label>
          <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-solid" disabled={saving}>
          {saving ? 'Saving…' : 'Save Account'}
        </button>
        {saved && <span className="settings-saved">Saved ✓</span>}
      </div>
    </form>
  );
}

const EMPTY_SLIDE = { title: '', category: '', description: '', image: '', price: '', rating: '', active: true };

function HeroCarouselForm() {
  const [slides, setSlides] = useState(null);
  const [form, setForm] = useState(EMPTY_SLIDE);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    return api.get('/heroSlides', { params: { all: true } }).then(({ data }) => setSlides(data.slides));
  }

  useEffect(() => { load(); }, []);

  function startEdit(slide) {
    setEditingId(slide._id);
    setForm({
      title: slide.title,
      category: slide.category || '',
      description: slide.description || '',
      image: slide.image || '',
      price: slide.price ?? '',
      rating: slide.rating ?? '',
      active: slide.active,
    });
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_SLIDE);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      rating: Number(form.rating) || 4.5,
    };
    try {
      if (editingId) await api.put(`/heroSlides/${editingId}`, payload);
      else await api.post('/heroSlides', payload);
      resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this slide.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this hero slide?')) return;
    await api.delete(`/heroSlides/${id}`);
    if (editingId === id) resetForm();
    load();
  }

  async function toggleActive(slide) {
    await api.put(`/heroSlides/${slide._id}`, { active: !slide.active });
    load();
  }

  async function move(index, direction) {
    const target = slides[index + direction];
    const current = slides[index];
    if (!target) return;
    await Promise.all([
      api.put(`/heroSlides/${current._id}`, { order: target.order }),
      api.put(`/heroSlides/${target._id}`, { order: current.order }),
    ]);
    load();
  }

  if (!slides) return <p className="page-loading">Loading…</p>;

  return (
    <div className="admin-grid">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Slide' : 'New Slide'}</h3>
        <p className="admin-hint">Controls the homepage hero carousel — independent of the menu, so you can feature whatever you like.</p>

        <label>Title</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <label>Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="form-row">
          <div>
            <label>Tag (e.g. Mains)</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Mains" />
          </div>
          <div>
            <label>Price ($)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>

        <ImageUploadField value={form.image} onChange={(image) => setForm({ ...form, image })} />

        <label>Rating (0–10)</label>
        <input type="number" min="0" max="10" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />

        <label className="checkbox-row">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Show on homepage
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-solid" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Slide'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      <div>
        {slides.length === 0 ? (
          <p className="admin-hint">No slides yet — add one on the left.</p>
        ) : (
          <div className="hero-slide-list">
            {slides.map((slide, i) => (
              <div key={slide._id} className={`hero-slide-row${slide.active ? '' : ' inactive'}${editingId === slide._id ? ' editing' : ''}`}>
                <div className="hero-slide-reorder">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">▲</button>
                  <button type="button" disabled={i === slides.length - 1} onClick={() => move(i, 1)} aria-label="Move down">▼</button>
                </div>
                {slide.image
                  ? <img src={slide.image} alt={slide.title} className="hero-slide-thumb" />
                  : <span className="hero-slide-thumb hero-slide-thumb-empty" />}
                <div className="hero-slide-info">
                  <strong>{slide.title}</strong>
                  <span>{slide.category || 'No tag'} · {Number(slide.price || 0).toFixed(2)}$ · ★ {Number(slide.rating || 0).toFixed(1)}</span>
                </div>
                <div className="hero-slide-actions">
                  <button type="button" className="ap-icon-btn" onClick={() => toggleActive(slide)}>
                    {slide.active ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" className="ap-icon-btn" onClick={() => startEdit(slide)}>Edit</button>
                  <button type="button" className="ap-icon-btn danger" onClick={() => handleDelete(slide._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [tab, setTab] = useState('booking');

  return (
    <div>
      <div className="floor-tabs settings-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'booking' && <BookingSettingsForm />}
      {tab === 'site' && <SiteSettingsForm />}
      {tab === 'hero' && <HeroCarouselForm />}
      {tab === 'account' && <AccountSettingsForm />}
    </div>
  );
}
