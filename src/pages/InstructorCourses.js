import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/InstructorCourses.css';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Step 1: Delete the course from the courses collection
      const courseRef = doc(db, `courseCategories/${categoryName}/courses`, courseId);
      await deleteDoc(courseRef);
      console.log(`Deleted course from category: ${categoryName}, courseId: ${courseId}`);
    
      // Step 2: Delete the course from all users' enrolledCourses subcollections
      const usersSnapshot = await getDocs(collection(db, 'users')); // Get all users
    
      for (const userDoc of usersSnapshot.docs) {
        const enrolledCoursesRef = collection(db, `users/${userDoc.id}/enrolledCourses`);
        const enrolledCoursesSnapshot = await getDocs(enrolledCoursesRef);
    
        for (const enrolledDoc of enrolledCoursesSnapshot.docs) {
          // Check if the enrolled course matches the deleted course ID
          if (enrolledDoc.id === courseId) {
            const enrolledCourseRef = doc(db, `users/${userDoc.id}/enrolledCourses`, enrolledDoc.id);
            await deleteDoc(enrolledCourseRef); // Directly delete the enrolled course
            console.log(`Deleted enrolled course: ${enrolledDoc.id} for user: ${userDoc.id}`);
          }
        }
      }
    
      // Step 3: Update the state to remove the course from the UI
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
            <div className="course-card" key={course.id}>
              <div className="course-card-header">
              </div>
              <div className="course-card-body">
                <h3>{course.courseName}</h3>
                <div className="course-details">
                <p><strong>category:</strong> {course.categoryName}</p>
                  <p><strong>Price:</strong> ${course.price}</p>
                </div>

                <Link 
                  to={`/edit-course/${course.id}`} 
                  state={{ categoryName: course.categoryName }}
                  className="edit-link"
                >
                  Edit Course
                </Link>

                <button 
                  className="delete-button" 
                  onClick={() => handleDeleteCourse(course.categoryName, course.id)}
                >
                  Delete Course
                </button>

                <Link 
                  to={`/add-lesson/${course.id}`} 
                  state={{ categoryName: course.categoryName }}
                  className="add-lesson-link"
                >
                  Add Lesson
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
