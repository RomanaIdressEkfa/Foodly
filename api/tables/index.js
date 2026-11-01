const connectDB = require('../lib/db');
const Table = require('../models/Table');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');
const { pickTableFields } = require('../lib/tableFields');

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const tables = await Table.find().collation({ locale: 'en', numericOrdering: true }).sort({ name: 1 });
    return res.status(200).json({ tables });
  }

  if (req.method === 'POST') {
    requireAdmin(req);
    const fields = pickTableFields(req.body);
    if (!fields.name || !fields.capacity) {
      return res.status(400).json({ error: 'Name and seats are required' });
    }
    if (await Table.findOne({ name: fields.name })) {
      return res.status(409).json({ error: `A table named "${fields.name}" already exists` });
    }
    const table = await Table.create(fields);
    return res.status(201).json({ table });
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
});
