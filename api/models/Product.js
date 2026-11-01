const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'Mains', trim: true },
    image: { type: String, default: '' }, // e.g. "/images/garden-salad.jpg"
    rating: { type: Number, default: 4.5, min: 0, max: 10 },
    featured: { type: Boolean, default: false },
    stock: { type: Number, default: 100, min: 0 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);
