const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: Number,
    image: String,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    customer: {
      name: String,
      phone: String,
      address: String,
    },
    paymentMethod: { type: String, enum: ['cod'], default: 'cod' },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    stripeSessionId: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
