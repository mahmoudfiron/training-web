import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUpload } from '@fortawesome/free-solid-svg-icons';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    jobTitle: '',
    country: '',
    workExperience: '',
    education: '',
    skills: '',
    profilePicture: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    if (e.target.files.length > 0) {
      setProfileData({
        ...profileData,
        profilePicture: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  return (
    <div className="profile-page">
      {/* Main Profile Information Section */}
      <div className="profile-info">
        <div className="profile-header">
          <div className="profile-picture-section">
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
                <div className="upload-icon">
                  <FontAwesomeIcon icon={faUpload} />
                </div>
              </div>
            </label>
            <input
              type="file"
              id="profile-picture-upload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-details">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={profileData.name}
              onChange={handleChange}
              className="profile-name-input"
            />
            <hr />
            <label htmlFor="jobTitle" className="job-title-label">Current Job Title:</label>
            <input
              type="text"
              name="jobTitle"
              id="jobTitle"
              value={profileData.jobTitle}
              onChange={handleChange}
              className="job-title-input"
            />
            <label htmlFor="country" className="country-label">Country:</label>
            <select
              name="country"
              id="country"
              value={profileData.country}
              onChange={handleChange}
              className="country-select"
            >
              <option value="">Select a country</option>
              <option value="israel">Israel</option>
              <option value="spain">Spain</option>
              <option value="france">France</option>
              <option value="italy">Italy</option>
              <option value="usa">USA</option>
              <option value="japan">Japan</option>
              <option value="south-korea">South Korea</option>
              <option value="ukraine">Ukraine</option>
            </select>
          </div>
        </div>

        {/* Work Experience Section */}
        <div className="profile-section">
          <h3>Work Experience</h3>
          <textarea
            name="workExperience"
            value={profileData.workExperience}
            onChange={handleChange}
            placeholder="Add your work experience here..."
          />
        </div>

        {/* Educational History Section */}
        <div className="profile-section">
          <h3>Educational History</h3>
          <textarea
            name="education"
            value={profileData.education}
            onChange={handleChange}
            placeholder="Add your educational history here..."
          />
        </div>

        {/* Skills Section */}
        <div className="profile-section">
          <h3>Skills I Possess</h3>
          <textarea
            name="skills"
            value={profileData.skills}
            onChange={handleChange}
            placeholder="Add your skills here..."
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
