// Local-only Express server that mounts the exact same /api handler files
// Vercel will run in production, so `npm run dev` doesn't need the Vercel
// CLI or an account login just to develop locally.
require('dotenv').config();
const express = require('express');

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  req.cookies = parseCookies(req.headers.cookie);
  next();
});

// Stripe needs the raw body on the webhook route, so it must skip the
// global JSON parser below (body-parser's json() no-ops once req._body is set).
app.use('/api/checkout/webhook', express.raw({ type: '*/*' }));
app.use(express.json());

function mount(routePath, modPath, paramName) {
  const mod = require(modPath);
  app.all(routePath, (req, res) => {
    if (paramName && req.params[paramName] !== undefined) {
      req.query = { ...req.query, [paramName]: req.params[paramName] };
    }
    mod(req, res);
  });
}

mount('/api/auth/register', './api/auth/register');
mount('/api/auth/login', './api/auth/login');
mount('/api/auth/logout', './api/auth/logout');
mount('/api/auth/me', './api/auth/me');

mount('/api/products', './api/products/index');
mount('/api/products/:id', './api/products/[id]', 'id');

mount('/api/categories', './api/categories/index');
mount('/api/categories/:id', './api/categories/[id]', 'id');

mount('/api/tables/reset', './api/tables/reset');
mount('/api/tables', './api/tables/index');
mount('/api/tables/:id', './api/tables/[id]', 'id');

mount('/api/settings/site', './api/settings/site');

mount('/api/bookings/availability', './api/bookings/availability');
mount('/api/bookings/settings', './api/bookings/settings');
mount('/api/bookings/:id', './api/bookings/[id]', 'id');
mount('/api/bookings', './api/bookings/index');

mount('/api/orders/mine', './api/orders/mine');
mount('/api/orders/by-session', './api/orders/by-session');
mount('/api/orders/:id', './api/orders/[id]', 'id');
mount('/api/orders', './api/orders/index');

mount('/api/checkout/create-session', './api/checkout/create-session');
mount('/api/checkout/webhook', './api/checkout/webhook');
mount('/api/checkout/cod', './api/checkout/cod');

mount('/api/uploads/image', './api/uploads/image');

mount('/api/admin/stats', './api/admin/stats');
mount('/api/users', './api/users/index');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Foodly API dev server running on http://localhost:${PORT}`);
});
