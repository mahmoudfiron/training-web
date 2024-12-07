import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
    zoomLink: '',
    zoomPasscode: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Debugging logs
  useEffect(() => {
    console.log("categoryName:", categoryName);
    console.log("courseId:", courseId);
    console.log("lessonId:", lessonId);
  }, [categoryName, courseId, lessonId]);

  useEffect(() => {
    const fetchLessonDetails = async () => {
      if (!categoryName) {
        console.error('Error: Category name is missing.');
        setMessage('Error: Cannot find the course category.');
        setLoading(false);
        return;
      }

      try {
        const lessonRef = doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);

        if (lessonSnap.exists()) {
          console.log("Lesson data fetched successfully:", lessonSnap.data());
          setFormData(lessonSnap.data());
        } else {
          console.error('Lesson not found.');
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
      navigate('/manage-classes');
    } catch (error) {
      console.error('Error updating lesson:', error);
      setMessage('Error updating lesson. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateLesson(formData);
  };

  if (loading) {
    return <div>Loading lesson details...</div>;
  }

  return (
    <div className="edit-lesson-page">
      <h2>Edit Lesson</h2>
      <form onSubmit={handleSubmit} className="edit-lesson-form">
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
        <div className="form-group">
          <label htmlFor="zoomLink">Zoom Meeting Link:</label>
          <input
            type="text"
            id="zoomLink"
            name="zoomLink"
            value={formData.zoomLink}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="zoomPasscode">Zoom Meeting Passcode:</label>
          <input
            type="text"
            id="zoomPasscode"
            name="zoomPasscode"
            value={formData.zoomPasscode}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button">Update Lesson</button>
      </form>
      {message && <p className="message-text">{message}</p>}
    </div>
  );
};

export default EditLessonPage;
