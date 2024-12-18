import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, getDoc, doc, getDocs, deleteDoc  } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/AddLessonPage.css';

const AddLessonPage = () => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [message, setMessage] = useState('');
  const [lessons, setLessons] = useState([]); 
  const [courseName, setCourseName] = useState('');
  const { courseId } = useParams();
  const location = useLocation();
  const { categoryName } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!categoryName) return;

      try {
        const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          setCourseName(courseSnap.data().courseName);
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







  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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


  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2024-12-16T${startTime}:00`);
    const end = new Date(`2024-12-16T${endTime}:00`);
    return Math.round((end - start) / 60000); // Duration in minutes
  };

  const generateZoomMeeting = async (lessonData) => {
    try {
      const response = await fetch('http://localhost:3001/generateZoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agenda: `Lesson: ${courseName}`,
          start_time: `${lessonData.date}T${lessonData.startTime}:00`,
          topic: `Lesson on ${lessonData.date}`,
          duration: calculateDuration(lessonData.startTime, lessonData.endTime),
        }),
      });

      const zoomData = await response.json();

      if (!response.ok) {
        throw new Error(zoomData.message || 'Failed to generate Zoom meeting.');
      }

      return zoomData; // Contains join_url, start_url, and password
    } catch (error) {
      console.error('Error generating Zoom meeting:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const zoomDetails = await generateZoomMeeting(formData);


      if (!auth.currentUser) {
        setMessage('Error: User not authenticated');
        return;
      }
      if (!zoomDetails) {
        setMessage('Failed to create Zoom meeting. Try again.');
        return;
      }

      const lessonData = {
        ...formData,
        instructorUid: auth.currentUser?.uid,
        zoomJoinUrl: zoomDetails.join_url,
        zoomStartUrl: zoomDetails.start_url,
        zoomPassword: zoomDetails.password,
        createdAt: new Date(),
      };

      const lessonsCollectionRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
      await addDoc(lessonsCollectionRef, lessonData);

      setMessage('Lesson and Zoom meeting created successfully!');
      navigate('/instructor-courses');
    } catch (error) {
      console.error('Error adding lesson:', error);
      setMessage('Error adding lesson. Please try again.');
    }
  };

  return (
    <div className="add-lesson-page">
      <h2>Add a Lesson to {courseName}</h2>
      <form onSubmit={handleSubmit} className="add-lesson-form">
        <div className="form-group">
          <label htmlFor="date">Lesson Date:</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Start Time:</label>
          <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">End Time:</label>
          <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
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
