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
    // Fade out animation
    const card = document.getElementById(`card-${courseId}`);
    if (card) card.classList.add('fade-out');

    // Delay before actual deletion
    setTimeout(async () => {
      const lessonsRef = collection(db, `courseCategories/${categoryName}/courses/${courseId}/lessons`);
      const lessonsSnapshot = await getDocs(lessonsRef);

      for (const lesson of lessonsSnapshot.docs) {
        const lessonRef = doc(db, `courseCategories/${categoryName}/courses/${courseId}/lessons`, lesson.id);
        await deleteDoc(lessonRef);
      }

      const courseRef = doc(db, `courseCategories/${categoryName}/courses`, courseId);
      await deleteDoc(courseRef);

      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
    }, 400); // Wait for fade-out
  } catch (error) {
    console.error('Error deleting course:', error);
    alert('Failed to delete course. Please try again.');
  }
  };

  if (loading) {
  return <div className="loader"></div>;
}

  return (
    <div className="instructor-courses">
      <div style={{ textAlign: 'center', fontFamily: "'Poppins', sans-serif"}}>
  <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0, color: 'black' }}>
    your created course
  </h2>
  <p style={{ fontSize: '1rem', fontWeight: 'normal', color: 'gray', marginTop: '6px', marginBottom:'0px' }}>
    click on the course to open the lessons 
  </p>
</div>
      {courses.length === 0 ? (
        <p style={{
  background: '#fff',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  maxWidth: '500px',
  margin: '40px auto',
  fontSize: '1.1rem',
}}>
  You have not created any courses yet. Start creating one from the Coach Options menu!
</p>
      ) : (
        <div className="courses-container">
          {courses.map((course) => (
            <div
  id={`card-${course.id}`}
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
    if (!window.confirm("Are you sure you want to delete this course?")) return;
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
