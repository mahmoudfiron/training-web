import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/MyCourses.css';
import { Link } from 'react-router-dom';

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const user = auth.currentUser;

  // Fetch enrolled courses for the instructor
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (user) {
        try {
          const enrolledCoursesRef = collection(db, 'users', user.uid, 'enrolledCourses');
          const coursesSnap = await getDocs(enrolledCoursesRef);
          const coursesList = coursesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEnrolledCourses(coursesList);
        } catch (error) {
          console.error('Error fetching enrolled courses:', error);
        }
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  // Function to handle course deletion
  const handleDeleteCourse = async (categoryName, courseId) => {
    try {
      if (!categoryName) {
        alert('Error: Cannot find the course category.');
        return;
      }

      // Delete all lessons under the course
      const lessonsRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
      const lessonsSnap = await getDocs(lessonsRef);
      const deleteLessonsPromises = lessonsSnap.docs.map(lessonDoc =>
        deleteDoc(doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lessonDoc.id))
      );
      await Promise.all(deleteLessonsPromises);

      // Delete the course document
      const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
      await deleteDoc(courseRef);

      // Remove the course from the UI
      setEnrolledCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));

      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting the course. Please try again.');
    }
  };

  return (
    <div className="my-courses">
      <h2>My Enrolled Courses</h2>
      {enrolledCourses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        <div className="courses-container">
          {enrolledCourses.map((course) => (
            <div className="course-card" key={course.id}>
              <h3>{course.courseName}</h3>
              <p>Category: {course.categoryName}</p>
              <p>Duration: {course.duration} hours</p>
              <p>Price: {course.price}$</p>          

              {/* Delete Button (Only for the course creator) */}
              {course.instructorUid === user?.uid && (
                <button
                  onClick={() => handleDeleteCourse(course.categoryName, course.id)}
                  className="delete-button"
                >
                  Delete Course
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;