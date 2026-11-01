const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    capacity: { type: Number, required: true, min: 1 },
    shape: { type: String, enum: ['square', 'round'], default: 'square' },
    floor: { type: String, default: 'Main floor', trim: true },
    row: { type: Number, default: 1, min: 1 },
    col: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Table || mongoose.model('Table', TableSchema);
