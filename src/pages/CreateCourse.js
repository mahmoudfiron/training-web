import React, { useState } from 'react';
import '../styles/CreateCourse.css';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseDetails: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    // Logic to handle form submission, e.g., send data to the backend
    alert('Your application has been submitted!');
  };

  return (
    <div className="create-course-container">
      <h1>Impact Millions Through Your Skills</h1>
      <p>Create a course on StreamFit, earn income, expand your audience, and inspire the world.</p>

      <div className="course-creator-form">
        <h2>Course Creator Information</h2>
        <form>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="courseDetails">Course Details:</label>
            <textarea id="courseDetails" name="courseDetails" value={formData.courseDetails} onChange={handleChange}></textarea>
          </div>
          <button type="button" className="submit-button" onClick={handleSubmit}>Apply to Admin</button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
