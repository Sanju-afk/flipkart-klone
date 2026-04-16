const express = require('express');
const router = express.Router();
const { all } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const categories = await all(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.display_order`
    );
    // Normalize count to number (Postgres returns bigint as string)
    res.json(categories.map(c => ({ ...c, product_count: Number(c.product_count) })));
  } catch (err) {
    console.error('GET /categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
