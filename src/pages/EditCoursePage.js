import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
    imageUrl: '',
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
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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
      <h2>Edit Course</h2>
      <form onSubmit={handleSubmit} className="edit-course-form">
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
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="equipment">Equipment:</label>
          <input
            type="text"
            id="equipment"
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
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
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">Update Course</button>
      </form>
      {message && <p className="message-text">{message}</p>}
    </div>
  );
};

export default EditCoursePage;