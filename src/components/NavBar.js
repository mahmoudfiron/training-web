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
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] = useState(false);
  const [isMyOptionsDropdownOpen, setIsMyOptionsDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasNavigatedAfterLogin = useRef(false);
  const modalRef = useRef(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
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

  // Close the modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !bellRef.current.contains(event.target)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const role = await getUserRoleFromFirestore(currentUser.uid);
          setUserRole(role);

          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().profilePicture) {
            setProfilePicture(docSnap.data().profilePicture);
          }

          if (!hasNavigatedAfterLogin.current) {
            navigate('/');
            hasNavigatedAfterLogin.current = true;
          }
        } catch (error) {
          console.error('Failed to fetch user role or profile picture: ', error);
        }
      } else {
        setUserRole('');
        setProfilePicture(null);
        hasNavigatedAfterLogin.current = false;
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle opening of notification modal and marking notifications as read
  const handleNotificationClick = async () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen && unreadCount > 0) {
      notifications.forEach(async (notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, "users", user.uid, "messages", notification.id);
          await updateDoc(notificationRef, { read: true });
        }
      });
      setUnreadCount(0);  // Reset unread count after marking as read
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const secondsDiff = Math.floor((now - messageTime) / 1000);

    if (secondsDiff < 60) return `${secondsDiff} seconds ago`;
    const minutesDiff = Math.floor(secondsDiff / 60);
    if (minutesDiff < 60) return `${minutesDiff} minutes ago`;
    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24) return `${hoursDiff} hours ago`;
    const daysDiff = Math.floor(hoursDiff / 24);
    return `${daysDiff} days ago`;
  };

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
              ref={bellRef}
              className="bell-icon"
              onClick={handleNotificationClick}
            >
              <span className="bell">&#128276;</span>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
          {isModalOpen && (
            <div className="notification-modal" ref={modalRef}>
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
                    <li 
                    key={notification.id}
                     className={!notification.read ? "unread" : ''}
                     >
                      <p>{notification.subject}</p>
                      <span className="timestamp"> before&nbsp;
                      {formatRelativeTime(notification.timestamp)}
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <button
                          className="text-button"
                          onClick={() => navigate(`/messages/${notification.id}`)} 
                          >
                        See Full Message
                      </button>
                      </span>
                      
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
                <Link to="/CalculatorPage">Calories Calculator</Link>
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
                        setIsProfileModalOpen(true);
                        setIsProfileDropdownOpen(false);
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

      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
        />
      )}
    </>
  );
};

export default NavBar;
