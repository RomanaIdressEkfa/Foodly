const Booking = require('../models/Booking');
const { getBookingSettings } = require('./bookingSettings');

function toMinutes(time) {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + (m || 0);
}

// Ids of tables with a non-cancelled booking that overlaps `time` on `date`,
// using the admin-configurable hold window (Admin > Settings > Booking).
async function bookedTableIds(date, time) {
  const settings = await getBookingSettings();
  const target = toMinutes(time);
  const sameDay = await Booking.find({ date, status: { $ne: 'cancelled' } }).select('table time');
  return sameDay
    .filter((b) => Math.abs(toMinutes(b.time) - target) < settings.holdMinutes)
    .map((b) => String(b.table));
}

module.exports = { bookedTableIds };
