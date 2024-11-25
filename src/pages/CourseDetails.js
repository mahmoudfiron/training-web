import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/CourseDetails.css'; // Import CourseDetails CSS

const CourseDetails = () => {
  const { courseId, categoryName } = useParams();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Fetch the course details
        const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          setCourse(courseSnap.data());

          // Check if the user is already enrolled in this course
          if (user) {
            const enrolledCourseRef = doc(db, 'users', user.uid, 'enrolledCourses', courseId);
            const enrolledSnap = await getDoc(enrolledCourseRef);
            if (enrolledSnap.exists()) {
              setIsEnrolled(true);
            }
          }
        } else {
          console.error('No such course found!');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    fetchCourse();
  }, [categoryName, courseId, user]);

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
          {!isEnrolled ? (
            <button className="start-course-button">Start Course Now</button>
          ) : (
            <p>You are already enrolled in this course. Please visit the "My Courses" section to access it.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;