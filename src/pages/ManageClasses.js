import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/MyCourses.css';

const ManageClasses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if a lesson is expired
  const isLessonExpired = (lesson) => {
    const currentDate = new Date();
    const lessonDate = new Date(`${lesson.date}T${lesson.endTime}`);
    return lessonDate < currentDate;
  };

  const deleteExpiredLessons = useCallback(async (categoryName, courseId, lessons) => {
    const validLessons = [];
    for (const lesson of lessons) {
      if (isLessonExpired(lesson)) {
        try {
          const lessonRef = doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lesson.lessonId);
          await deleteDoc(lessonRef);
          console.log(`Deleted expired lesson: ${lesson.lessonId}`);
        } catch (error) {
          console.error(`Error deleting lesson ${lesson.lessonId}:`, error);
        }
      } else {
        validLessons.push(lesson);
      }
    }
    return validLessons; // Return only valid (non-expired) lessons
  }, []);

  useEffect(() => {
    const fetchEnrolledCourses = async (userId) => {
      try {
        const enrolledCoursesRef = collection(db, 'users', userId, 'enrolledCourses');
        const coursesSnap = await getDocs(enrolledCoursesRef);
        const enrolledCoursesIds = coursesSnap.docs.map((doc) => ({
          courseId: doc.id,
          categoryName: doc.data().categoryName,
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
            const lessons = lessonsSnap.docs.map((lessonDoc) => ({
              lessonId: lessonDoc.id,
              ...lessonDoc.data(),
            }));

            // Delete expired lessons and keep valid ones
            const validLessons = await deleteExpiredLessons(categoryName, courseId, lessons);

            fetchedCourses.push({
              id: courseId,
              ...courseData,
              lessons: validLessons,
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
  }, [deleteExpiredLessons]);

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
                      {(() => {
                        const now = new Date();
                        const lessonStartTime = new Date(`${lesson.date}T${lesson.startTime}`);
                        const timeDifference = (lessonStartTime - now) / 60000; // Difference in minutes

                        if (timeDifference <= 5 && timeDifference >= 0) {
                          return (
                            <a href={lesson.zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                              Join
                            </a>
                          );
                        } else if (timeDifference < 0) {
                          return (
                            <a href={lesson.zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                              Join
                            </a>
                          );
                        } else {
                          return 'No link available';
                        }
                      })()}
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
