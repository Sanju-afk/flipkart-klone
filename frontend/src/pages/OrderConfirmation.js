import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrder(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  if (!order) {
    return (
      <div className="order-confirmation">
        <h1>Order not found</h1>
        <Link to="/products" className="btn-shop-now" style={{ marginTop: 20 }}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="order-success-icon">✓</div>
      <h1>Order Placed Successfully!</h1>
      <div className="order-id">
        Order ID: <strong>{order.id}</strong>
      </div>
      <p style={{ color: '#878787', marginBottom: 24, fontSize: 15 }}>
        Your order has been confirmed and will be delivered soon.
      </p>

      <div style={{ textAlign: 'left', background: '#fafafa', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Order Details</div>
        {order.items?.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <img src={item.product_image} alt={item.product_name} style={{ width: 48, height: 48, objectFit: 'contain' }}
              onError={(e) => { e.target.src = 'https://placehold.co/48x48/f1f3f6/878787?text=Img'; }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14 }}>{item.product_name}</div>
              <div style={{ fontSize: 12, color: '#878787' }}>Qty: {item.quantity}</div>
            </div>
            <div style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700, fontSize: 16 }}>
          <span>Total</span>
          <span>{formatPrice(order.final_amount)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn-shop-now" style={{ background: '#fff', color: '#2874f0', border: '1px solid #2874f0' }}>
          View Orders
        </Link>
        <Link to="/products" className="btn-shop-now">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;
