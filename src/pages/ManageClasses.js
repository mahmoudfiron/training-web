import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/MyCourses.css';
import { Link } from 'react-router-dom';

const ManageClasses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async (userId) => {
      try {
        // Step 1: Get enrolled courses IDs from user's enrolledCourses sub-collection
        const enrolledCoursesRef = collection(db, 'users', userId, 'enrolledCourses');
        const coursesSnap = await getDocs(enrolledCoursesRef);
        const enrolledCoursesIds = coursesSnap.docs.map(doc => {
          return {
            courseId: doc.id,
            categoryName: doc.data().categoryName // Assuming categoryName is saved here
          };
        });

        // Step 2: Fetch the course details and their lessons from courseCategories based on enrolled course IDs
        const fetchedCourses = [];
        for (let enrolledCourse of enrolledCoursesIds) {
          const { categoryName, courseId } = enrolledCourse;

          // Reference to the specific course document
          const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();

            // Fetch lessons related to the course
            const lessonsRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
            const lessonsSnap = await getDocs(lessonsRef);
            const lessons = lessonsSnap.docs.map(lessonDoc => ({
              lessonId: lessonDoc.id,
              ...lessonDoc.data(),
            }));

            // Combine course data with its lessons
            fetchedCourses.push({
              id: courseId,
              ...courseData,
              lessons: lessons,  // Adding lessons data here
            });
          }
        }

        // Step 3: Update state with fetched courses
        setEnrolledCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchEnrolledCourses(currentUser.uid);
      } else {
        setEnrolledCourses([]);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

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
              
              {/* Render lessons under this course */}
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