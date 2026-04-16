const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const U = 'user-default-001';

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const items = await all(
      `SELECT ci.id, ci.quantity, ci.product_id, p.name, p.price, p.original_price,
       p.discount_percent, p.stock, p.brand, p.slug,
       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1) as image_url
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? ORDER BY ci.added_at DESC`,
      [U]
    );
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const originalTotal = items.reduce((s, i) => s + (i.original_price || i.price) * i.quantity, 0);
    const discount = originalTotal - subtotal;
    const deliveryCharges = subtotal >= 500 ? 0 : 40;
    res.json({
      items,
      summary: {
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        subtotal, originalTotal, discount, deliveryCharges,
        total: subtotal + deliveryCharges
      }
    });
  } catch (err) {
    console.error('GET /cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });

    const product = await get('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    const existing = await get(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [U, product_id]
    );
    if (existing) {
      const nq = existing.quantity + quantity;
      if (nq > product.stock) return res.status(400).json({ error: 'Insufficient stock' });
      await run('UPDATE cart_items SET quantity = ? WHERE id = ?', [nq, existing.id]);
    } else {
      await run(
        'INSERT INTO cart_items (id,user_id,product_id,quantity) VALUES (?,?,?,?)',
        [uuidv4(), U, product_id, quantity]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('POST /cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT /api/cart/:id
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

    const item = await get(
      'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ?',
      [req.params.id]
    );
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    if (quantity > item.stock) return res.status(400).json({ error: 'Insufficient stock' });

    await run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /cart/:id error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, U]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /cart/:id error:', err);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// DELETE /api/cart
router.delete('/', async (req, res) => {
  try {
    await run('DELETE FROM cart_items WHERE user_id = ?', [U]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
