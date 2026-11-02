const mongoose = require('mongoose');

// Singleton document (key: 'site') — restaurant profile + checkout rules,
// editable from Admin Settings instead of being hardcoded in the UI.
const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    restaurantName: { type: String, default: 'Foodly' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    email: { type: String, default: '' },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    codNote: { type: String, default: 'Cash on Delivery — pay the rider when your order arrives.' },
    estimatedDeliveryMinutes: { type: Number, default: 45, min: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
