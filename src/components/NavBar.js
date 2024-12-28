import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/icons/logo.webp';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginPage from '../pages/LoginPage.js';
import SignupPage from '../pages/SignupPage.js';
import ProfileModal from '../pages/ProfileModal.js';
import { getUserRoleFromFirestore } from '../utils/firebaseUtils.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Profile Modal State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // Dropdown State
  const [profilePicture, setProfilePicture] = useState(null); // State for Profile Picture
  const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] = useState(false); // Instructor Dropdown State
  const [isMyOptionsDropdownOpen, setIsMyOptionsDropdownOpen] = useState(false); // My Options Dropdown State
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const hasNavigatedAfterLogin = useRef(false); // Track if navigation after login has occurred


  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const messagesRef = collection(db, "users", user.uid, "messages");
          const messagesSnap = await getDocs(messagesRef);
          const messages = messagesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const unreadMessages = messages.filter((msg) => !msg.read);
          setNotifications(messages);
          setUnreadCount(unreadMessages.length);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [user]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
  
      if (currentUser) {
        try {
          const role = await getUserRoleFromFirestore(currentUser.uid);
          setUserRole(role);
  
          // Fetch user's profile picture from Firestore
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists() && docSnap.data().profilePicture) {
            setProfilePicture(docSnap.data().profilePicture);
          }
  
            // Navigate to the main page only if the user just logged in
            if (!hasNavigatedAfterLogin.current) {
            navigate('/');
            hasNavigatedAfterLogin.current = true; // Set flag to true after navigation
          }
            } catch (error) {
            console.error('Failed to fetch user role or profile picture: ', error);
          }  
            } else {
            setUserRole('');
            setProfilePicture(null); // Reset profile picture on logout
            hasNavigatedAfterLogin.current = false; // Reset flag when logged out
           }
          });
          
           return () => unsubscribe();
           }, [navigate]);
          
          
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert('Logged out successfully');
        navigate('/');
      })
      .catch((error) => alert(error.message));
  };
    
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsProfileDropdownOpen(false);
    
    // Fetch the updated profile picture after closing the modal
    if (user) {
      const fetchUpdatedProfilePicture = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().profilePicture) {
            setProfilePicture(docSnap.data().profilePicture);
          }
        } catch (error) {
          console.error('Error fetching updated profile picture: ', error);
        }
      };

      fetchUpdatedProfilePicture();
    }
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



        <div className="notification-bell">
        <button
          className="bell-icon" onClick={() => setIsModalOpen(!isModalOpen)}
        >
          <span className="bell">&#128276;</span>
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
      {isModalOpen && (
        <div className="notification-modal">
          <h3>Notifications</h3>
          {userRole === 'instructor' && (
        <button
          className="add-message-button"
          onClick={() => navigate('/send-message')}
        >
          Add New Message
        </button>
      )}
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id} className={!notification.read ? "unread" : ''}>
                  <p>{notification.subject}</p>
                  <span>{notification.timestamp}</span>
                  <button
                      onClick={() => navigate(`/messages/${notification.id}`)} 
                      >
                    See Full Message
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
</div>

        
          <ul className="navbar-links">
            {!user && (
              <>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faqs">FAQs</Link>
                </li>
                <li>
                  <Link to="/ratings">Ratings</Link>
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
                  <button
                    className="dropdown-button"
                    onClick={() => setIsInstructorDropdownOpen(!isInstructorDropdownOpen)}
                  >
                    Instructor Options {isInstructorDropdownOpen ? '▲' : '▼'}
                  </button>
                  {isInstructorDropdownOpen && (
                    <div className="dropdown-content">
                      <Link to="/create-course">Add Course</Link>
                      <Link to="/instructor-courses">Manage Courses</Link>
                    </div>
                  )}
                </li>
              )}
              <li className="dropdown">
                <button
                  className="dropdown-button"
                  onClick={() => setIsMyOptionsDropdownOpen(!isMyOptionsDropdownOpen)}
                >
                  My Options {isMyOptionsDropdownOpen ? '▲' : '▼'}
                </button>
                {isMyOptionsDropdownOpen && (
                  <div className="dropdown-content">
                    <Link to="/my-courses">My Courses</Link>
                  </div>
                )}
              </li>

              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
              <li className="profile-icon-container">
                {/* Profile Dropdown */}
                <div
                  className="profile-icon"
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="profile-icon-image"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true); // Open the Profile Modal
                        setIsProfileDropdownOpen(false); // Close the dropdown
                      }}
                    >
                      Edit Personal Details
                    </button>
                    <button
                      onClick={() => {
                        navigate('/financial-account');
                      }}
                    >
                      Financial Account
                    </button>
                    <button
                      onClick={() => {
                        navigate('/account-settings');
                      }}
                    >
                      Account Settings
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  className="signup-button"
                  onClick={() => setIsSignupOpen(true)}
                >
                  Sign Up
                </button>
              </li>
              <li>
                <button
                  className="login-button"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Login
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SignupPage isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal} // Close the modal
        />
      )}
    </>
  );
};

export default NavBar;
