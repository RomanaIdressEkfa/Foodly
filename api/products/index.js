const connectDB = require('../lib/db');
const Product = require('../models/Product');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const { featured, category } = req.query || {};
    const filter = {};
    if (featured === 'true') filter.featured = true;
    if (category) filter.category = category;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ products });
  }

  if (req.method === 'POST') {
    requireAdmin(req);
    const { name, description, price, category, image, rating, featured, stock } =
      req.body || {};
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      rating,
      featured,
      stock,
    });
    return res.status(201).json({ product });
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
});
