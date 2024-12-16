import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css'; // Common CSS file for Login and Signup pages
import joinUsImage from '../assets/images/join-us.webp';
import { auth, db } from '../firebase.js'; // Import Firebase Auth and Firestore instances
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignupPage = ({ isOpen, onClose, openLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'regular_user' // Default role is 'regular_user'
  });
  const [error, setError] = useState('');
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
    e.preventDefault();

    const { email, password, fullName, role } = formData;

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log('User signed up:', user);

        // Store user information in Firestore, including their role
        await setDoc(doc(db, 'users', user.uid), {
          fullName,
          email,
          role,
        });

        alert('Signup successful!');
        onClose();
      })
      .catch((error) => {
        console.error('Error signing up:', error.message);
        setError(error.message);
      });
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
            <button onClick={() => navigate('/create-course')} className="course-creator-link">
              Are you a course creator? Click Here
            </button>
          </div>
        </div>

        {/* Right Section: Signup Form */}
        <div className="auth-right-section">
          <h2>Sign Up</h2>
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
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="role-select"
            >
              <option value="regular_user">Regular User</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
            {error && <p className="error-text">{error}</p>}
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
