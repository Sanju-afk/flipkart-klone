# Flipkart Clone — E-Commerce Platform (Supabase Edition)

A full-stack e-commerce web application replicating Flipkart's design, now using **Supabase PostgreSQL** as the database.

![Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![Database](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

## What Changed from the SQLite Version

| | SQLite Version | Supabase Version |
|---|---|---|
| Database | `sql.js` (local file) | Cloud-hosted PostgreSQL via Supabase |
| Persistence | `flipkart.db` file | Remote, always-on Postgres instance |
| DB Layer | Synchronous | Async (all helpers return Promises) |
| Deployment | Local only | Ready for Vercel / Render / Railway / anywhere |
| Placeholders | `?` (SQLite) | Auto-converted to `$1, $2, $3` (Postgres) |
| Search | `LIKE` case-insensitive | Auto-converted to `ILIKE` |

## Features

### Core (Required)
- Product Listing Page with grid layout, Flipkart-style cards, search, and category filter
- Product Detail Page with image carousel, specifications, highlights, Add to Cart & Buy Now
- Shopping Cart with quantity updates, remove, and price summary
- Order Placement with shipping address form and confirmation page

### Bonus (All Implemented)
- Responsive design (mobile, tablet, desktop)
- Order history page
- Wishlist functionality (add/remove/move-to-cart)
- Brand, price range, and sort filters
- Related products section

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router v6 |
| Backend | Node.js + Express |
| Database | **Supabase PostgreSQL** |
| DB Driver | `pg` (node-postgres) |
| State | React Context API |
| Styling | Custom CSS (Flipkart design system) |

---

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free tier is plenty)
2. Click **New Project** — name it anything, choose a region close to you, set a strong database password (**save this password**)
3. Wait ~2 minutes for the project to provision
4. In the dashboard, click the **Connect** button (top right)
5. Select the **Session pooler** tab (port `5432`) — this is best for a long-running Node server
6. Copy the connection string. It looks like:
   ```
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with the actual password you set in step 2

### Step 2: Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and paste your connection string:
```
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_REAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### Step 4: Seed the Database

```bash
cd backend
npm run seed
```

Expected output:
```
✅ Seeded: 8 categories, 23 products
```

This creates all tables and populates them with sample data. You only need to run this **once**.

### Step 5: Run the App

```bash
# Terminal 1 — Backend
cd backend
npm start
# → Server running on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm start
# → React app on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema

All 9 tables use the same schema as the SQLite version, but with Postgres-specific types:

```
users                categories              products
├─ id (PK)           ├─ id (PK)              ├─ id (PK)
├─ name              ├─ name                 ├─ name, slug
├─ email (UNIQUE)    ├─ slug (UNIQUE)        ├─ price, original_price
├─ phone             ├─ image_url            ├─ category_id → categories
└─ created_at        └─ display_order        ├─ brand, rating, stock
(TIMESTAMPTZ)                                ├─ highlights (JSON text)
                                             ├─ specifications (JSON text)
                                             └─ created_at

product_images       cart_items              wishlist
├─ id (PK)           ├─ id (PK)              ├─ id (PK)
├─ product_id → FK   ├─ user_id → users      ├─ user_id → users
├─ image_url         ├─ product_id → FK      ├─ product_id → FK
└─ display_order     ├─ quantity             └─ UNIQUE(user_id, product_id)
                     └─ UNIQUE(user_id, product_id)

addresses            orders                  order_items
├─ id (PK)           ├─ id (PK)              ├─ id (PK)
├─ user_id → users   ├─ user_id → users      ├─ order_id → orders (CASCADE)
├─ full_name         ├─ address_id → addr    ├─ product_id → products
├─ phone, pincode    ├─ total_amount         ├─ product_name (denormalized)
├─ address_line      ├─ delivery_charges     ├─ product_image (denormalized)
├─ city, state       ├─ final_amount         ├─ price, quantity
└─ address_type      ├─ status
                     └─ placed_at
```

**Design decisions preserved:**
- `product_images` as a separate table (supports 1:N images per product)
- `highlights` and `specifications` as JSON strings (flexible schema)
- `order_items` denormalizes product data (order snapshot pattern)
- `UNIQUE(user_id, product_id)` on cart and wishlist prevents duplicates
- Indexes on all FK columns used in WHERE/JOIN clauses

---

## API Endpoints

All endpoints are identical to the SQLite version:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products?search=&category=&brand=&sort=&page=` | List with filters |
| GET | `/api/products/brands?category=` | Brands with counts |
| GET | `/api/products/:slug` | Detail with images, specs, related |
| GET | `/api/categories` | Categories with product counts |
| GET | `/api/cart` | Cart items + summary |
| POST | `/api/cart` | Add item `{ product_id, quantity }` |
| PUT | `/api/cart/:id` | Update quantity |
| DELETE | `/api/cart/:id` | Remove item |
| DELETE | `/api/cart` | Clear cart |
| GET | `/api/wishlist` | Wishlist items |
| POST | `/api/wishlist` | Toggle wishlist |
| DELETE | `/api/wishlist/:id` | Remove from wishlist |
| GET | `/api/orders` | Order history |
| GET | `/api/orders/:id` | Order detail |
| POST | `/api/orders` | Place order |

---

## Project Structure

```
flipkart-supabase/
├── backend/
│   ├── server.js              # Express entry, initSchema on startup
│   ├── package.json           # pg + dotenv + express
│   ├── .env.example           # Template (copy to .env)
│   ├── db/
│   │   ├── database.js        # pg.Pool + all()/get()/run() helpers
│   │   └── seed.js            # Async seed (npm run seed)
│   └── routes/
│       ├── products.js        # All handlers async + try/catch
│       ├── categories.js
│       ├── cart.js
│       ├── wishlist.js
│       └── orders.js
├── frontend/                  # UNCHANGED from SQLite version
│   ├── public/index.html
│   ├── package.json
│   └── src/
│       ├── App.js, api.js, index.css, index.js
│       ├── context/CartContext.js
│       ├── components/ (Header, CategoryBar, ProductCard, Footer, Toast)
│       └── pages/ (ProductListing, ProductDetail, CartPage,
│                   CheckoutPage, OrderConfirmation, OrdersPage, WishlistPage)
├── .gitignore
└── README.md
```

---

## Verifying the Data in Supabase

After running `npm run seed`, you can verify the data in Supabase:

1. Go to the Supabase dashboard → **Table Editor**
2. You should see all 9 tables
3. Click on `products` — you should see 23 rows
4. Click on `categories` — you should see 8 rows

You can also run SQL queries directly in Supabase's **SQL Editor**:

```sql
SELECT name, price, brand FROM products ORDER BY price DESC LIMIT 5;
```

---

## Deployment Notes

### Running on a traditional server (Railway, Render, Fly.io)
Works out of the box. Just set the `DATABASE_URL` environment variable and deploy.

### Running on serverless (Vercel)
You need to:
1. Use the **Transaction pooler** (port `6543`) instead of session pooler — it's designed for short-lived connections
2. Export the Express `app` from `server.js` (remove `app.listen()`)
3. Add a `vercel.json` routing all requests to `server.js`

See the separate `Vercel_Deployment_Guide.md` for detailed steps.

---

## Troubleshooting

**"DATABASE_URL environment variable is not set"**
→ You haven't created the `.env` file or it's in the wrong location. Must be at `backend/.env`.

**"password authentication failed for user"**
→ The `[YOUR-PASSWORD]` placeholder in the connection string wasn't replaced with your actual database password.

**"connection refused" or "timeout"**
→ Your Supabase project may be paused. Free tier projects pause after a week of inactivity. Go to the dashboard and click **Restore project**.

**Seed script hangs or times out**
→ Your IP might be on a restrictive network. Try the Transaction pooler URL (port 6543) instead.

**Frontend shows no products**
→ Open browser DevTools → Network tab. Check if `/api/products` is returning 200. If it's returning 500, check the backend terminal for error logs.

---

## Assumptions

1. Single default user (pre-seeded as "Madhav") — no authentication required per assignment spec
2. Cash on Delivery is the only payment method
3. Product images use `placehold.co` placeholders for demonstration
4. Stock is decremented atomically on order placement
5. Free delivery on orders ≥ ₹500, otherwise ₹40 delivery charge
