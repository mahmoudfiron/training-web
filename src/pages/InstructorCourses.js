import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
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

      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
      alert('Course deleted successfully!');
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
