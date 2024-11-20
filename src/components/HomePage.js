// HomePage.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this points to your Firebase setup
import './HomePage.css'; // Ensure you have a CSS file to style this page

const HomePage = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetching the courses from Firestore
    const fetchCourses = async () => {
      try {
        const coursesData = [];
        const categories = ['yoga', 'pilates', 'full-body', 'stretch', 'meditation']; // Available categories

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
              <p>{course.duration} hrs</p>
              <p>{course.learners || '0'} learners</p>
              <button className="more-info-button">More Info</button>
              <button className="start-course-button">Start Course</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
