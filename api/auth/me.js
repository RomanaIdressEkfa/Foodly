const connectDB = require('../lib/db');
const User = require('../models/User');
const { verifyAuth } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = verifyAuth(req);
  if (!payload) return res.status(200).json({ user: null });

  await connectDB();
  const user = await User.findById(payload.id).select('name email role');
  if (!user) return res.status(200).json({ user: null });

  res.status(200).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
