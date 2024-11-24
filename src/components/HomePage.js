import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this points to your Firebase setup
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './HomePage.css'; // Ensure you have a CSS file to style this page

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate(); // Use navigate hook to handle navigation

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

  return (
    <div className="homepage">
      <h2>Our Courses</h2>
      <div className="courses-container">
        {courses.map((course) => (
          <div className="course-card" key={course.id}>
            <div className="course-card-header">
              <span className="availability-badge">{course.available ? 'Available' : 'Unavailable'}</span>
              <span className="category-badge">{course.categoryName}</span>
            </div>
            <img src={course.imageUrl || '/default-course.jpg'} alt={`${course.courseName}`} className="course-image" />
            <div className="course-card-body">
              <h3>{course.courseName}</h3>
              <div className="course-details">
                <span className="learners-count">{course.learners || '0'} learners</span>
                <span className="course-duration">
                  <i className="fa fa-clock-o"></i> {course.duration} hrs
                </span>
              </div>
              {/* Updated the More Info button */}
              <button
                className="more-info-button"
                onClick={() => handleMoreInfo(course.id, course.categoryName)}
              >
                More Info
              </button>

              <button className="start-course-button">Start Course</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
