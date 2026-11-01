const Stripe = require('stripe');
const connectDB = require('../lib/db');
const Product = require('../models/Product');
const User = require('../models/User');
const { requireAuth } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: userId } = requireAuth(req);
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  await connectDB();

  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: 'User not found' });

  // Always re-price from the database — never trust prices/quantities sent
  // by the client.
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const origin =
    process.env.PUBLIC_BASE_URL ||
    `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

  const line_items = [];
  for (const { productId, qty } of items) {
    const product = byId.get(String(productId));
    const quantity = Math.max(1, Math.min(50, Number(qty) || 1));
    if (!product) continue;

    const imageUrl = product.image
      ? `${origin}${product.image.startsWith('/') ? '' : '/'}${product.image}`
      : undefined;

    line_items.push({
      quantity,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          images: imageUrl ? [imageUrl] : undefined,
          metadata: { productId: String(product._id) },
        },
      },
    });
  }

  if (line_items.length === 0) {
    return res.status(400).json({ error: 'No valid products in cart' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    customer_email: user.email,
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    metadata: { userId },
  });

  res.status(200).json({ url: session.url });
});
