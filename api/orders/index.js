const connectDB = require('../lib/db');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

const TAX_RATE = 0.05;

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    requireAdmin(req);
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  }

  // Admin "take an order at the counter" (POS-style) flow — re-prices from
  // the database just like Stripe checkout does, but marks the order paid
  // immediately instead of going through Stripe.
  if (req.method === 'POST') {
    const { id: adminId } = requireAdmin(req);
    const { items, customerLabel } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order has no items' });
    }

    const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    for (const { productId, qty } of items) {
      const product = byId.get(String(productId));
      if (!product) continue;
      const quantity = Math.max(1, Math.min(50, Number(qty) || 1));
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: quantity,
        image: product.image,
      });
    }
    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No valid products in order' });
    }

    const subTotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const total = Math.round(subTotal * (1 + TAX_RATE) * 100) / 100;

    const order = await Order.create({
      user: adminId,
      email: customerLabel || 'Walk-in order',
      items: orderItems,
      total,
      status: 'paid',
    });
    return res.status(201).json({ order });
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
});
