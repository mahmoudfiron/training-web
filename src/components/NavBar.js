import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/icons/logo.webp';
import { auth } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginPage from '../pages/LoginPage.js';
import SignupPage from '../pages/SignupPage.js';
import { getUserRoleFromFirestore } from '../utils/firebaseUtils.js';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const role = await getUserRoleFromFirestore(currentUser.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Failed to fetch user role: ', error);
        }
      } else {
        setUserRole('');
      }
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
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Website Logo" className="navbar-logo-image" />
          </Link>
        </div>

        {/* Center Section */}
        <div className="navbar-center">
          <ul className="navbar-links">
            {!user && (
              <>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faqs">FAQs</Link>
                </li>
              </>
            )}
            {user && (
              <>
                <li>
                  <Link to="/calculator">Calories Calculator</Link>
                </li>
                <li>
                  <Link to="/calendar">My Calendar</Link>
                </li>
              </>
            )}
            <li>
              <Link to="/learnabout">About Us</Link>
            </li>
          </ul>
          <div className="navbar-search">
            <input type="text" placeholder="Search..." />
            <button>Search</button>
          </div>
        </div>

        {/* Right Section */}
        <ul className="navbar-actions">
          {user ? (
            <>
              {userRole === 'instructor' && (
                <li className="dropdown">
                  <button className="dropdown-button">
                    Instructor Options ▼
                  </button>
                  <div className="dropdown-content">
                    <Link to="/create-course">Add Course</Link>
                    <Link to="/instructor-courses">Manage Courses</Link>
                  </div>
                </li>
              )}
              <li className="dropdown">
                <button className="dropdown-button">
                  My Options ▼ 
                  </button>
                <div className="dropdown-content">
                  <Link to="/my-courses">My Courses</Link>
                </div>
              </li>
              
              <li>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </li>
              <li>
                <button className="profile-button" onClick={() => navigate('/profile')}>Profile</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button className="signup-button" onClick={() => setIsSignupOpen(true)}>Sign Up</button>
              </li>
              <li>
                <button className="login-button" onClick={() => setIsLoginOpen(true)}>Login</button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SignupPage isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </>
  );
};

export default NavBar;
