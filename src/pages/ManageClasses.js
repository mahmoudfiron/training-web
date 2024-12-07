import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/MyCourses.css';
import { Link, useNavigate } from 'react-router-dom';

const ManageClasses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolledCourses = async (userId) => {
      try {
        const enrolledCoursesRef = collection(db, 'users', userId, 'enrolledCourses');
        const coursesSnap = await getDocs(enrolledCoursesRef);
        const enrolledCoursesIds = coursesSnap.docs.map(doc => ({
          courseId: doc.id,
          categoryName: doc.data().categoryName, // Assuming categoryName is saved here
        }));

        const fetchedCourses = [];
        for (let enrolledCourse of enrolledCoursesIds) {
          const { categoryName, courseId } = enrolledCourse;
          const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            const lessonsRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
            const lessonsSnap = await getDocs(lessonsRef);
            const lessons = lessonsSnap.docs.map(lessonDoc => ({
              lessonId: lessonDoc.id,
              ...lessonDoc.data(),
            }));

            fetchedCourses.push({
              id: courseId,
              ...courseData,
              lessons: lessons,
            });
          }
        }

        setEnrolledCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchEnrolledCourses(currentUser.uid);
      } else {
        setEnrolledCourses([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteLesson = async (categoryName, courseId, lessonId) => {
    try {
      if (!categoryName) {
        alert('Error: Cannot find the course category.');
        return;
      }

      const lessonRef = doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lessonId);
      await deleteDoc(lessonRef);

      setEnrolledCourses((prevCourses) =>
        prevCourses
          .map((course) => {
            if (course.id === courseId) {
              const updatedLessons = course.lessons.filter((lesson) => lesson.lessonId !== lessonId);
              return updatedLessons.length > 0
                ? { ...course, lessons: updatedLessons }
                : null; // Remove course if no lessons remain
            }
            return course;
          })
          .filter(Boolean) // Remove null values
      );

      alert('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error deleting the lesson. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading your classes...</div>;
  }

  return (
    <div className="my-courses">
      <h2>My Classes</h2>
      {enrolledCourses.length === 0 ? (
        <p>You have no classes in any courses</p>
      ) : (
        <div className="courses-container">
          {enrolledCourses.map((course) => (
            <div className="course-card" key={course.id}>
              <h3>{course.courseName || 'Course Name Not Available'}</h3>
              <h4>Instructor: {course.publisherName || 'Unknown'}</h4>
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson) => (
                  <div key={lesson.lessonId} className="lesson-info">
                    <h4>Lesson Date: {lesson.date || 'No date provided'}</h4>
                    <h4>Start Time: {lesson.startTime || 'No start time'}</h4>
                    <h4>End Time: {lesson.endTime || 'No end time'}</h4>
                    <h4>
                      Zoom Link:
                      {lesson.zoomLink ? (
                        <a href={lesson.zoomLink} target="_blank" rel="noopener noreferrer">Join</a>
                      ) : (
                        ' No link available'
                      )}
                    </h4>
                    {lesson.instructorUid === auth.currentUser?.uid && (
                      <>
                        <Link
                          to={`/edit-lesson/${course.id}/${lesson.lessonId}`}
                          state={{ categoryName: course.categoryName }}
                          className="edit-button"
                        >
                          Edit Lesson
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteLesson(course.categoryName, course.id, lesson.lessonId)
                          }
                          className="delete-button"
                        >
                          Delete Lesson
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p>No lessons available for this course.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageClasses;
