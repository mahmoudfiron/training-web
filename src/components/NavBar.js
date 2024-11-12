import React from 'react';
import './NavBar.css';  // Assuming the CSS file is in the same directory
import logo from '../assets/logo.jpg';  // Assuming the logo is in the assets directory

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">
          <img src={logo} alt="Website Logo" className="navbar-logo-image" />
        </a>
      </div>
      <ul className="navbar-links">
        <li><a href="/courses">Courses</a></li>
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
