import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlistItem, isInWishlist } = useCart();
  const showToast = useToast();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getProduct(slug)
      .then(data => { setProduct(data); setSelectedImage(0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  const handleAddToCart = async () => {
    console.log("Selected Product ID:", product.id);
    if (!product) return;
    const ok = await addToCart(product.id);
    if (ok) showToast('Added to cart!', 'success');
    else showToast('Failed to add to cart', 'error');
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const ok = await addToCart(product.id);
    if (ok) navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!product) return;
    const action = await toggleWishlistItem(product.id);
    if (action === 'added') showToast('Added to wishlist!');
    else if (action === 'removed') showToast('Removed from wishlist');
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!product) return <div className="empty-state"><h2>Product not found</h2></div>;

  const images = product.images || [];
  const specs = product.specifications || {};

  return (
    <>
      <div className="product-detail">
        {/* Left - Images */}
        <div className="pd-left">
          <div className="pd-image-main">
            <img
              src={images[selectedImage]?.image_url || 'https://placehold.co/400x400/f1f3f6/878787?text=No+Image'}
              alt={product.name}
            />
          </div>

          <div className="pd-thumbnails">
            {images.map((img, i) => (
              <div
                key={img.id}
                className={`pd-thumb ${i === selectedImage ? 'active' : ''}`}
                onMouseEnter={() => setSelectedImage(i)}
                onClick={() => setSelectedImage(i)}
              >
                <img src={img.image_url} alt={`${product.name} ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="pd-actions">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              🛒 Add to Cart
            </button>
            <button
              className="btn-buy-now"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              ⚡ Buy Now
            </button>
          </div>

          <button
            onClick={handleWishlist}
            style={{
              width: '100%', marginTop: 10, padding: '10px', border: '1px solid #ddd',
              borderRadius: 3, background: '#fff', fontSize: 14, fontWeight: 500,
              color: isInWishlist(product.id) ? '#ff6161' : '#666', cursor: 'pointer'
            }}
          >
            {isInWishlist(product.id) ? '❤️ Added to Wishlist' : '♡ Add to Wishlist'}
          </button>
        </div>

        {/* Right - Details */}
        <div className="pd-right">
          <div className="pd-breadcrumb">
            <Link to="/products">Home</Link>
            {' > '}
            <Link to={`/products?category=${product.category_slug}`}>{product.category_name}</Link>
            {' > '}
            <span>{product.name}</span>
          </div>

          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            {product.rating > 0 && (
              <span className="pd-rating-badge">{product.rating} ★</span>
            )}
            <span className="pd-rating-text">
              {product.rating_count?.toLocaleString()} Ratings & Reviews
            </span>
          </div>

          <div className="pd-price-section">
            <div className="pd-price-row">
              <span className="pd-price-current">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="pd-price-original">{formatPrice(product.original_price)}</span>
                  <span className="pd-price-discount">{product.discount_percent}% off</span>
                </>
              )}
            </div>
            <div className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </div>
          </div>

          {/* Offers */}
          <div style={{ margin: '16px 0', padding: 12, background: '#f0f4ff', borderRadius: 4, fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Available Offers</div>
            <div style={{ color: '#444', lineHeight: 1.8 }}>
              <div>🏷️ Bank Offer: 5% Cashback on Flipkart Axis Bank Credit Card</div>
              <div>🏷️ Special Price: Get extra {product.discount_percent}% off (price inclusive)</div>
              <div>🚚 Free Delivery on orders above ₹500</div>
            </div>
          </div>

          {product.highlights && product.highlights.length > 0 && (
            <div className="pd-highlights">
              <h3>Highlights</h3>
              <ul>
                {product.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          )}

          {product.description && (
            <div className="pd-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {Object.keys(specs).length > 0 && (
            <div className="pd-specs">
              <h3>Specifications</h3>
              {Object.entries(specs).map(([group, entries]) => (
                <div key={group} className="spec-group">
                  <div className="spec-group-title">{group}</div>
                  {Object.entries(entries).map(([key, value]) => (
                    <div key={key} className="spec-row">
                      <span className="spec-key">{key}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <div className="related-section">
          <h2>Similar Products</h2>
          <div className="related-scroll">
            {product.related.map(r => (
              <div key={r.id} className="related-card" onClick={() => navigate(`/product/${r.slug}`)}>
                <img
                  src={r.image_url}
                  alt={r.name}
                  onError={(e) => { e.target.src = 'https://placehold.co/180x140/f1f3f6/878787?text=Image'; }}
                />
                <div className="related-card-name">{r.name}</div>
                <div className="related-card-price">{formatPrice(r.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetail;
