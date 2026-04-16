import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlistItem, isInWishlist } = useCart();

  const formatPrice = (price) => {
    return '₹' + Number(price).toLocaleString('en-IN');
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    await toggleWishlistItem(product.id);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug}`)}>
      <button
        className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
        onClick={handleWishlist}
        title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        {isInWishlist(product.id) ? '❤️' : '♡'}
      </button>

      <div className="product-card-image">
        <img
          src={product.image_url}
          alt={product.name}
          onError={(e) => { e.target.src = `https://placehold.co/200x200/f1f3f6/878787?text=${encodeURIComponent(product.name.substring(0, 10))}`; }}
        />
      </div>

      <div className="product-card-brand">{product.brand}</div>
      <div className="product-card-name">{product.name}</div>

      {product.rating > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span className="product-card-rating">
            {product.rating} ★
          </span>
          <span className="rating-count">({product.rating_count?.toLocaleString()})</span>
        </div>
      )}

      <div className="product-card-price">
        <span className="price-current">{formatPrice(product.price)}</span>
        {product.original_price && product.original_price > product.price && (
          <>
            <span className="price-original">{formatPrice(product.original_price)}</span>
            <span className="price-discount">{product.discount_percent}% off</span>
          </>
        )}
      </div>

      {product.highlights && product.highlights.length > 0 && (
        <ul className="product-card-highlights">
          {product.highlights.slice(0, 3).map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductCard;
