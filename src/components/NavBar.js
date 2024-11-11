import React from 'react';
import './NavBar.css';  // Importing CSS for styling the navbar. We'll create this later.

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">Sports Class Platform</a>
      </div>
      <ul className="navbar-links">
        <li><a href="/signup">Sign Up</a></li>
        <li><a href="/login">Login</a></li>
        <li className="dropdown">
          <button className="dropdown-button">Courses</button>
          <div className="dropdown-content">
            <a href="/yoga">Yoga</a>
            <a href="/fullbody">Full Body Training</a>
            <a href="/cardio">Cardio</a>
          </div>
        </li>
        <li><a href="/calculator">Calories Calculator</a></li>
        <li><a href="/about">About Us</a></li>
      </ul>
      <div className="navbar-search">
        <input type="text" placeholder="Search..." />
        <button>Search</button>
      </div>
    </nav>
  );
};

export default NavBar;