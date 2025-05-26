// src/pages/CalendarPage.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/CalendarPage.css';
import { useNavigate } from 'react-router-dom';


const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchClasses = async () => {
    setLoading(true);
    if (auth.currentUser) {
      const userCoursesRef = collection(db, 'users', auth.currentUser.uid, 'enrolledCourses');
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

      setEnrolledClasses(allClasses);
    }
    setLoading(false);
  };

  fetchClasses(); // 👈 Don't forget to call it!
}, []);



  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];

    const firstDayIndex = date.getDay(); // 0-6 (Sun-Sat)

    let dayCounter = 1 - firstDayIndex;

    for (let i = 0; i < 6; i++) {
      const week = [];

      for (let j = 0; j < 7; j++) {
        const thisDate = new Date(year, month, dayCounter);
        week.push({
          date: thisDate,
          isCurrentMonth: thisDate.getMonth() === month
        });
        dayCounter++;
      }

      days.push(week);
    }

    return days;
  };

  const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
  };

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  const goToPrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={goToPrevMonth}>❮</button>
        <h2>
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h2>
        <button onClick={goToNextMonth}>❯</button>
      </div>

{loading ? (
  <div className="loading">Loading calendar...</div>
) : (
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
  <div className="calendar-day-label" key={day}>
    {day}
  </div>
))}


        {days.map((week, i) => (
          week.map((dayObj, j) => {
            const dateKey = formatDateKey(dayObj.date);
            const classesToday = enrolledClasses.filter(cls => cls.date === dateKey);

            return (
              <div
  className={`calendar-cell ${dayObj.isCurrentMonth ? '' : 'faded'} ${isToday(dayObj.date) ? 'today' : ''}`}
  key={`${i}-${j}`}
>
                <div className="cell-date">{dayObj.date.getDate()}</div>
                {classesToday.map((cls) => (
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
              </div>
            );
          })
        ))}
      </div>
          )}

    </div>
  );
};

export default CalendarPage;
