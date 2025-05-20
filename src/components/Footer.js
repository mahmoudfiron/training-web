import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import LoginPage from '../pages/LoginPage.js'; // Ensure this path is correct
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateCourseClick = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
       const data = userSnapshot.data();
       const userRole = (data.role || '').toLowerCase();
    if (userRole === 'coach' || userRole === 'instructor') {
       navigate('/create-course');
      } else {
       alert('Only instructors can create courses.');
      }
  }

    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          
          {/* Social Media Column */}
          <div className="footer-column">
            <h3 className="footer-title">Social Media</h3>
            <div className="social-icons">
  <a href="https://www.facebook.com/mahmmoud.firon" target="_blank" rel="noopener noreferrer">
    <i className="fab fa-facebook-f"></i>
  </a>
  <a href="https://www.instagram.com/mahmoud_firon/?__pwa=1" target="_blank" rel="noopener noreferrer">
    <i className="fab fa-instagram"></i>
  </a>
  <a href="https://www.youtube.com/@mahmoudfaroun5555" target="_blank" rel="noopener noreferrer">
    <i className="fab fa-youtube"></i>
  </a>
            </div>

          </div>

          {/* Help Center Column */}
          <div className="footer-column">
           <h3 className="footer-title">Help Center</h3>
           <ul>
            <li><a href="/contact">Contact Us</a></li>
           <li><a href="/faqs">FAQs</a></li>
           <li><a href="/terms">Terms of Service</a></li>
           </ul>
          </div>

          {/* Earn on StreamFit Column */}
          <div className="footer-column">
            <h3 className="footer-title">Earn on StreamFit</h3>
            <ul>
              <li>
                <button onClick={handleCreateCourseClick} className="footer-button-link">
                  Create Courses on StreamFit
                </button>
              </li>
              <li><a href="/refer-a-friend">Refer a Friend</a></li>
            </ul>
          </div>

          {/* Learn About StreamFit Column */}
          <div className="footer-column">
            <h3 className="footer-title">Learn About StreamFit</h3>
            <ul>
              <li><a href="/learnabout#about">About StreamFit</a></li>
              <li><a href="/learnabout#story">Our Story</a></li>
              <li><a href="/learnabout#mission">Learning on StreamFit</a></li>
            </ul>
          </div>

        </div>

         <div className="footer-bottom">
             © 2025 StreamFit Inc. All rights reserved.
          </div>
      </footer>

      {showLoginModal && (
        <LoginPage isOpen={true} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default Footer;
