import React from 'react';
import './NavBar.css';  // Assuming the CSS file is in the same directory
import logo from '../assets/icons/logo.jpg';  // Assuming the logo is in the assets directory

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">
          <img src={logo} alt="Website Logo" className="navbar-logo-image" />
        </a>
      </div>
      <ul className="navbar-links">
        <li className="dropdown">
          <button className="dropdown-button">
            Courses <span className="dropdown-arrow"></span>
          </button>
          <div className="dropdown-content">
            <a href="/yoga">Yoga</a>
            <a href="/pilates">Pilates</a>
            <a href="/fullbody">Full Body Training</a>
            <a href="/stretch">Stretch & Flexibility</a>
            <a href="/meditation">Meditation & Mindfulness</a>
          </div>
        </li>
        <li><a href="/calculator">Calories Calculator</a></li>
        <li><a href="/about">About Us</a></li>
      </ul>
      <div className="navbar-search">
        <input type="text" placeholder="Search..." />
        <button>Search</button>
      </div>
      <ul className="navbar-actions">
        <li><a href="/signup">Sign Up</a></li>
        <li><a href="/login">Login</a></li>
      </ul>
    </nav>
  );
};

export default NavBar;
