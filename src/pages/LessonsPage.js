import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { Link, useLocation } from 'react-router-dom';
import ChatModal from './ChatModal.js'; // ChatModal component
import '../styles/LessonsPage.css';

import noCoursesImg from '../assets/images/no-courses.webp';

const LessonsPage = ({ instructorId }) => {
  const [lessons, setLessons] = useState([]);
  const location = useLocation();
  const { categoryName, isInstructor } = location.state || {};
  const courseId = location.pathname.split('/').pop();
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = auth.currentUser?.uid;

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

  useEffect(() => {
    if (!userId) return; // Skip the query if userId is undefined

    const fetchUnreadMessages = () => {
      const messagesRef = collection(db, `chats/${courseId}/messages`);
      const unreadQuery = query(messagesRef, where('readBy', 'not-in', [userId]));
  
      const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
        const unreadMessages = snapshot.docs.filter((doc) => {
          const data = doc.data();
          return !data.readBy?.includes(userId) && data.senderId !== userId;
        });
        setUnreadCount(unreadMessages.length);
      });
  
      return unsubscribe;
    };
  
    const unsubscribe = fetchUnreadMessages();
    return () => unsubscribe();
  }, [courseId, userId]);
  
  const handleChatOpen = async () => {
    setIsChatOpen(true);
  
    if (!userId) return; // Skip updating messages if userId is undefined

    // Mark all unread messages as read when opening the chat
    const messagesRef = collection(db, `chats/${courseId}/messages`);
    const unreadQuery = query(messagesRef, where('readBy', 'not-in', [userId]));
  
    const snapshot = await getDocs(unreadQuery);
    const batchUpdates = [];
    snapshot.forEach((doc) => {
      const messageRef = doc.ref;
      batchUpdates.push(updateDoc(messageRef, { readBy: [...(doc.data().readBy || []), userId] }));
    });
  
    await Promise.all(batchUpdates);
    setUnreadCount(0); // Reset unread count
  };
  
  const handleDeleteLesson = async (lessonId) => {
  try {
    const card = document.getElementById(`lesson-${lessonId}`);
    if (card) card.classList.add('fade-out');

    setTimeout(async () => {
      const lessonRef = doc(db, `courseCategories/${categoryName}/courses/${courseId}/lessons`, lessonId);
      await deleteDoc(lessonRef);
      setLessons((prevLessons) => prevLessons.filter((lesson) => lesson.id !== lessonId));
      alert('Lesson deleted successfully!');
    }, 300);
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
          <img src={noCoursesImg} alt="No courses" className="empty-image"  style={{ height: '280', width:'280px' }}/>

          <p>It looks like this course doesn't have any scheduled lessons yet. Create lessons to keep your participants engaged!</p>
        </div>
      ) : (
        <div className="lessons-container">
            
          {lessons.map((lesson, index) => (
              <div id={`lesson-${lesson.id}`} className={`lesson-card ${isLessonRunning(lesson) ? 'running-lesson' : ''}`} key={lesson.id}>
              {isLessonRunning(lesson) && <div className="blinking-circle"></div>}
              <h3>
  Lesson Number {index + 1} 
  <span className={`lesson-status ${isLessonRunning(lesson) ? 'live' : isLessonExpired(lesson) ? 'past' : 'upcoming'}`}>
    {isLessonRunning(lesson) ? 'Live' : isLessonExpired(lesson) ? 'Past' : 'Upcoming'}
  </span>
              </h3>
              <p><strong>Date:</strong> {lesson.date}</p>
              <p><strong>Start Time:</strong> {lesson.startTime}</p>
              <p><strong>End Time:</strong> {lesson.endTime}</p>
        {isMeetingReady(lesson) ? (
  <div className="lesson-buttons-row">
    <a
      href={lesson.zoomStartUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="start-button"
    >
      Start Meeting
    </a>
    <button
      className="copy-link-button"
      onClick={() => {
        navigator.clipboard.writeText(lesson.zoomStartUrl);
        alert('Meeting link copied!');
      }}
    >
      📋
    </button>
  </div>
) : (
  <p className="meeting-wait">Meeting link available 5 minutes before start time.</p>
)}

{isInstructor && (
  <div className="lesson-buttons-row">
    <Link
      to={`/edit-lesson/${courseId}/${lesson.id}`}
      state={{ categoryName }}
      className="edit-button9"
    >
      Edit Lesson
    </Link>
    <button
      onClick={() => handleDeleteLesson(lesson.id)}
      className="delete-button"
    >
      Delete Lesson
    </button>
  </div>
)}
            </div>
          ))}
        </div>
      )}
       <div className="lessons-page">
        <div className="chat-icon-wrapper">
          {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
          <button
            className="chat-icon"
            onClick={handleChatOpen}
          >
            💬
          </button>
        </div>

        {isChatOpen && (
          <ChatModal
            courseId={courseId}
            instructorId={instructorId}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LessonsPage;