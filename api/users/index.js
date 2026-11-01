const connectDB = require('../lib/db');
const User = require('../models/User');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

// Admin-only: list customers.
module.exports = withErrors(async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  requireAdmin(req);
  await connectDB();

  const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 });
  res.status(200).json({ users });
});
