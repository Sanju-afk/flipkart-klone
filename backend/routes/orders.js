const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const U = 'user-default-001';

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await all(
      `SELECT o.*, a.full_name as address_name, a.city, a.state
       FROM orders o JOIN addresses a ON o.address_id = a.id
       WHERE o.user_id = ? ORDER BY o.placed_at DESC`,
      [U]
    );
    for (const order of orders) {
      order.items = await all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }
    res.json(orders);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await get(
      `SELECT o.*, a.full_name as address_name, a.phone as address_phone,
       a.address_line, a.city, a.state, a.pincode, a.landmark, a.address_type
       FROM orders o JOIN addresses a ON o.address_id = a.id
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, U]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.items = await all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    res.json(order);
  } catch (err) {
    console.error('GET /orders/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Place order
router.post('/', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || !address.full_name || !address.phone || !address.pincode ||
        !address.address_line || !address.city || !address.state) {
      return res.status(400).json({ error: 'Complete address required' });
    }

    const cartItems = await all(
      `SELECT ci.*, p.name, p.price, p.stock,
       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1) as image_url
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [U]
    );
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
      }
    }

    const addressId = uuidv4();
    await run(
      `INSERT INTO addresses (id,user_id,full_name,phone,pincode,address_line,city,state,landmark,address_type)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [addressId, U, address.full_name, address.phone, address.pincode,
       address.address_line, address.city, address.state,
       address.landmark || '', address.address_type || 'Home']
    );

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryCharges = subtotal >= 500 ? 0 : 40;
    const finalAmount = subtotal + deliveryCharges;
    const orderId = 'OD' + Date.now().toString(36).toUpperCase() +
                    Math.random().toString(36).substring(2, 6).toUpperCase();

    await run(
      `INSERT INTO orders (id,user_id,address_id,total_amount,delivery_charges,final_amount,status,payment_method)
       VALUES (?,?,?,?,?,?,?,?)`,
      [orderId, U, addressId, subtotal, deliveryCharges, finalAmount, 'Confirmed', 'Cash on Delivery']
    );

    for (const item of cartItems) {
      await run(
        `INSERT INTO order_items (id,order_id,product_id,product_name,product_image,price,quantity)
         VALUES (?,?,?,?,?,?,?)`,
        [uuidv4(), orderId, item.product_id, item.name, item.image_url, item.price, item.quantity]
      );
      await run('UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]);
    }

    await run('DELETE FROM cart_items WHERE user_id = ?', [U]);

    const order = await get('SELECT * FROM orders WHERE id = ?', [orderId]);
    order.items = await all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    res.status(201).json(order);
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
