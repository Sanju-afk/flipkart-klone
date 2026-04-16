import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import Footer from './components/Footer';
import ToastProvider from './components/Toast';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';

function App() {
  return (
    <CartProvider>
      <ToastProvider>
        <Router>
          <Header />
          <CategoryBar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<ProductListing />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </ToastProvider>
    </CartProvider>
  );
}

export default App;
