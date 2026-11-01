const mongoose = require('mongoose');

const time = { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ };

// Single document (key: 'booking') holding the admin-editable booking rules.
const BookingSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'booking', unique: true },
    enabled: { type: Boolean, default: true },
    openTime: { ...time, default: '11:00' },
    lastBookingTime: { ...time, default: '22:30' },
    slotMinutes: { type: Number, enum: [15, 30, 60], default: 30 },
    dinnerStart: { ...time, default: '16:00' },
    holdMinutes: { type: Number, min: 30, max: 360, default: 120 },
    daysAhead: { type: Number, min: 1, max: 90, default: 14 },
    maxGuests: { type: Number, min: 0, max: 50, default: 0 }, // 0 = largest table
    closedDays: { type: [Number], default: [] }, // 0 = Sunday … 6 = Saturday
  },
  { timestamps: true }
);

module.exports = mongoose.models.BookingSettings || mongoose.model('BookingSettings', BookingSettingsSchema);
