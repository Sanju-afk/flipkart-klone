import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, fetchWishlist } = useCart();
  const showToast = useToast();
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const data = await api.getWishlist();
      setItems(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  const handleRemove = async (id) => {
    await api.removeFromWishlist(id);
    await fetchWishlist();
    fetchItems();
    showToast('Removed from wishlist');
  };

  const handleMoveToCart = async (item) => {
    const ok = await addToCart(item.product_id);
    if (ok) {
      await api.removeFromWishlist(item.id);
      await fetchWishlist();
      fetchItems();
      showToast('Moved to cart!');
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">♡</div>
        <h2>Your Wishlist is Empty</h2>
        <p>Save items you love to your wishlist</p>
        <Link to="/products" className="btn-shop-now">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">My Wishlist <span className="page-title-count">({items.length} items)</span></div>
      <div className="wishlist-grid">
        {items.map(item => (
          <div key={item.id} style={{
            background: '#fff', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            padding: 16, position: 'relative'
          }}>
            <button
              onClick={() => handleRemove(item.id)}
              style={{
                position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)',
                border: 'none', borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: 14
              }}
            >
              ✕
            </button>
            <div
              style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 12 }}
              onClick={() => navigate(`/product/${item.slug}`)}
            >
              <img src={item.image_url} alt={item.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.src = 'https://placehold.co/180x180/f1f3f6/878787?text=Image'; }}
              />
            </div>
            <div style={{ fontSize: 12, color: '#878787', marginBottom: 4 }}>{item.brand}</div>
            <div style={{ fontSize: 14, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontWeight: 700 }}>{formatPrice(item.price)}</span>
              {item.original_price > item.price && (
                <>
                  <span style={{ fontSize: 12, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(item.original_price)}</span>
                  <span style={{ fontSize: 12, color: '#388e3c' }}>{item.discount_percent}% off</span>
                </>
              )}
            </div>
            <button
              onClick={() => handleMoveToCart(item)}
              style={{
                width: '100%', padding: '10px', background: '#ff9f00', color: '#fff',
                border: 'none', borderRadius: 3, fontWeight: 600, fontSize: 13,
                textTransform: 'uppercase', cursor: 'pointer'
              }}
            >
              Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
