const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const U = 'user-default-001';

router.get('/', async (req, res) => {
  try {
    const items = await all(
      `SELECT w.id, w.product_id, w.added_at, p.name, p.price, p.original_price,
       p.discount_percent, p.stock, p.brand, p.slug, p.rating, p.rating_count,
       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1) as image_url
       FROM wishlist w JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? ORDER BY w.added_at DESC`,
      [U]
    );
    res.json(items);
  } catch (err) {
    console.error('GET /wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;
    const existing = await get(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [U, product_id]
    );
    if (existing) {
      await run('DELETE FROM wishlist WHERE id = ?', [existing.id]);
      return res.json({ success: true, action: 'removed' });
    }
    await run(
      'INSERT INTO wishlist (id,user_id,product_id) VALUES (?,?,?)',
      [uuidv4(), U, product_id]
    );
    res.json({ success: true, action: 'added' });
  } catch (err) {
    console.error('POST /wishlist error:', err);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM wishlist WHERE id = ? AND user_id = ?', [req.params.id, U]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /wishlist/:id error:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;
