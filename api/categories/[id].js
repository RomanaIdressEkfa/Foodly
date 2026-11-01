const connectDB = require('../lib/db');
const Category = require('../models/Category');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  requireAdmin(req);
  await connectDB();

  if (req.method === 'PUT') {
    const { name, bg, fg, image } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (bg !== undefined) update.bg = bg;
    if (fg !== undefined) update.fg = fg;
    if (image !== undefined) update.image = image;
    const category = await Category.findByIdAndUpdate(req.query.id, update, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    return res.status(200).json({ category });
  }

  if (req.method === 'DELETE') {
    const category = await Category.findByIdAndDelete(req.query.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  res.status(405).json({ error: 'Method not allowed' });
});
