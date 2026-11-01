const mongoose = require('mongoose');

const BookingItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: Number,
    image: String,
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    tableName: String,
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    partySize: { type: Number, required: true, min: 1 },
    items: [BookingItemSchema],
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
