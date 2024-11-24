import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import '../styles/CourseDetails.css'; // Import CourseDetails CSS

const CourseDetails = () => {
  const { courseId, categoryName } = useParams(); // Destructure categoryName and courseId from the params
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
        const courseSnap = await getDoc(docRef);

        if (courseSnap.exists()) {
          setCourse(courseSnap.data());
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    fetchCourse();
  }, [categoryName, courseId]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="course-details-page">
      <div className="course-header">
        <img src={course.imageUrl || '/default-course.jpg'} alt={course.courseName} className="course-image" />
        <div className="course-info">
          <h2>{course.courseName}</h2>
          <p>{course.description}</p>
          <p><strong>Duration:</strong> {course.duration} hours</p>
          <p><strong>Equipment:</strong> {course.equipment}</p>
          <p><strong>Availability:</strong> {course.available ? 'Available' : 'Unavailable'}</p>
          <button className="start-course-button">Start Course Now</button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;