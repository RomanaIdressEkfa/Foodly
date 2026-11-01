const BookingSettings = require('../models/BookingSettings');

const EDITABLE = ['enabled', 'openTime', 'lastBookingTime', 'slotMinutes', 'dinnerStart', 'holdMinutes', 'daysAhead', 'maxGuests', 'closedDays'];

async function getBookingSettings() {
  return BookingSettings.findOneAndUpdate(
    { key: 'booking' },
    { $setOnInsert: { key: 'booking' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

function toMinutes(time) {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + (m || 0);
}

function toTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

// Every bookable start time between opening and the last booking time.
function timeSlots(settings) {
  const slots = [];
  for (let m = toMinutes(settings.openTime); m <= toMinutes(settings.lastBookingTime); m += settings.slotMinutes) {
    slots.push(toTime(m));
  }
  return slots;
}

function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Returns an error message if date/time break the admin's booking rules.
function checkBookingRules(settings, date, time) {
  if (!settings.enabled) return 'Online table booking is currently closed';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Invalid date';

  const today = localDate();
  const limit = new Date();
  limit.setDate(limit.getDate() + settings.daysAhead - 1);
  if (date < today) return 'That date has already passed';
  if (date > localDate(limit)) return `Bookings can only be made up to ${settings.daysAhead} days ahead`;

  const weekday = new Date(`${date}T00:00:00`).getDay();
  if (settings.closedDays.includes(weekday)) return 'The restaurant is closed on that day';

  if (!timeSlots(settings).includes(time)) return 'Please choose one of the available booking times';
  if (date === today) {
    const now = new Date();
    if (toMinutes(time) <= now.getHours() * 60 + now.getMinutes()) return 'That time has already passed';
  }
  return null;
}

function pickSettings(body) {
  const out = {};
  for (const key of EDITABLE) if (body?.[key] !== undefined) out[key] = body[key];
  if (out.closedDays) out.closedDays = [...new Set(out.closedDays.map(Number))].filter((d) => d >= 0 && d <= 6);
  return out;
}

module.exports = { getBookingSettings, timeSlots, checkBookingRules, pickSettings, toMinutes };
