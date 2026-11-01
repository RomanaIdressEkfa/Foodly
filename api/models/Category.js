const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    bg: { type: String, required: true },
    fg: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
