// Whitelists and normalises the table fields an admin may set.
function pickTableFields(body) {
  const { name, capacity, shape, floor, row, col } = body || {};
  const fields = {};
  if (name !== undefined) fields.name = String(name).trim();
  if (capacity !== undefined) fields.capacity = Number(capacity);
  if (shape !== undefined) fields.shape = shape === 'round' ? 'round' : 'square';
  if (floor !== undefined) fields.floor = String(floor).trim() || 'Main floor';
  if (row !== undefined) fields.row = Math.max(1, Number(row) || 1);
  if (col !== undefined) fields.col = Math.max(1, Number(col) || 1);
  return fields;
}

module.exports = { pickTableFields };
