const connectDB = require('../lib/db');
const Category = require('../models/Category');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const categories = await Category.find().sort({ createdAt: 1 });
    return res.status(200).json({ categories });
  }

  if (req.method === 'POST') {
    requireAdmin(req);
    const { name, bg, fg, image } = req.body || {};
    if (!name || !bg || !fg) {
      return res.status(400).json({ error: 'Name and color are required' });
    }
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: 'A category with that name already exists' });
    }
    const category = await Category.create({ name: name.trim(), bg, fg, image: image || '' });
    return res.status(201).json({ category });
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
});
