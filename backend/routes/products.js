const express = require('express');
const router = express.Router();
const { all, get } = require('../db/database');

// GET /api/products/brands - MUST come before /:slug route
router.get('/brands', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT brand, COUNT(*) as count FROM products';
    let params = [];
    if (category) {
      sql += ' JOIN categories c ON products.category_id = c.id WHERE c.slug = ?';
      params.push(category);
    }
    sql += ' GROUP BY brand ORDER BY brand';
    const brands = await all(sql, params);
    // Postgres returns count as string, normalize to number
    res.json(brands.map(b => ({ ...b, count: Number(b.count) })));
  } catch (err) {
    console.error('GET /brands error:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/products - List with search, filter, sort, pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, min_price, max_price, sort, page = 1, limit = 20 } = req.query;
    let where = ['1=1'], params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) { where.push('c.slug = ?'); params.push(category); }
    if (brand) { where.push('p.brand = ?'); params.push(brand); }
    if (min_price) { where.push('p.price >= ?'); params.push(Number(min_price)); }
    if (max_price) { where.push('p.price <= ?'); params.push(Number(max_price)); }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'rating') orderBy = 'p.rating DESC';
    else if (sort === 'discount') orderBy = 'p.discount_percent DESC';
    else if (sort === 'newest') orderBy = 'p.created_at DESC';

    const offset = (Number(page) - 1) * Number(limit);
    const w = where.join(' AND ');

    const totalRow = await get(
      `SELECT COUNT(*) as count FROM products p JOIN categories c ON p.category_id = c.id WHERE ${w}`,
      params
    );
    const total = Number(totalRow.count);

    const products = await all(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1) as image_url
       FROM products p JOIN categories c ON p.category_id = c.id
       WHERE ${w} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      products: products.map(p => ({ ...p, highlights: p.highlights ? JSON.parse(p.highlights) : [] })),
      pagination: {
        total, page: Number(page), limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await get(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ?',
      [req.params.slug]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const images = await all(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
      [product.id]
    );
    const related = await all(
      `SELECT p.*, (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1) as image_url
       FROM products p WHERE p.category_id = ? AND p.id != ? LIMIT 8`,
      [product.category_id, product.id]
    );

    res.json({
      ...product,
      highlights: product.highlights ? JSON.parse(product.highlights) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      images,
      related: related.map(r => ({ ...r, highlights: r.highlights ? JSON.parse(r.highlights) : [] }))
    });
  } catch (err) {
    console.error('GET /products/:slug error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
