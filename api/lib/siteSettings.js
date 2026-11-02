const SiteSettings = require('../models/SiteSettings');

const EDITABLE = ['restaurantName', 'phone', 'address', 'email', 'minOrderAmount', 'codNote'];

async function getSiteSettings() {
  return SiteSettings.findOneAndUpdate(
    { key: 'site' },
    { $setOnInsert: { key: 'site' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

function pickSiteFields(body) {
  const out = {};
  for (const key of EDITABLE) if (body?.[key] !== undefined) out[key] = body[key];
  return out;
}

module.exports = { getSiteSettings, pickSiteFields };
