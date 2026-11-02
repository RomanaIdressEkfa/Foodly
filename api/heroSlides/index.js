const connectDB = require('../lib/db');
const HeroSlide = require('../models/HeroSlide');
const { requireAdmin, verifyAuth } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    // Admin UI needs every slide (incl. hidden ones) to manage them; the
    // public homepage only ever gets the active, ordered list.
    const isAdmin = verifyAuth(req)?.role === 'admin';
    const filter = isAdmin && req.query.all === 'true' ? {} : { active: true };
    const slides = await HeroSlide.find(filter).sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ slides });
  }

  if (req.method === 'POST') {
    requireAdmin(req);
    const { title, category, description, image, price, rating, active } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const count = await HeroSlide.countDocuments();
    const slide = await HeroSlide.create({
      title,
      category,
      description,
      image,
      price,
      rating,
      active: active !== undefined ? active : true,
      order: count,
    });
    return res.status(201).json({ slide });
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
});
