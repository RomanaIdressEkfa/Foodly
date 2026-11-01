// Wraps a Vercel Node function so thrown errors become clean JSON responses
// instead of opaque 500s. Route handlers can `throw` an Error with a
// `.statusCode` set (see requireAuth/requireAdmin) to control the status.
function withErrors(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      const status = err.statusCode || 500;
      if (status === 500) console.error(err);
      res.status(status).json({ error: err.message || 'Server error' });
    }
  };
}

module.exports = { withErrors };
