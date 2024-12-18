import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js'; // Ensure this points to your Firebase setup
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { onAuthStateChanged } from 'firebase/auth';
import './HomePage.css'; // Ensure you have a CSS file to style this page

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const navigate = useNavigate(); // Use navigate hook to handle navigation

  useEffect(() => {
    // Set current user and fetch their enrolled courses
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchEnrolledCourses(currentUser.uid);
      } else {
        setEnrolledCourses([]);
        setLoadingEnrolled(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEnrolledCourses = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setEnrolledCourses(userDoc.data().enrolledCourses || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoadingEnrolled(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = [];
        const categories = ['yoga', 'pilates', 'full-body', 'stretch', 'meditation'];

        for (const category of categories) {
          const coursesSnapshot = await getDocs(collection(db, `courseCategories/${category}/courses`));
          coursesSnapshot.forEach((doc) => {
            coursesData.push({ id: doc.id, ...doc.data(), categoryName: category });
          });
        }

        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Update handleMoreInfo to be triggered when the button is clicked
  const handleMoreInfo = (courseId, categoryName) => {
    console.log(`Navigating to course-details for category: ${categoryName}, course ID: ${courseId}`);
    navigate(`/course-details/${categoryName}/${courseId}`);
  };

  if (loadingEnrolled) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="homepage">
      <div className="courses-container">
        {courses.map((course) => {
          const isEnrolled = enrolledCourses.includes(course.id);
          return (
            
            <div className="course-card" key={course.id}>
              <div className="course-card-header">
                <span className="availability-badge">{course.available ? 'Available' : 'Unavailable'}</span>
                <span className="category-badge">{course.categoryName}</span>
              </div>
              <img src={course.imageBase64 || '/default-course.jpg'} alt={`${course.courseName}`} className="course-image" />
              <div className="course-card-body">
                <h3>{course.courseName}</h3>
                <div className="course-details">
                  <span className="learners-count">{course.learners || '0'} learners</span>
                  <span className="course-duration">
                    <i className="fa fa-clock-o"></i> {course.duration} hrs
                  </span>
                </div>

                <button
                  className="more-info-button"
                  onClick={() => handleMoreInfo(course.id, course.categoryName)}
                >
                  More Info
                </button>

                {isEnrolled ? (
                  <span className="enrolled-badge">Enrolled</span>
                ) : (
                  <button
                    className="start-course-button"
                    onClick={() => navigate(`/course-payment/${course.categoryName}/${course.id}`)}
                  >
                    Start Course Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;