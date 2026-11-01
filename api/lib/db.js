const mongoose = require('mongoose');

// Vercel runs each function in a fresh (or reused, warm) container, so we cache
// the connection on `global` to avoid exhausting MongoDB connections across
// invocations in the same warm container.
let cached = global._foodlyMongoose;
if (!cached) {
  cached = global._foodlyMongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
