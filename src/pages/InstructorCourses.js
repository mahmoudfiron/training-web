import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/InstructorCourses.css';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorCourses = async (userId) => {
      try {
        const coursesData = [];
        const categories = ['yoga', 'pilates', 'full-body', 'stretch', 'meditation'];

        for (const category of categories) {
          const coursesSnapshot = await getDocs(collection(db, `courseCategories/${category}/courses`));
          coursesSnapshot.forEach((doc) => {
            const courseData = { id: doc.id, ...doc.data(), categoryName: category };
            if (courseData.instructorUid === userId) {
              coursesData.push(courseData);
            }
          });
        }

        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching instructor courses:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchInstructorCourses(currentUser.uid);
      } else {
        setCourses([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteCourse = async (categoryName, courseId) => {
    try {
      const courseRef = doc(db, `courseCategories/${categoryName}/courses`, courseId);
      await deleteDoc(courseRef);

      const usersSnapshot = await getDocs(collection(db, 'users'));

      for (const userDoc of usersSnapshot.docs) {
        const enrolledCoursesRef = collection(db, `users/${userDoc.id}/enrolledCourses`);
        const enrolledCoursesSnapshot = await getDocs(enrolledCoursesRef);

        for (const enrolledDoc of enrolledCoursesSnapshot.docs) {
          if (enrolledDoc.id === courseId) {
            const enrolledCourseRef = doc(db, `users/${userDoc.id}/enrolledCourses`, enrolledDoc.id);
            await deleteDoc(enrolledCourseRef);
          }
        }
      }

      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
      alert('Course and its enrollments deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading your courses...</div>;
  }

  return (
    <div className="instructor-courses">
      <h2>Your Created Courses</h2>
      {courses.length === 0 ? (
        <p>You have not created any courses yet.</p>
      ) : (
        <div className="courses-container">
          {courses.map((course) => (
            <div
              className="course-card"
              key={course.id}
              onClick={(e) => {
                if (!e.target.closest('.edit-button') && !e.target.closest('.delete-button')) {
                  navigate(`/lessons/${course.id}`, { state: { categoryName: course.categoryName, isInstructor: true } });
                }
              }}
            >
              <div className="course-card-header"></div>
              <div className="course-card-body">
                <h3>{course.courseName}</h3>
                <div className="course-details">
                  <p>
                    <strong>Category:</strong> {course.categoryName}
                  </p>
                  <p>
                    <strong>Price:</strong> ${course.price}
                  </p>
                </div>

                <Link
                  to={`/edit-course/${course.id}`}
                  state={{ categoryName: course.categoryName }}
                  className="edit-button"
                  onClick={(e) => e.stopPropagation()} // Prevent propagation to the card click event
                >
                  Edit Course
                </Link>


                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent propagation to the card click event
                    handleDeleteCourse(course.categoryName, course.id);
                  }}
                >
                  Delete Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
