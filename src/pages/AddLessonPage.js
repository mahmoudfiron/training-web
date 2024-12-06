// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Assuming you have a firebase.js file for initializing Firebase
import '../styles/AddLessonPage.css'; // Assuming you have a CSS file to style this page

const AddLessonPage = () => {
  // State for form data
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    zoomLink: '',
    zoomPasscode: '',
  });
  const [message, setMessage] = useState('');
  const [courseName, setCourseName] = useState('');
  const { courseId } = useParams(); // Extract courseId from URL params
  const location = useLocation(); // To get state information passed through Link
  const navigate = useNavigate();

  // Extract categoryName from the location state
  const { categoryName } = location.state || {}; // This will help to get categoryName if passed correctly

  // Check if categoryName is available, if not, handle it properly
  useEffect(() => {
    if (!categoryName) {
      console.error('Error: Category name is not defined.');
      setMessage('Error: Cannot find the course category. Please go back and try again.');
      return;
    }
  }, [categoryName]);

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
      if (!categoryName) {
        setMessage('Error: Cannot find the course category.');
        return;
      }

      console.log("categoryName:", categoryName);
      console.log("courseId:", courseId);

      // Reference to add a new lesson under the specific course
      const lessonsCollectionRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
      await addDoc(lessonsCollectionRef, {
        ...lessonData,
        instructorUid: auth.currentUser?.uid,  // Ensure you have the instructor's user ID here
        createdAt: new Date(), // Timestamp for when the lesson is created
      });

      setMessage('Lesson added successfully');
      navigate('/manage-classes'); // Navigate to Manage Classes page after adding the lesson
    } catch (error) {
      console.error('Error adding lesson:', error);
      setMessage('Error adding lesson. Please try again.');
    }
  };

  // Handle form submission event
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!auth.currentUser) {
      setMessage('Error: User not authenticated');
      return;
    }

    handleAddLesson(formData); // Call handleAddLesson with the form data
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
    </div>
  );
};

export default AddLessonPage;