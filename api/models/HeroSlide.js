const mongoose = require('mongoose');

// Admin-managed homepage hero carousel slides — decoupled from Product data
// so the admin can set whatever title/photo/text they want, independent of
// what's actually in the menu.
const HeroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    // Small eyebrow label (e.g. "Mains") — also used as the "Order Now" link's
    // ?category= target and the accent color key, matching HeroSlider.jsx.
    category: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 10 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.HeroSlide || mongoose.model('HeroSlide', HeroSlideSchema);
