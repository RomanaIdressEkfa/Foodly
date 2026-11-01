const connectDB = require('../lib/db');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  requireAdmin(req);
  await connectDB();

  const [totalProducts, totalCustomers, orders] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.find().sort({ createdAt: -1 }),
  ]);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  res.status(200).json({
    totalProducts,
    totalCustomers,
    totalOrders: orders.length,
    totalRevenue,
    recentOrders: orders.slice(0, 6),
  });
});
