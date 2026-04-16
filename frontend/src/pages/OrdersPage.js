import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here</p>
        <Link to="/products" className="btn-shop-now">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-title">My Orders</div>
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-card-header">
            <div>
              <div className="order-meta">
                Order <strong>{order.id}</strong>
              </div>
              <div className="order-meta" style={{ marginTop: 2 }}>
                Placed on {formatDate(order.placed_at)} • {formatPrice(order.final_amount)}
              </div>
            </div>
            <span className={`order-status ${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>
          <div className="order-card-items">
            {order.items?.map(item => (
              <div
                key={item.id}
                className="order-card-item"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/product/${item.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
              >
                <img src={item.product_image} alt={item.product_name}
                  onError={(e) => { e.target.src = 'https://placehold.co/72x72/f1f3f6/878787?text=Img'; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.product_name}</div>
                  <div style={{ fontSize: 13, color: '#878787' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: 13, color: '#878787' }}>
              Delivered to: {order.address_name}, {order.city}
            </span>
            <span style={{ fontSize: 13, color: '#878787' }}>
              Payment: {order.payment_method}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrdersPage;
