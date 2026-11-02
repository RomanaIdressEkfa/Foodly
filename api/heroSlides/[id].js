const connectDB = require('../lib/db');
const HeroSlide = require('../models/HeroSlide');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

const FIELDS = ['title', 'category', 'description', 'image', 'price', 'rating', 'order', 'active'];

module.exports = withErrors(async (req, res) => {
  requireAdmin(req);
  await connectDB();

  if (req.method === 'PUT') {
    const update = {};
    for (const key of FIELDS) {
      if (req.body?.[key] !== undefined) update[key] = req.body[key];
    }
    const slide = await HeroSlide.findByIdAndUpdate(req.query.id, update, { new: true, runValidators: true });
    if (!slide) return res.status(404).json({ error: 'Slide not found' });
    return res.status(200).json({ slide });
  }

  if (req.method === 'DELETE') {
    const slide = await HeroSlide.findByIdAndDelete(req.query.id);
    if (!slide) return res.status(404).json({ error: 'Slide not found' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  res.status(405).json({ error: 'Method not allowed' });
});
