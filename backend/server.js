require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ───
// In production, set FRONTEND_URL to your Vercel frontend URL
// e.g. FRONTEND_URL=https://flipkart-clone-xyz.vercel.app

// ✅ 1. CORS FIRST
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));

// ✅ 2. JSON parser
app.use(express.json());

// ─── Lazy schema init ───
// Runs once on first request. Idempotent — CREATE TABLE IF NOT EXISTS never drops data.
let schemaReadyPromise = null;
function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = initSchema()
      .then(() => console.log('\u2705 Database schema ready'))
      .catch(err => {
        schemaReadyPromise = null; // retry on next request
        throw err;
      });
  }
  return schemaReadyPromise;
}

// Middleware runs BEFORE routes — ensures DB is ready before any handler touches it
app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    console.error('Schema init failed:', err);
    res.status(503).json({ error: 'Database unavailable, try again shortly' });
  }
});

// ─── API routes ───
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'supabase-postgres', env: process.env.VERCEL ? 'vercel' : 'local' });
});

// Root endpoint — useful for testing the backend is alive
app.get('/', (req, res) => {
  res.json({
    message: 'Flipkart Clone API',
    health: '/api/health',
    endpoints: ['/api/products', '/api/categories', '/api/cart', '/api/wishlist', '/api/orders']
  });
});

// ─── Local development only ───
// On Vercel, the VERCEL env var is automatically set, so this block is skipped.
// Vercel invokes the exported `app` directly via @vercel/node.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\u{1F680} Server running on http://localhost:${PORT}`);
    console.log(`   Run "npm run seed" to populate sample data.`);
  });
}

// Export for Vercel serverless
module.exports = app;
