import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css'; // Common CSS file for Login and Signup pages
import joinUsImage from '../assets/images/join-us.webp';
import { auth } from '../firebase'; // Import Firebase Auth instance
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import signInWithEmailAndPassword from Firebase

const LoginPage = ({ isOpen, onClose, openSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(''); // State to manage error messages
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle login form submission
  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = formData;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Login successful
        console.log('User logged in:', userCredential.user);
        alert('Login successful!'); // Optional: Notify user of successful login
        onClose(); // Close the modal after successful login
      })
      .catch((error) => {
        // Handle errors during login
        console.error('Error logging in:', error.message);
        setError(error.message);
      });
  };

  const handleCourseCreatorClick = () => {
    onClose(); // Close the modal
    navigate('/create-course'); // Navigate to Create Course page
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        {/* Left Section */}
        <div className="auth-left-section">
          <img src={joinUsImage} alt="Join Us" className="auth-image" />
          <div className="auth-left-text">
            <h2>Join StreamFit for an Amazing Fitness Experience</h2>
            <p>
              Get access to the best instructors and a variety of courses, all from the comfort of your home. Start your fitness journey today and achieve your goals!
            </p>
            <button onClick={handleCourseCreatorClick} className="course-creator-link">
              Are you a course creator? Click Here
            </button>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="auth-right-section">
          <h2>Log In</h2>
          <button className="social-login-button facebook">Facebook</button>
          <button className="social-login-button google">Google</button>
          <button className="social-login-button linkedin">LinkedIn</button>
          <hr className="divider" />
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error && <p className="error-text">{error}</p>} {/* Display any error messages */}
            <div className="form-options">
              <label>
                <input type="checkbox" /> Keep me logged in
              </label>
            </div>
            <button type="submit" className="auth-submit-button">Log In</button>
          </form>
          <p className="switch-form-text">
            Don't have an account?{' '}
            <button onClick={openSignup} className="switch-to-signup">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
