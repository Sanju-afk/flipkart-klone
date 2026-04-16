import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  if (cart.items.length === 0) {
    return (
      <div className="cart-items-section">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty!</h2>
          <p>Add items to it now.</p>
          <Link to="/products" className="btn-shop-now">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-items-section">
        <div className="cart-header">
          My Cart ({cart.summary.itemCount})
        </div>

        {cart.items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image" onClick={() => navigate(`/product/${item.slug}`)}>
              <img src={item.image_url} alt={item.name}
                onError={(e) => { e.target.src = 'https://placehold.co/112x112/f1f3f6/878787?text=Image'; }}
              />
            </div>
            <div className="cart-item-details">
              <div className="cart-item-name" onClick={() => navigate(`/product/${item.slug}`)} style={{ cursor: 'pointer' }}>
                {item.name}
              </div>
              <div className="cart-item-brand">{item.brand}</div>
              <div className="cart-item-price-row">
                <span className="price-current">{formatPrice(item.price)}</span>
                {item.original_price && item.original_price > item.price && (
                  <>
                    <span className="price-original">{formatPrice(item.original_price)}</span>
                    <span className="price-discount">{item.discount_percent}% off</span>
                  </>
                )}
              </div>
              <div className="cart-item-actions">
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                <button className="cart-remove-btn" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-title">Price Details</div>
        <div className="cart-summary-rows">
          <div className="cart-summary-row">
            <span>Price ({cart.summary.itemCount} items)</span>
            <span>{formatPrice(cart.summary.originalTotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Discount</span>
            <span className="discount">− {formatPrice(cart.summary.discount)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery Charges</span>
            <span style={{ color: cart.summary.deliveryCharges === 0 ? '#388e3c' : undefined }}>
              {cart.summary.deliveryCharges === 0 ? 'FREE' : formatPrice(cart.summary.deliveryCharges)}
            </span>
          </div>
          <div className="cart-summary-row total">
            <span>Total Amount</span>
            <span>{formatPrice(cart.summary.total)}</span>
          </div>
        </div>
        <div style={{ padding: '8px 24px 16px', fontSize: 14, color: '#388e3c', fontWeight: 500 }}>
          You will save {formatPrice(cart.summary.discount)} on this order
        </div>
        <div className="cart-place-order">
          <button className="btn-place-order" onClick={() => navigate('/checkout')}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
