// Import necessary dependencies
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming you have a firebase.js file that initializes and exports db
import { useNavigate } from 'react-router-dom'; // Step 1: Import useNavigate
import '../styles/CreateCourse.css'; // Assuming you have a CSS file to style this page

const CreateCourse = ({ user }) => {
  // State for form data
  const [formData, setFormData] = useState({
    courseName: '',
    categoryName: '',
    price: '',
    date: '',
    duration: '',
    equipment: '',
    imageUrl: '', // Added new field for image URL
    available: false, // Added availability field
    description: '', // Added course description field
    learningOutcomes: '', // Added learning outcomes field
    publisherName: '', // Added publisher name field
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Step 2: Create a navigate function

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission and add the course to Firestore
  const handleAddCourse = async (courseData) => {
    try {
      const { categoryName, ...courseInfo } = courseData;

      // Ensure categoryName is valid
      if (!categoryName) {
        setMessage('Please select a valid category.');
        return;
      }

      // Log to see the generated values
      console.log('Category:', categoryName);
      console.log('Course Info:', courseInfo);

      // Navigate to category collection and add course
      const coursesCollectionRef = collection(db, `courseCategories/${categoryName}/courses`);
      await addDoc(coursesCollectionRef, {
        ...courseInfo,
        instructorUid: user?.uid,  // Ensure you have the instructor's user ID here
        createdAt: new Date(),    // Timestamp for when the course is created
      });

      setMessage('Course added successfully');
      navigate('/'); // Step 3: Navigate to the home page after successfully adding the course
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage('Error adding course. Please try again.');
    }
  };

  // Handle form submission event
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!user) {
      setMessage('Error: User not authenticated');
      return;
    }

    handleAddCourse(formData); // Call handleAddCourse with the form data
  };

  return (
    <div className="create-course-page">
      <h2>Create a New Course</h2>
      <form onSubmit={handleSubmit} className="create-course-form">
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
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (in hours):</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
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
        <div className="form-group">
          <label htmlFor="imageUrl">Course Image URL:</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
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
          <label htmlFor="learningOutcomes">Learning Outcomes (comma-separated):</label>
          <textarea
            id="learningOutcomes"
            name="learningOutcomes"
            value={formData.learningOutcomes}
            onChange={handleChange}
            required
          />
        </div>
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
        <button type="submit" className="submit-button">Add Course</button>
      </form>
      {message && <p className="message-text">{message}</p>}
    </div>
  );
};

export default CreateCourse;