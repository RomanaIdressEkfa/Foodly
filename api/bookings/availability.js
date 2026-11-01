const connectDB = require('../lib/db');
const { bookedTableIds } = require('../lib/bookingWindow');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date, time } = req.query;
  if (!date || !time) return res.status(400).json({ error: 'date and time are required' });

  await connectDB();
  res.status(200).json({ bookedTableIds: await bookedTableIds(date, time) });
});
