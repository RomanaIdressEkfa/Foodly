// Dev-only convenience: a real local MongoDB instance (via mongodb-memory-server)
// so `npm run dev` works immediately without an Atlas account. Not used in
// production — the deployed app always reads MONGODB_URI from your real
// Atlas cluster.
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 57017, dbName: 'foodly' },
  });
  console.log('Local MongoDB ready at', mongod.getUri());
  process.on('SIGINT', async () => {
    await mongod.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start local MongoDB:', err);
  process.exit(1);
});
