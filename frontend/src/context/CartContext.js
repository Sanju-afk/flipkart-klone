import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], summary: { itemCount: 0, subtotal: 0, total: 0, discount: 0, deliveryCharges: 0, originalTotal: 0 } });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const addToCart = async (productId, qty = 1) => {
    setLoading(true);
    try {
      await api.addToCart(productId, qty);
      await fetchCart();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally { setLoading(false); }
  };

  const updateQuantity = async (itemId, qty) => {
    try {
      await api.updateCartItem(itemId, qty);
      await fetchCart();
    } catch (e) { console.error(e); }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeFromCart(itemId);
      await fetchCart();
    } catch (e) { console.error(e); }
  };

  const toggleWishlistItem = async (productId) => {
    try {
      const res = await api.toggleWishlist(productId);
      await fetchWishlist();
      return res.action;
    } catch (e) { console.error(e); return null; }
  };

  const isInWishlist = (productId) => wishlist.some(w => w.product_id === productId);

  return (
    <CartContext.Provider value={{
      cart, wishlist, loading, addToCart, updateQuantity, removeItem, fetchCart,
      toggleWishlistItem, isInWishlist, fetchWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
