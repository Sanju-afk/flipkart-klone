import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>About</h4>
          <a href="#!">Contact Us</a>
          <a href="#!">About Us</a>
          <a href="#!">Careers</a>
          <a href="#!">Flipkart Stories</a>
          <a href="#!">Press</a>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <a href="#!">Payments</a>
          <a href="#!">Shipping</a>
          <a href="#!">Cancellation & Returns</a>
          <a href="#!">FAQ</a>
        </div>
        <div className="footer-col">
          <h4>Consumer Policy</h4>
          <a href="#!">Return Policy</a>
          <a href="#!">Terms Of Use</a>
          <a href="#!">Security</a>
          <a href="#!">Privacy</a>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/products">All Products</Link>
          <Link to="/cart">Shopping Cart</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">My Wishlist</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 Flipkart Clone — SDE Intern Assignment</span>
        <span>Built with React.js + Node.js + SQLite</span>
      </div>
    </footer>
  );
}

export default Footer;
