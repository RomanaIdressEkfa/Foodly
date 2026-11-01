const connectDB = require('../lib/db');
const Product = require('../models/Product');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ product });
  }

  if (req.method === 'PUT') {
    requireAdmin(req);
    const update = (({ name, description, price, category, image, rating, featured, stock }) => (
      { name, description, price, category, image, rating, featured, stock }
    ))(req.body || {});
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ product });
  }

  if (req.method === 'DELETE') {
    requireAdmin(req);
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).json({ error: 'Method not allowed' });
});
