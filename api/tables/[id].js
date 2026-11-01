const connectDB = require('../lib/db');
const Table = require('../models/Table');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');
const { pickTableFields } = require('../lib/tableFields');

module.exports = withErrors(async (req, res) => {
  requireAdmin(req);
  await connectDB();

  if (req.method === 'PUT') {
    const fields = pickTableFields(req.body);
    if (fields.name) {
      const clash = await Table.findOne({ name: fields.name, _id: { $ne: req.query.id } });
      if (clash) return res.status(409).json({ error: `A table named "${fields.name}" already exists` });
    }
    const table = await Table.findByIdAndUpdate(req.query.id, fields, { new: true, runValidators: true });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    return res.status(200).json({ table });
  }

  if (req.method === 'DELETE') {
    const table = await Table.findByIdAndDelete(req.query.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  res.status(405).json({ error: 'Method not allowed' });
});
