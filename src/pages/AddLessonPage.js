// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, getDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Assuming you have a firebase.js file for initializing Firebase
import '../styles/AddLessonPage.css'; // Assuming you have a CSS file to style this page

const AddLessonPage = () => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    zoomLink: '',
    zoomPasscode: '',
  });
  const [message, setMessage] = useState('');
  const [lessons, setLessons] = useState([]); // To store existing lessons
  const [courseName, setCourseName] = useState('');
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryName } = location.state || {};

  // Fetch course details for context
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!categoryName) return;

      try {
        const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          setCourseName(courseSnap.data().courseName);
        } else {
          console.warn('Course not found');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };

    if (courseId && categoryName) {
      fetchCourseDetails();
    }
  }, [courseId, categoryName]);

  // Fetch lessons for the course
  useEffect(() => {
    const fetchLessons = async () => {
      if (!categoryName) return;

      try {
        const lessonsRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
        const lessonsSnapshot = await getDocs(lessonsRef);
        const lessonsList = lessonsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLessons(lessonsList);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    };

    fetchLessons();
  }, [categoryName, courseId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission to add a lesson
  const handleAddLesson = async (lessonData) => {
    try {
      const lessonsCollectionRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
      const docRef = await addDoc(lessonsCollectionRef, {
        ...lessonData,
        instructorUid: auth.currentUser?.uid,
        createdAt: new Date(),
      });

      setLessons((prevLessons) => [
        ...prevLessons,
        { id: docRef.id, ...lessonData },
      ]);

      setMessage('Lesson added successfully');
    } catch (error) {
      console.error('Error adding lesson:', error);
      setMessage('Error adding lesson. Please try again.');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const lessonRef = doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lessonId);
      await deleteDoc(lessonRef);
      setLessons((prevLessons) => prevLessons.filter((lesson) => lesson.id !== lessonId));
      setMessage('Lesson deleted successfully');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setMessage('Error deleting lesson. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setMessage('Error: User not authenticated');
      return;
    }

    handleAddLesson(formData);
  };

  return (
    <div className="add-lesson-page">
      <h2>Add a Lesson to {courseName}</h2>
      <form onSubmit={handleSubmit} className="add-lesson-form">
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
        <button type="submit" className="submit-button">Add Lesson</button>
      </form>

      {message && <p className="message-text">{message}</p>}

      <h3>Existing Lessons</h3>
      <div className="lessons-list">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-item">
            <p>Date: {lesson.date}</p>
            <p>Start Time: {lesson.startTime}</p>
            <p>End Time: {lesson.endTime}</p>
            <button onClick={() => handleDeleteLesson(lesson.id)} className="delete-button">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AddLessonPage;