const bcrypt = require('bcryptjs');
const connectDB = require('../lib/db');
const User = require('../models/User');
const { verifyAuth, requireAuth } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  if (req.method === 'GET') {
    const payload = verifyAuth(req);
    if (!payload) return res.status(200).json({ user: null });

    await connectDB();
    const user = await User.findById(payload.id).select('name email role');
    if (!user) return res.status(200).json({ user: null });

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  }

  if (req.method === 'PUT') {
    const payload = requireAuth(req);
    await connectDB();

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'Account not found' });

    const { name, email, currentPassword, newPassword } = req.body || {};

    if (name) user.name = name.trim();

    if (email) {
      const nextEmail = email.toLowerCase().trim();
      if (nextEmail !== user.email) {
        if (await User.findOne({ email: nextEmail, _id: { $ne: user._id } })) {
          return res.status(409).json({ error: 'An account with that email already exists' });
        }
        user.email = nextEmail;
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Enter your current password to set a new one' });
      }
      if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'Method not allowed' });
});
