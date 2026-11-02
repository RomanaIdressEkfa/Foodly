const connectDB = require('../lib/db');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');
const { getSiteSettings, pickSiteFields } = require('../lib/siteSettings');

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const settings = await getSiteSettings();
    return res.status(200).json({ settings });
  }

  if (req.method === 'PUT') {
    requireAdmin(req);
    const fields = pickSiteFields(req.body);
    const settings = await getSiteSettings();
    Object.assign(settings, fields);
    await settings.save();
    return res.status(200).json({ settings });
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'Method not allowed' });
});
