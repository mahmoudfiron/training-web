import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Link, useLocation } from 'react-router-dom';
import '../styles/LessonsPage.css';

const LessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const location = useLocation();
  const { categoryName, isInstructor } = location.state || {};
  const courseId = location.pathname.split('/').pop();
  const [loading, setLoading] = useState(true);

  const isLessonExpired = (lesson) => {
    const currentDate = new Date();
    const lessonDate = new Date(`${lesson.date}T${lesson.endTime}`);
    return lessonDate < currentDate;
  };

  const isLessonRunning = (lesson) => {
    const currentTime = new Date();
    const lessonStartTime = new Date(`${lesson.date}T${lesson.startTime}`);
    const lessonEndTime = new Date(`${lesson.date}T${lesson.endTime}`);
    return currentTime >= lessonStartTime && currentTime <= lessonEndTime;
  };

  const deleteExpiredLessons = useCallback(async (categoryName, courseId, lessons) => {
    const validLessons = [];
    for (const lesson of lessons) {
      if (isLessonExpired(lesson)) {
        try {
          const lessonRef = doc(
            db,
            'courseCategories',
            categoryName,
            'courses',
            courseId,
            'lessons',
            lesson.id
          );
          await deleteDoc(lessonRef);
          console.log(`Deleted expired lesson: ${lesson.id}`);
        } catch (error) {
          console.error(`Error deleting lesson ${lesson.id}:`, error);
        }
      } else {
        validLessons.push(lesson);
      }
    }
    return validLessons;
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const lessonsRef = collection(db, `courseCategories/${categoryName}/courses/${courseId}/lessons`);
        const lessonsSnap = await getDocs(lessonsRef);
        const lessonsList = lessonsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const validLessons = await deleteExpiredLessons(categoryName, courseId, lessonsList);

        validLessons.sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));
        setLessons(validLessons);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [categoryName, courseId, deleteExpiredLessons]);

  const handleDeleteLesson = async (lessonId) => {
    try {
      const lessonRef = doc(db, `courseCategories/${categoryName}/courses/${courseId}/lessons`, lessonId);
      await deleteDoc(lessonRef);
      setLessons((prevLessons) => prevLessons.filter((lesson) => lesson.id !== lessonId));
      alert('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error deleting the lesson. Please try again.');
    }
  };

  const isMeetingReady = (lesson) => {
    const currentTime = new Date();
    const lessonTime = new Date(`${lesson.date}T${lesson.startTime}`);
    return (lessonTime - currentTime) / 60000 <= 5;
  };

  if (loading) return <div>Loading lessons...</div>;

  return (
    <div className="instructor-dashboard">
      {isInstructor && (
        <Link
              to={`/add-lesson/${courseId}`}
              state={{ categoryName }}
              className="add-lesson-button"
            >
              Add a Lesson
            </Link>
        )}

      <h2>{`Lessons for ${categoryName} Course`}</h2>

      {lessons.length === 0 ? (
        <div className="no-lessons">
          <h3>No Lessons Scheduled</h3>
          <p>It looks like this course doesn't have any scheduled lessons yet. Create lessons to keep your participants engaged!</p>
        </div>
      ) : (
        <div className="lessons-container">
            
          {lessons.map((lesson, index) => (
            <div className={`lesson-card ${isLessonRunning(lesson) ? 'running-lesson' : ''}`} key={lesson.id}>
              {isLessonRunning(lesson) && <div className="blinking-circle"></div>}
              <h3>{`Lesson Number ${index + 1}`}</h3>
              <p><strong>Date:</strong> {lesson.date}</p>
              <p><strong>Start Time:</strong> {lesson.startTime}</p>
              <p><strong>End Time:</strong> {lesson.endTime}</p>
              {isMeetingReady(lesson) ? (
                <a
                  href={lesson.zoomStartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="start-button"
                >
                  Start Meeting
                </a>
              ) : (
                <p className="meeting-wait">Meeting link available 5 minutes before start time.</p>
              )}
              {isInstructor && (
                <>
                  <Link
                    to={`/edit-lesson/${courseId}/${lesson.id}`}
                    state={{ categoryName }}
                    className="edit-button"
                  >
                    Edit Lesson
                  </Link>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="delete-button"
                  >
                    Delete Lesson
                  </button>
                </>
              )}
            </div>
            
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonsPage;
