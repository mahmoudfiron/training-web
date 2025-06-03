// src/pages/CalendarPage.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/CalendarPage.css';
import { useNavigate } from 'react-router-dom';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [aiSessions, setAiSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;

        const userCoursesRef = collection(db, 'users', uid, 'enrolledCourses');
        const coursesSnap = await getDocs(userCoursesRef);
        const allClasses = [];

        for (const courseDoc of coursesSnap.docs) {
          const { categoryName } = courseDoc.data();
          const lessonsRef = collection(db, 'courseCategories', categoryName, 'courses', courseDoc.id, 'lessons');
          const lessonsSnap = await getDocs(lessonsRef);
          const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseDoc.id);
          const courseSnap = await getDoc(courseRef);
          const courseData = courseSnap.data();

          lessonsSnap.forEach((lesson) => {
            allClasses.push({
              ...lesson.data(),
              courseName: courseData.courseName,
              publisherName: courseData.publisherName,
              lessonId: lesson.id,
              courseId: courseDoc.id,
              categoryName
            });
          });
        }

        const aiRef = query(collection(db, 'users', uid, 'aiSessions'), orderBy('timestamp', 'desc'));
        const aiSnap = await getDocs(aiRef);
        const sessions = aiSnap.docs.map(doc => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.();
          return {
            ...data,
            date: timestamp ? `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}` : null,
            readableTime: timestamp?.toLocaleString(),
          };
        });

        setAiSessions(sessions);
        setEnrolledClasses(allClasses);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    let dayCounter = 1 - firstDayIndex;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const thisDate = new Date(year, month, dayCounter);
        week.push({ date: thisDate, isCurrentMonth: thisDate.getMonth() === month });
        dayCounter++;
      }
      days.push(week);
    }
    return days;
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isToday = (someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getFeedback = (session) => {
    if (session.exerciseType === 'biceps') {
      if (session.reps >= 20) return "🔥 Excellent strength!";
      if (session.reps >= 10) return "💪 Good form!";
      return "Keep practicing!";
    } else if (session.exerciseType === 'yoga') {
      if (session.duration >= 30) return "🧘 Calm and focused!";
      if (session.duration >= 15) return "🌿 Balanced!";
      return "Try holding longer!";
    }
    return "";
  };

  const getColorForSession = (session) => {
    if (session.exerciseType === 'biceps') {
      if (session.reps > 15) return '#5e3b9e';     // Deep Purple
      if (session.reps > 5) return '#884dce';      // Medium Purple
      return '#bc9ee8';                            // Light Purple
    } else if (session.exerciseType === 'yoga') {
      if (session.duration > 30) return '#5e3b9e';  // Deep Purple
      if (session.duration > 15) return '#884dce';  // Medium Purple
      return '#bc9ee8';                             // Light Purple
    }
    return '#8e44ad'; // fallback
  };

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={goToPrevMonth}>❮</button>
        <h2>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h2>
        <button onClick={goToNextMonth}>❯</button>
      </div>

      {loading ? (
        <div className="loading">Loading calendar...</div>
      ) : (
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div className="calendar-day-label" key={day}>{day}</div>
          ))}

          {days.map((week, i) =>
            week.map((dayObj, j) => {
              const dateKey = formatDateKey(dayObj.date);
              const classesToday = enrolledClasses.filter(cls => cls.date === dateKey);
              const aiToday = aiSessions.filter(s => s.date === dateKey);

              return (
                <div className={`calendar-cell ${dayObj.isCurrentMonth ? '' : 'faded'} ${isToday(dayObj.date) ? 'today' : ''}`} key={`${i}-${j}`}>
                  <div className="cell-date">{dayObj.date.getDate()}</div>

                  {classesToday.map(cls => (
                    <button
                      key={cls.lessonId}
                      className="event-button"
                      onClick={() =>
                        navigate(`/lessons/${cls.courseId}`, {
                          state: { categoryName: cls.categoryName }
                        })
                      }
                    >
                      {cls.courseName}
                    </button>
                  ))}

                  {aiToday.map((session, idx) => (
                    <button
                      key={idx}
                      className="event-button"
                      style={{ backgroundColor: getColorForSession(session) }}
                      onClick={() => setSelectedSession(session)}
                    >
                      {session.exerciseType === 'biceps'
                        ? `💪 ${session.reps} reps`
                        : `🧘 ${session.duration}s`}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>AI Session Summary</h3>
            <p><strong>Type:</strong> {selectedSession.exerciseType}</p>
            <p><strong>Time:</strong> {selectedSession.readableTime}</p>
            <p><strong>Performance:</strong> {getFeedback(selectedSession)}</p>
            <button onClick={() => navigate('/ai-reports')}>📈 View AI Reports</button>
            <button onClick={() => setSelectedSession(null)}>Close</button>
          </div>
        </div>
      )}



      <div className="calendar-footer">

  <button className="full-report-button" onClick={() => navigate('/ai-reports')}>
    📈 View Full AI Report
  </button>
</div>




    </div>
  );
};

export default CalendarPage;
