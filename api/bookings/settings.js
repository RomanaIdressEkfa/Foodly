const connectDB = require('../lib/db');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');
const { getBookingSettings, timeSlots, pickSettings } = require('../lib/bookingSettings');

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const settings = await getBookingSettings();
    return res.status(200).json({ settings, timeSlots: timeSlots(settings) });
  }

  if (req.method === 'PUT') {
    requireAdmin(req);
    const fields = pickSettings(req.body);
    const settings = await getBookingSettings();
    Object.assign(settings, fields);
    await settings.save();
    return res.status(200).json({ settings, timeSlots: timeSlots(settings) });
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'Method not allowed' });
});
