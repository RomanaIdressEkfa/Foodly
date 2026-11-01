const connectDB = require('../lib/db');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { withErrors } = require('../lib/handler');

// Guest checkout — no account required. Every order is Cash on Delivery,
// so there's no payment provider to talk to: re-price from the database,
// create the order as 'pending', done.
module.exports = withErrors(async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const name = customer?.name?.trim();
  const phone = customer?.phone?.trim();
  const address = customer?.address?.trim();
  if (!name || !phone || !address) {
    return res.status(400).json({ error: 'Name, phone and address are required' });
  }

  await connectDB();

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
    return res.status(400).json({ error: 'No valid products in cart' });
  }

  const total = Math.round(orderItems.reduce((sum, i) => sum + i.price * i.qty, 0) * 100) / 100;

  const order = await Order.create({
    email: customer?.email?.trim() || undefined,
    customer: { name, phone, address },
    paymentMethod: 'cod',
    items: orderItems,
    total,
    status: 'pending',
  });

  res.status(201).json({ order });
});
