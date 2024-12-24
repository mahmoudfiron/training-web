import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import '../styles/ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const userId = auth.currentUser?.uid;

  const [profileData, setProfileData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    country: '',
    state: '',
    jobTitle: '',
    languages: '',
    contactNumber: '',
    email: '',
    profilePicture: null,
  });

  const [message, setMessage] = useState('');

  // Fetch user profile data on modal open
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData((prev) => ({
            ...prev,
            ...docSnap.data(),
            email: auth.currentUser?.email || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          profilePicture: reader.result,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage('Error: User not authenticated.');
      return;
    }

    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, profileData, { merge: true });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000); // Clear the message after 3 seconds
    } catch (error) {
      console.error('Error saving profile data:', error);
      setMessage('Error saving profile. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="modal-header">
          <h2>Edit Personal Details</h2>
          <button className="close-button" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body">
          <div className="profile-image-section">
            <label htmlFor="profile-picture-upload">
              <div className="profile-picture-wrapper">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="profile-picture"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="default-profile-icon" />
                )}
              </div>
            </label>
            <input
              type="file"
              id="profile-picture-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>

          <form className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={profileData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleChange}
                >
                  <option value="">Choose an option</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={profileData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={profileData.jobTitle}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Languages</label>
                <input
                  type="text"
                  name="languages"
                  value={profileData.languages}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Your Contact Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number (Optional)</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="text"
                    name="email"
                    value={profileData.email}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="modal-footer">
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
