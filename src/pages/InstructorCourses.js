import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
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
          const coursesSnapshot = await getDocs(collection(db, `courseCategories/${category}/courses`)); // Fixed template string
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
      // Delete all lessons associated with the course
      const lessonsRef = collection(db, `courseCategories/${categoryName}/courses/${courseId}/lessons`);
      const lessonsSnapshot = await getDocs(lessonsRef);

      for (const lesson of lessonsSnapshot.docs) {
        const lessonRef = doc(db, `courseCategories/${categoryName}/courses/${courseId}/lessons`, lesson.id);
        await deleteDoc(lessonRef);
      }

      // Delete the course itself
      const courseRef = doc(db, `courseCategories/${categoryName}/courses`, courseId);
      await deleteDoc(courseRef);

      // Update state to remove the deleted course from the UI
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
      alert('Course and its lessons deleted successfully!');
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
      <div style={{ textAlign: 'center', fontFamily: "'Poppins', sans-serif"}}>
  <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0, color: 'black' }}>
    your created course
  </h2>
  <p style={{ fontSize: '1rem', fontWeight: 'normal', color: 'gray', marginTop: '10px', marginBottom:'40px' }}>
    click on the course to open the lessons 
  </p>
</div>
      {courses.length === 0 ? (
        <p>You have not created any courses yet.</p>
      ) : (
        <div className="courses-container">
          {courses.map((course) => (
            <div
              className="course-card"
              key={course.id}
              onClick={() =>
                navigate(`/lessons/${course.id}`, {
                  state: { categoryName: course.categoryName, isInstructor: true },
                })
              }
            >
              <div className="card-header">
                <img
                  src={course.imageBase64 || 'default-course-image.jpg'}
                  alt="Course Thumbnail"
                  className="course-image"
                />
                <Link
                  to={`/edit-course/${course.id}`} // Fixed template string
                  state={{ categoryName: course.categoryName }}
                  className="edit-icon"
                  onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking edit icon
                >
                  ✏
                </Link>
                <button
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation when clicking delete button
                    handleDeleteCourse(course.categoryName, course.id);
                  }}
                >
                  🗑
                </button>
              </div>
              <div className="card-body">
                <h3>{course.courseName}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
