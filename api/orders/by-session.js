const connectDB = require('../lib/db');
const Order = require('../models/Order');
const { requireAuth } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

// Polled by the order-success page right after a Stripe redirect, while we
// wait for the webhook to actually create the Order document.
module.exports = withErrors(async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: userId, role } = requireAuth(req);
  const { session_id: sessionId } = req.query || {};
  if (!sessionId) return res.status(400).json({ error: 'session_id is required' });

  await connectDB();
  const order = await Order.findOne({ stripeSessionId: sessionId });

  if (!order) return res.status(200).json({ status: 'processing' });
  if (role !== 'admin' && String(order.user) !== userId) {
    return res.status(403).json({ error: 'Not your order' });
  }

  res.status(200).json({ status: 'ready', order });
});
