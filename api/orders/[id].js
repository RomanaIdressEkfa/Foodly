const connectDB = require('../lib/db');
const Order = require('../models/Order');
const { verifyAuth, requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

const STATUSES = ['pending', 'paid', 'fulfilled', 'cancelled'];

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const order = await Order.findById(req.query.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Guest (COD) orders have no owning user, so the order id itself is the
    // access check. Account-bound orders still require owner-or-admin.
    if (order.user) {
      const auth = verifyAuth(req);
      if (!auth || (auth.role !== 'admin' && auth.id !== String(order.user))) {
        return res.status(403).json({ error: 'Not your order' });
      }
    }

    return res.status(200).json({ order });
  }

  if (req.method === 'PUT') {
    requireAdmin(req);
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.query.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json({ order });
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'Method not allowed' });
});
