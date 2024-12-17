import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/InstructorDashboard.css';

const InstructorDashboard = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorLessons = async () => {
      try {
        const courseCategories = ['yoga', 'pilates', 'full-body', 'stretch', 'meditation'];
        const instructorLessons = [];

        for (const category of courseCategories) {
          const coursesSnapshot = await getDocs(collection(db, `courseCategories/${category}/courses`));
          for (const courseDoc of coursesSnapshot.docs) {
            const lessonsRef = collection(db, `courseCategories/${category}/courses/${courseDoc.id}/lessons`);
            const lessonsSnapshot = await getDocs(lessonsRef);

            lessonsSnapshot.docs.forEach((lessonDoc) => {
              const lessonData = lessonDoc.data();
              if (lessonData.instructorUid === auth.currentUser?.uid) {
                instructorLessons.push({
                  ...lessonData,
                  lessonId: lessonDoc.id,
                  courseName: courseDoc.data().courseName,
                  categoryName: category,
                });
              }
            });
          }
        }

        setLessons(instructorLessons);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorLessons();
  }, []);

  const isMeetingReady = (lesson) => {
    const currentTime = new Date();
    const lessonTime = new Date(`${lesson.date}T${lesson.startTime}`);
    return (lessonTime - currentTime) / 60000 <= 5; // Within 5 minutes or less
  };

  if (loading) return <div>Loading lessons...</div>;

  return (
    <div className="instructor-dashboard">
      <h2>Instructor Dashboard</h2>
      {lessons.length === 0 ? (
        <p>No lessons scheduled.</p>
      ) : (
        <div className="lessons-container">
          {lessons.map((lesson) => (
            <div className="lesson-card" key={lesson.lessonId}>
              <h3>{lesson.courseName}</h3>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
