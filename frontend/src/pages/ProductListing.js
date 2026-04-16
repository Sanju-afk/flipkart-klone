import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const brand = searchParams.get('brand') || '';
  const page = searchParams.get('page') || '1';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (category) params.category = category;
      if (search) params.search = search;
      if (sort) params.sort = sort;
      if (brand) params.brand = brand;
      if (searchParams.get('min_price')) params.min_price = searchParams.get('min_price');
      if (searchParams.get('max_price')) params.max_price = searchParams.get('max_price');

      const data = await api.getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, brand, page, searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.getBrands(category || undefined).then(setBrands).catch(console.error);
  }, [category]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (minPrice) params.set('min_price', minPrice); else params.delete('min_price');
    if (maxPrice) params.set('max_price', maxPrice); else params.delete('max_price');
    params.delete('page');
    setSearchParams(params);
  };

  const sortOptions = [
    { key: '', label: 'Relevance' },
    { key: 'price_asc', label: 'Price -- Low to High' },
    { key: 'price_desc', label: 'Price -- High to Low' },
    { key: 'rating', label: 'Popularity' },
    { key: 'newest', label: 'Newest First' },
    { key: 'discount', label: 'Discount' },
  ];

  const title = search ? `Search results for "${search}"` : category ? category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All Products';

  return (
    <div className="products-page">
      {/* Sidebar Filters */}
      <aside className="products-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">Filters</div>
        </div>

        {brands.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-title">Brand</div>
            {brands.map(b => (
              <label key={b.brand} className="sidebar-option">
                <input
                  type="radio"
                  name="brand"
                  checked={brand === b.brand}
                  onChange={() => updateParam('brand', brand === b.brand ? '' : b.brand)}
                />
                {b.brand} ({b.count})
              </label>
            ))}
            {brand && (
              <button
                onClick={() => updateParam('brand', '')}
                style={{ fontSize: 12, color: '#2874f0', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                Clear Brand
              </button>
            )}
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-title">Price</div>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button className="price-apply-btn" onClick={applyPriceFilter}>Apply</button>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="products-grid-wrapper">
        <div className="page-title">
          {title}
          <span className="page-title-count">
            (Showing {products.length} of {pagination.total} products)
          </span>
        </div>

        <div className="products-sort-bar">
          <span className="label">Sort By</span>
          {sortOptions.map(opt => (
            <span
              key={opt.key}
              className={`sort-option ${sort === opt.key ? 'active' : ''}`}
              onClick={() => updateParam('sort', opt.key)}
            >
              {opt.label}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : products.length === 0 ? (
          <div className="products-grid">
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h2>No products found</h2>
              <p>Try adjusting your filters or search term</p>
            </div>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => updateParam('page', String(p))}
                    style={{
                      padding: '8px 14px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      background: Number(page) === p ? '#2874f0' : '#fff',
                      color: Number(page) === p ? '#fff' : '#333',
                      fontWeight: Number(page) === p ? 600 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductListing;
