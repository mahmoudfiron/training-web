import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import '../styles/EditCoursePage.css';

const EditCoursePage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryName } = location.state || {};

  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    equipment: '',
    price: '',
    available: false,
    learningOutcomes: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          setFormData(courseSnap.data());
        } else {
          setMessage('Course not found.');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName && courseId) {
      fetchCourseDetails();
    }
  }, [categoryName, courseId]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);

      await updateDoc(courseRef, formData);

      setMessage('Course updated successfully!');
      navigate('/instructor-courses');
    } catch (error) {
      console.error('Error updating course:', error);
      setMessage('Error updating course. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading course details...</div>;
  }

  return (
    <div className="edit-course-page">
      <form onSubmit={handleSubmit} className="edit-course-form">
        <div style={{ textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0, color: 'black' }}>
            Edit Your Course
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: 'normal', color: 'gray', marginTop: '10px', marginBottom: '40px' }}>
            Update the course details below
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
        </div>

        <div className="form-group-row">
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

        <button type="submit" className="submit-button">
          Update Course
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EditCoursePage;
