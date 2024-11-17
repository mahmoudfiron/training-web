import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of anchor tags for internal navigation
import './AuthPage.css'; // Common CSS file for Login and Signup pages
import joinUsImage from '../assets/images/join-us.webp';
import { auth } from '../firebase'; // Import Firebase Auth instance
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import createUserWithEmailAndPassword

const SignupPage = ({ isOpen, onClose, openLogin }) => {
  // State to manage form input values
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(''); // State to handle any error messages
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

  // Handle signup form submission
  const handleSignup = (e) => {
    e.preventDefault(); // Prevent the default form submission

    const { email, password } = formData;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signup successful
        console.log('User signed up:', userCredential.user);
        alert('Signup successful!'); // Optional: Notify user of successful signup
        onClose(); // Close the modal after successful signup
      })
      .catch((error) => {
        // Handle errors during signup
        console.error('Error signing up:', error.message);
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

        {/* Right Section: Signup Form */}
        <div className="auth-right-section">
          <h2>Sign Up</h2>
          <button className="social-login-button facebook">Facebook</button>
          <button className="social-login-button google">Google</button>
          <button className="social-login-button linkedin">LinkedIn</button>
          <hr className="divider" />
          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
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
            <button type="submit" className="auth-submit-button">
              Sign Up
            </button>
          </form>
          <p className="switch-form-text">
            Already have an account?{' '}
            <button onClick={openLogin} className="switch-to-login">
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
