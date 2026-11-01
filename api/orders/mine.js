const connectDB = require('../lib/db');
const Order = require('../models/Order');
const { requireAuth } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = requireAuth(req);
  await connectDB();

  const orders = await Order.find({ user: id }).sort({ createdAt: -1 });
  res.status(200).json({ orders });
});
