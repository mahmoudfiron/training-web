import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/icons/logo.jpg'; // Ensure this path is correct
import { auth } from '../firebase'; // Import auth from the correct location
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut and onAuthStateChanged directly from firebase/auth
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert('Logged out successfully');
        navigate('/');
      })
      .catch((error) => alert(error.message));
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Website Logo" className="navbar-logo-image" />
          </Link>
        </div>
        <ul className="navbar-links">
          <li className="dropdown">
            <button className="dropdown-button">
              Courses <span className="dropdown-arrow"></span>
            </button>
            <div className="dropdown-content">
              <Link to="/courses/yoga">Yoga</Link>
              <Link to="/courses/pilates">Pilates</Link>
              <Link to="/courses/fullbody">Full Body Training</Link>
              <Link to="/courses/stretch">Stretch & Flexibility</Link>
              <Link to="/courses/meditation">Meditation & Mindfulness</Link>
            </div>
          </li>
          <li>
            <Link to="/calculator">Calories Calculator</Link>
          </li>
          <li>
            <Link to="/learnabout">Learn About</Link>
          </li>
        </ul>
        <div className="navbar-search">
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div>
        <ul className="navbar-actions">
          {user ? (
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li>
                <button onClick={() => setIsSignupOpen(true)}>Sign Up</button>
              </li>
              <li>
                <button onClick={() => setIsLoginOpen(true)}>Login</button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Login and Signup Modals */}
      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SignupPage isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </>
  );
};

export default NavBar;
