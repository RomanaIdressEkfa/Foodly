const Stripe = require('stripe');
const connectDB = require('../lib/db');
const Order = require('../models/Order');

// Stripe needs the exact raw request body to verify the webhook signature,
// so we turn off Vercel's automatic JSON body parsing for this route.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  // In local dev (devServer.js) express.raw() already buffered this into
  // req.body. In production, Vercel hands us the untouched stream.
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      await connectDB();

      const existing = await Order.findOne({ stripeSessionId: session.id });
      if (!existing) {
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product'],
        });

        const items = fullSession.line_items.data.map((li) => ({
          name: li.description,
          price: li.price.unit_amount / 100,
          qty: li.quantity,
          image: li.price.product?.images?.[0] || '',
        }));

        await Order.create({
          user: session.metadata?.userId || undefined,
          email: session.customer_details?.email || session.customer_email,
          items,
          total: session.amount_total / 100,
          status: 'paid',
          stripeSessionId: session.id,
        });
      }
    } catch (err) {
      console.error('Failed to create order from webhook:', err);
      // Still 200 the webhook so Stripe doesn't hammer retries forever while
      // we investigate; the order can be reconciled manually from Stripe's
      // dashboard if this ever happens.
    }
  }

  res.status(200).json({ received: true });
};
