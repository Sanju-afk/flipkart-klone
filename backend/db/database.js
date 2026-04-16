require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('\u274C  DATABASE_URL environment variable is not set.');
  console.error('    Set it in your .env file (local) or Vercel Project Settings (deployment).');
  if (!process.env.VERCEL) process.exit(1);
}

// ─── Serverless-friendly connection pool ───
// On Vercel, each function invocation may reuse the same Node process ("warm start"),
// so a module-level pool is reused across calls. On cold starts, a new pool is created.
// On Supabase, use the TRANSACTION POOLER (port 6543) for serverless — it handles
// high connection churn better than the session pooler.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: process.env.VERCEL ? 1 : 10,   // serverless: 1 connection per function instance
  idleTimeoutMillis: 10000,            // close idle connections quickly on serverless
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

// Convert SQLite-style ? placeholders to Postgres $1, $2, $3...
function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// Postgres LIKE is case-sensitive. SQLite's isn't. We auto-convert LIKE to ILIKE
// so route code stays portable between SQLite and Postgres.
function adaptSql(sql) {
  return sql.replace(/\bLIKE\b/g, 'ILIKE');
}

// ─── Public helpers (same signature as the SQLite version, but async) ───

async function all(sql, params = []) {
  const pgSql = convertPlaceholders(adaptSql(sql));
  const { rows } = await pool.query(pgSql, params);
  return rows;
}

async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function run(sql, params = []) {
  const pgSql = convertPlaceholders(adaptSql(sql));
  await pool.query(pgSql, params);
}

// ─── Schema initialization ───
async function initSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      display_order INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      discount_percent INTEGER DEFAULT 0,
      category_id TEXT NOT NULL REFERENCES categories(id),
      brand TEXT,
      rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 0,
      highlights TEXT,
      specifications TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    )`,
    `CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    )`,
    `CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      pincode TEXT NOT NULL,
      address_line TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      landmark TEXT,
      address_type TEXT DEFAULT 'Home',
      is_default INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      address_id TEXT NOT NULL REFERENCES addresses(id),
      total_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      delivery_charges REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      status TEXT DEFAULT 'Confirmed',
      payment_method TEXT DEFAULT 'Cash on Delivery',
      placed_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_image TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
    `CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id)`,
  ];

  for (const stmt of statements) {
    await pool.query(stmt);
  }
}

async function getDbPromise() {
  await initSchema();
  return pool;
}

module.exports = { all, get, run, initSchema, getDbPromise, pool };
