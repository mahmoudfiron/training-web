import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import '../styles/ProfileModal.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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


const [errors, setErrors] = useState({});






  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(false); // reset when modal opens
    }, [isOpen]);


  const [message, setMessage] = useState('');

  const [isSaving, setIsSaving] = useState(false);

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
    setIsDirty(true);
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

const validateForm = () => {
  const newErrors = {};

  if (!profileData.fullName || profileData.fullName.trim() === '') {
    newErrors.fullName = "Full name is required";
  }

  if (!profileData.dob) {
    newErrors.dob = "Date of birth is required";
  }

  if (!profileData.gender) {
    newErrors.gender = "Gender is required";
  }

  if (!profileData.country.trim()) {
    newErrors.country = "Country is required";
  }

  if (!profileData.jobTitle || profileData.jobTitle.trim() === '') {
    newErrors.jobTitle = "Job title is required";
  }

  if (!profileData.languages.trim()) {
    newErrors.languages = "Languages are required";
  }

  if (!profileData.email.trim()) {
    newErrors.email = "Email is required";
  }

  if (
    profileData.contactNumber &&
    !/^\d{8,15}$/.test(profileData.contactNumber.trim())
  ) {
    newErrors.contactNumber = "Enter a valid phone number (8-15 digits)";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSave = async () => {
  if (!userId) {
    toast.error('Error: User not authenticated.');
    return;
  }

  if (!validateForm() || !profileData.fullName.trim()) {
    return;
  } 

  setIsSaving(true);

  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, profileData, { merge: true });

    toast.success('✅ Profile updated successfully!');
    setMessage('Profile updated successfully!');
    setIsDirty(false);
  } catch (error) {
    console.error('Error saving profile data:', error);
    toast.error('❌ Error saving profile. Please try again.');
    setMessage('Error saving profile. Please try again.');
  } finally {
    setIsSaving(false);
    setTimeout(() => setMessage(''), 3000);
  }
};

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="modal-header">
          <h2>Edit Personal Details</h2>
      
        <button
          className="close-button"
          onClick={() => {
          if (isDirty && !window.confirm("You have unsaved changes. Close anyway?")) {
           return;
        }
         onClose();
          }}
        >
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
                {errors.fullName && (
                  <div className="error-text">{errors.fullName}</div>
                )}
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={profileData.dob}
                  onChange={handleChange}
                />
                {errors.dob && (
                  <div className="error-text">{errors.dob}</div>
               )}
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
                {errors.gender && (
                <div className="error-text">{errors.gender}</div>
                )}
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={profileData.country}
                  onChange={handleChange}
                />
                {errors.country && (
                 <div className="error-text">{errors.country}</div>
                )}
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
                {errors.jobTitle && (
                  <div className="error-text">{errors.jobTitle}</div>
                )}

              </div>
              <div className="form-group">
                <label>Languages</label>
                <input
                  type="text"
                  name="languages"
                  value={profileData.languages}
                  onChange={handleChange}
                />
                {errors.languages && (
                  <div className="error-text">{errors.languages}</div>
               )}
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
                  {errors.contactNumber && (
                  <div className="error-text">{errors.contactNumber}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="text"
                    name="email"
                    value={profileData.email}
                    readOnly
                  />
                  {errors.email && (
                  <div className="error-text">{errors.email}</div>
                  )}
                </div>
              </div>
            <ToastContainer position="top-right" autoClose={3000} />

            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="modal-footer">
          <button className="save-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>

        {message && (
          <div
          style={{
          marginTop: "10px",
          color: message.includes("success") ? "green" : "red",
          fontWeight: 500,
          }}
          >
        {message}
        </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
