const connectDB = require('../lib/db');
const Booking = require('../models/Booking');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

const STATUSES = ['pending', 'confirmed', 'cancelled'];

module.exports = withErrors(async (req, res) => {
  await connectDB();

  // Public — the booking id itself is the access check, same as guest COD
  // orders. There's no account system for guests to authenticate against.
  if (req.method === 'GET') {
    const booking = await Booking.findById(req.query.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    return res.status(200).json({ booking });
  }

  if (req.method === 'PUT') {
    requireAdmin(req);
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const booking = await Booking.findByIdAndUpdate(req.query.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    return res.status(200).json({ booking });
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'Method not allowed' });
});
