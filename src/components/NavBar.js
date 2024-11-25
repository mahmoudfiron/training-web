import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/icons/logo.jpg';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import { getUserRoleFromFirestore } from '../utils/firebaseUtils';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(''); // State to hold user role
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Fetch the user's role when they log in
      if (currentUser) {
        try {
          const role = await getUserRoleFromFirestore(currentUser.uid);
          setUserRole(role);
        } catch (error) {
          console.error("Failed to fetch user role: ", error);
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
              <Link to="/courses/yoga">Yogaa</Link>
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
            <>
              {/* Adding the Instructor Link */}
              {userRole === 'instructor' && (
                <li>
                  <Link to="/create-course">Add Course</Link>
                </li>
              )}
               <li>
                <Link to="/my-courses">My Courses</Link> {/* Link to My Courses */}
              </li>
              
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
              <li>
                <button
                  className="profile-button"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button onClick={() => setIsSignupOpen(true)} className="signup-button">
                  Sign Up
                </button>
              </li>
              <li>
                <button onClick={() => setIsLoginOpen(true)} className="login-button">
                  Login
                </button>
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
