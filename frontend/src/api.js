const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}
console.log("API_BASE:", API_BASE);
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log("CALLING:", url); // 👈 IMPORTANT

  const res = await fetch(url, options);

  const text = await res.text(); // 👈 read raw response
  console.log("RAW RESPONSE:", text); // 👈 THIS WILL EXPOSE EVERYTHING

  return JSON.parse(text); // will crash here (expected)
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(`/products?${qs}`);
  },
  getProduct: (slug) => apiCall(`/products/${slug}`),
  getBrands: (category) => apiCall(`/products/brands${category ? `?category=${category}` : ''}`),

  // Categories
  getCategories: () => apiCall('/categories'),

  // Cart
  getCart: () => apiCall('/cart'),
  addToCart: (product_id, quantity = 1) => apiCall('/cart', { method: 'POST', body: { product_id, quantity } }),
  updateCartItem: (id, quantity) => apiCall(`/cart/${id}`, { method: 'PUT', body: { quantity } }),
  removeFromCart: (id) => apiCall(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => apiCall('/cart', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => apiCall('/wishlist'),
  toggleWishlist: (product_id) => apiCall('/wishlist', { method: 'POST', body: { product_id } }),
  removeFromWishlist: (id) => apiCall(`/wishlist/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => apiCall('/orders'),
  getOrder: (id) => apiCall(`/orders/${id}`),
  placeOrder: (address) => apiCall('/orders', { method: 'POST', body: { address } }),
};
