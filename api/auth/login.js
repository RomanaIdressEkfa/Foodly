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

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(200).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
