import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

function CategoryBar() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeCategory = searchParams.get('category');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="category-bar">
      <div className="category-bar-inner">
        <div
          className={`category-item ${!activeCategory ? 'active' : ''}`}
          onClick={() => navigate('/products')}
        >
          <img src="https://placehold.co/56x56/2874f0/ffffff?text=All" alt="All" />
          <span>All</span>
        </div>
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`category-item ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => navigate(`/products?category=${cat.slug}`)}
          >
            <img src={cat.image_url} alt={cat.name} onError={(e) => { e.target.src = `https://placehold.co/56x56/2874f0/ffffff?text=${cat.name.charAt(0)}`; }} />
            <span>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;
