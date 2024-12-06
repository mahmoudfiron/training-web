import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/MyCourses.css';
import { Link } from 'react-router-dom';

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const user = auth.currentUser;

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
              <p>Price: {course.price}$ </p>

              <Link to={`/add-lesson/${course.id}`} state={{ categoryName: course.categoryName }}>
               Add Lesson cousin
             </Link>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;