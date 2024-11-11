// src/components/Footer.js
import React from 'react';
import './Footer.css';  // Footer styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Follow us on:</p>
        <ul className="footer-socials">
          <li><a href="#facebook">Facebook</a></li>
          <li><a href="#instagram">Instagram</a></li>
          <li><a href="#twitter">Twitter</a></li>
        </ul>
        <p>Contact us for more details.</p>
      </div>
    </footer>
  );
};

export default Footer;
