import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="header-logo-text">Flipkart</span>
          <span className="header-logo-sub">
            Explore <span style={{ color: '#ffe500', fontWeight: 500 }}>Plus</span> ✦
          </span>
        </Link>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for Products, Brands and More"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="header-search-icon" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            🔍
          </button>
        </form>

        <nav className="header-nav">
          <Link to="/orders" className="header-nav-item">
            <span>📦</span>
            <span>Orders</span>
          </Link>
          <Link to="/wishlist" className="header-nav-item">
            <span>♡</span>
            <span>Wishlist</span>
          </Link>
          <Link to="/cart" className="header-nav-item" style={{ position: 'relative' }}>
            <span>🛒</span>
            <span>Cart</span>
            {cart.summary.itemCount > 0 && (
              <span className="header-nav-badge">{cart.summary.itemCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
