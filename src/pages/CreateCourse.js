import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateCourse.css';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    courseName: '',
    categoryName: '',
    price: '',
    equipment: '',
    imageBase64: '', // Store Base64-encoded image
    available: false,
    description: '',
    learningOutcomes: '',
    publisherName: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'imageFile' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageBase64: reader.result, // Save Base64 string
        });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleAddCourse = async (courseData) => {
    try {
      const { categoryName, ...courseInfo } = courseData;

      if (!categoryName) {
        setMessage('Please select a valid category.');
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setMessage('Error: User is not authenticated.');
        return;
      }

      const coursesCollectionRef = collection(db, `courseCategories/${categoryName}/courses`);
      await addDoc(coursesCollectionRef, {
        ...courseInfo,
        categoryName,
        instructorUid: user.uid,
        createdAt: new Date().toISOString(),
      });

      setMessage('Course added successfully.');
      navigate('/instructor-courses');
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage('Error adding course. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddCourse(formData);
  };

  return (
    <div className="create-course-page">

<form onSubmit={handleSubmit} className="create-course-form">
<div style={{ textAlign: 'center', fontFamily: "'Poppins', sans-serif"}}>
  <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0, color: 'black' }}>
    Let`s get you started
  </h2>
  <p style={{ fontSize: '1rem', fontWeight: 'normal', color: 'gray', marginTop: '10px', marginBottom:'40px' }}>
    Enter the details to get going
  </p>
</div>

  <div className="form-group-row">
    <div className="form-group">
      <label htmlFor="courseName">Course Name:</label>
      <input
        type="text"
        id="courseName"
        name="courseName"
        value={formData.courseName}
        onChange={handleChange}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="categoryName">Category Name:</label>
      <select
        id="categoryName"
        name="categoryName"
        value={formData.categoryName}
        onChange={handleChange}
        required
      >
        <option value="">Select a category</option>
        <option value="yoga">Yoga</option>
        <option value="pilates">Pilates</option>
        <option value="full-body">Full Body Training</option>
        <option value="stretch">Stretch & Flexibility</option>
        <option value="meditation">Meditation & Mindfulness</option>
      </select>
    </div>
  </div>

  <div className="form-group-row">
    <div className="form-group">
      <label htmlFor="price">Price:</label>
      <input
        type="number"
        id="price"
        name="price"
        value={formData.price}
        onChange={handleChange}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="equipment">Equipment Required:</label>
      <input
        type="text"
        id="equipment"
        name="equipment"
        value={formData.equipment}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="form-group-row">
    <div className="form-group">
      <label htmlFor="imageFile">Course Image:</label>
      <input
        type="file"
        id="imageFile"
        name="imageFile"
        accept="image/*"
        onChange={handleChange}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="available">Available:</label>
      <input
        type="checkbox"
        id="available"
        name="available"
        checked={formData.available}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="form-group-row">
    <div className="form-group">
      <label htmlFor="description">Course Description:</label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="learningOutcomes">Learning Outcomes:</label>
      <textarea
        id="learningOutcomes"
        name="learningOutcomes"
        value={formData.learningOutcomes}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <div className="form-group-row">
    <div className="form-group">
      <label htmlFor="publisherName">Publisher Name:</label>
      <input
        type="text"
        id="publisherName"
        name="publisherName"
        value={formData.publisherName}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <button type="submit" className="submit-button">
    Add Course
  </button>
</form>

      {message && <p className="message-text">{message}</p>}
    </div>
  );
};

export default CreateCourse;
