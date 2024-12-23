import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import '../styles/EditLessonPage.css';

const EditLessonPage = () => {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryName } = location.state || {};

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonDetails = async () => {
      if (!categoryName) {
        setMessage('Error: Cannot find the course category.');
        setLoading(false);
        return;
      }

      try {
        const lessonRef = doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);

        if (lessonSnap.exists()) {
          setFormData(lessonSnap.data());
        } else {
          setMessage('Error: Lesson not found.');
        }
      } catch (error) {
        console.error('Error fetching lesson details:', error);
        setMessage('Error fetching lesson details.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetails();
  }, [categoryName, courseId, lessonId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateLesson = async (updatedData) => {
    try {
      if (!categoryName) {
        setMessage('Error: Cannot find the course category.');
        return;
      }

      const lessonRef = doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lessonId);
      await updateDoc(lessonRef, updatedData);

      setMessage('Lesson updated successfully!');
      navigate(`/lessons/${courseId}`, { state: { categoryName, isInstructor: true } });
    } catch (error) {
      console.error('Error updating lesson:', error);
      setMessage('Error updating lesson. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };
    handleUpdateLesson(updatedData);
  };

  if (loading) {
    return <div>Loading lesson details...</div>;
  }

  return (
    <div className="edit-lesson-container">
      <h2>Edit Your Lesson Details</h2>
      <p>Fine-Tune Your Class with Ease below:</p>
      <form onSubmit={handleSubmit} className="form-layout">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Lesson Date:</label>
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
            <label htmlFor="startTime">Start Time:</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endTime">End Time:</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <button type="submit" className="submit-button">Update Lesson</button>
        </div>
      </form>
      {message && <p className="message-text">{message}</p>}
    </div>
  );
};

export default EditLessonPage;
