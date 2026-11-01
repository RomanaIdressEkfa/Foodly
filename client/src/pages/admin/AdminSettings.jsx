import { useEffect, useState } from 'react';
import api from '../../api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminSettings() {
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

  if (!settings) return <p>Loading…</p>;

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
