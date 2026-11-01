const bcrypt = require('bcryptjs');
const connectDB = require('../lib/db');
const User = require('../models/User');
const { signToken, setAuthCookie } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
