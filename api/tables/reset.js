const connectDB = require('../lib/db');
const Table = require('../models/Table');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');
const defaultTables = require('../lib/defaultTables');

// Restores every known table to the restaurant's original floor plan
// (shape/capacity/floor/row/col) without touching its _id, so bookings
// that already reference a table stay valid. Any extra tables an admin
// added beyond the default set are left alone.
module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  requireAdmin(req);

  for (const def of defaultTables) {
    await Table.findOneAndUpdate({ name: def.name }, def, { upsert: true });
  }

  const tables = await Table.find().collation({ locale: 'en', numericOrdering: true }).sort({ name: 1 });
  return res.status(200).json({ tables });
});
