import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const showToast = useToast();
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState({});
  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    pincode: '',
    address_line: '',
    city: '',
    state: '',
    landmark: '',
    address_type: 'Home'
  });

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    const errs = {};
    if (!address.full_name.trim()) errs.full_name = true;
    if (!address.phone.trim() || address.phone.length < 10) errs.phone = true;
    if (!address.pincode.trim() || address.pincode.length !== 6) errs.pincode = true;
    if (!address.address_line.trim()) errs.address_line = true;
    if (!address.city.trim()) errs.city = true;
    if (!address.state.trim()) errs.state = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setPlacing(true);
    try {
      const order = await api.placeOrder(address);
      await fetchCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (e) {
      showToast(e.message || 'Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add items before checkout</p>
        <Link to="/products" className="btn-shop-now">Shop Now</Link>
      </div>
    );
  }

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
  ];

  return (
    <div className="checkout-page">
      {/* Address Section */}
      <div className="checkout-section">
        <div className="checkout-section-header">
          <span className="checkout-step-num">1</span>
          Delivery Address
        </div>
        <div className="checkout-section-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text" name="full_name" value={address.full_name}
                onChange={handleChange} className={errors.full_name ? 'error' : ''}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel" name="phone" value={address.phone}
                onChange={handleChange} className={errors.phone ? 'error' : ''}
                placeholder="10-digit mobile number" maxLength={10}
              />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text" name="pincode" value={address.pincode}
                onChange={handleChange} className={errors.pincode ? 'error' : ''}
                placeholder="6-digit pincode" maxLength={6}
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <select
                name="state" value={address.state}
                onChange={handleChange} className={errors.state ? 'error' : ''}
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Address (House No, Building, Street, Area) *</label>
              <input
                type="text" name="address_line" value={address.address_line}
                onChange={handleChange} className={errors.address_line ? 'error' : ''}
                placeholder="Enter full address"
              />
            </div>
            <div className="form-group">
              <label>City / Town *</label>
              <input
                type="text" name="city" value={address.city}
                onChange={handleChange} className={errors.city ? 'error' : ''}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>Landmark (Optional)</label>
              <input
                type="text" name="landmark" value={address.landmark}
                onChange={handleChange} placeholder="Near..."
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#878787', textTransform: 'uppercase' }}>Address Type</label>
            <div className="address-type-row">
              {['Home', 'Work'].map(type => (
                <button
                  key={type}
                  className={`address-type-btn ${address.address_type === type ? 'active' : ''}`}
                  onClick={() => setAddress(prev => ({ ...prev, address_type: type }))}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="checkout-section">
        <div className="checkout-section-header">
          <span className="checkout-step-num">2</span>
          Order Summary
        </div>
        <div className="checkout-section-body">
          <div className="order-review-items">
            {cart.items.map(item => (
              <div key={item.id} className="order-review-item">
                <img src={item.image_url} alt={item.name}
                  onError={(e) => { e.target.src = 'https://placehold.co/60x60/f1f3f6/878787?text=Img'; }}
                />
                <div className="order-review-item-info">
                  <div className="order-review-item-name">{item.name}</div>
                  <div className="order-review-item-meta">
                    Qty: {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed #ddd', paddingTop: 16, marginTop: 8 }}>
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
        </div>
      </div>

      {/* Payment & Place Order */}
      <div className="checkout-section">
        <div className="checkout-section-header">
          <span className="checkout-step-num">3</span>
          Payment
        </div>
        <div className="checkout-section-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0f4ff', borderRadius: 4, marginBottom: 16 }}>
            <input type="radio" checked readOnly style={{ accentColor: '#2874f0' }} />
            <span style={{ fontSize: 15, fontWeight: 500 }}>Cash on Delivery</span>
          </div>
          <button
            className="btn-place-order"
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{ opacity: placing ? 0.6 : 1 }}
          >
            {placing ? 'Placing Order...' : `Place Order  •  ${formatPrice(cart.summary.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
