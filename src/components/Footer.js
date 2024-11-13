import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Social Media Column */}
        <div className="footer-column">
          <h3 className="footer-title">Social Media</h3>
          <div className="social-icons">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a>
            <a href="https://www.tiktok.com" target="_blank" rel="noreferrer"><i className="fab fa-tiktok"></i></a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        {/* Events Column */}
        <div className="footer-column">
          <h3 className="footer-title">Events</h3>
          <ul>
            <li><a href="/e-learning-israel">E-learning Israel</a></li>
            <li><a href="/upcoming-webinars">Upcoming Webinars</a></li>
          </ul>
        </div>

        {/* Earn on StreamFit Column */}
        <div className="footer-column">
          <h3 className="footer-title">Earn on StreamFit</h3>
          <ul>
            <li><a href="/create-courses">Create Courses on StreamFit</a></li>
            <li><a href="/refer-a-friend">Refer a Friend</a></li>
          </ul>
        </div>

        {/* Learn About StreamFit Column */}
        <div className="footer-column">
          <h3 className="footer-title">Learn About StreamFit</h3>
          <ul>
            <li><a href="/about-streamfit">About StreamFit</a></li>
            <li><a href="/our-story">Our Story</a></li>
            <li><a href="/learning-on-streamfit">Learning on StreamFit</a></li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
