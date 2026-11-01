const connectDB = require('../lib/db');
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const Product = require('../models/Product');
const { requireAdmin } = require('../lib/auth');
const { bookedTableIds } = require('../lib/bookingWindow');
const { getBookingSettings, checkBookingRules } = require('../lib/bookingSettings');
const { withErrors } = require('../lib/handler');

module.exports = withErrors(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    requireAdmin(req);
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  }

  if (req.method === 'POST') {
    const { tableId, customerName, phone, email, date, time, partySize, items } = req.body || {};
    if (!tableId || !customerName || !phone || !date || !time || !partySize) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    const settings = await getBookingSettings();
    const ruleError = checkBookingRules(settings, date, time);
    if (ruleError) return res.status(400).json({ error: ruleError });

    const table = await Table.findById(tableId);
    if (!table) return res.status(400).json({ error: 'Selected table no longer exists' });
    if (settings.maxGuests && Number(partySize) > settings.maxGuests) {
      return res.status(400).json({ error: `Online bookings are limited to ${settings.maxGuests} guests` });
    }
    if (Number(partySize) > table.capacity) {
      return res.status(400).json({ error: `${table.name} only seats ${table.capacity}` });
    }
    if ((await bookedTableIds(date, time)).includes(String(table._id))) {
      return res.status(409).json({ error: `${table.name} is already booked around that time` });
    }

    let bookingItems = [];
    let total = 0;
    if (Array.isArray(items) && items.length > 0) {
      const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
      const byId = new Map(products.map((p) => [String(p._id), p]));
      for (const { productId, qty } of items) {
        const product = byId.get(String(productId));
        if (!product) continue;
        const quantity = Math.max(1, Math.min(50, Number(qty) || 1));
        bookingItems.push({ product: product._id, name: product.name, price: product.price, qty: quantity, image: product.image });
        total += product.price * quantity;
      }
      total = Math.round(total * 100) / 100;
    }

    const booking = await Booking.create({
      table: table._id,
      tableName: table.name,
      customerName,
      phone,
      email,
      date,
      time,
      partySize: Number(partySize),
      items: bookingItems,
      total,
      status: 'pending',
    });

    return res.status(201).json({ booking });
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
});
