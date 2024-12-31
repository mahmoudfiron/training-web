import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/CalendarPage.css';

const CalendarPage = () => {
  const [value, setValue] = useState(new Date());
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [classesOnDate, setClassesOnDate] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch enrolled classes
  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (auth.currentUser) {
        try {
          const enrolledCoursesRef = collection(db, 'users', auth.currentUser.uid, 'enrolledCourses');
          const coursesSnap = await getDocs(enrolledCoursesRef);

          let allClasses = [];
          for (let courseDoc of coursesSnap.docs) {
            const { categoryName } = courseDoc.data();

            const lessonsRef = collection(db, 'courseCategories', categoryName, 'courses', courseDoc.id, 'lessons');
            const lessonsSnap = await getDocs(lessonsRef);

            // Fetch course details (publisherName and courseName) from the courses collection
            const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseDoc.id);
            const courseSnap = await getDoc(courseRef);
            const courseData = courseSnap.data();

            lessonsSnap.forEach((lessonDoc) => {
              allClasses.push({
                id: lessonDoc.id,
                ...lessonDoc.data(),
                courseName: courseData.courseName,  // Add course name from the course collection
                publisherName: courseData.publisherName,  // Add publisher name from the course collection
              });
            });
          }
          setEnrolledClasses(allClasses);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      }
    };
    fetchEnrolledClasses();
  }, []);

  // Filter classes based on the selected date
  useEffect(() => {
    const formattedDate = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
      value.getDate()
    ).padStart(2, '0')}`;

    const filteredClasses = enrolledClasses.filter((cls) => cls.date === formattedDate);
    setClassesOnDate(filteredClasses);
  }, [value, enrolledClasses]);

  // Change date with arrows
  const changeDay = (direction) => {
    const newDate = new Date(value);
    newDate.setDate(value.getDate() + direction);
    setValue(newDate);
  };

  // Format today's date for display
  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

   // Format selected date for display
   const selectedDay = value.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="calendar-page-wrapper"> {/* Added a wrapper for centering */}
      <div className="calendar-page"> {/* Original content inside this div */}
        {/* Current Time and Today's Date */}
        <div className="current-time">
          <h1>{currentTime.toLocaleTimeString()}</h1>
          <p>{todayDate}</p>
        </div>

        {/* Calendar Controls */}
        <div className="calendar-controls">
          <button onClick={() => changeDay(-1)} className="arrow-button">
            &larr;
          </button>
          <div className="dropdown-container">
            <button onClick={() => setCalendarVisible(!calendarVisible)} className="dropdown-button5">
              {calendarVisible ? 'Hide Calendar' :  <p>{selectedDay}▼</p>}
            </button>
            {calendarVisible && <Calendar onChange={setValue} value={value} />}
          </div>
          <button onClick={() => changeDay(1)} className="arrow-button">
            &rarr;
          </button>
        </div>

        {/* Classes on Selected Date */}
        <div className="classes-on-date">
          {classesOnDate.length === 0 ? (
            <p>No classes scheduled for this day.</p>
          ) : (
            <div className="class-cards">
              {classesOnDate.map((cls) => (
                <div className="class-card" key={cls.id}>
                  <p>
                    <strong>{cls.courseName}</strong>
                  </p>
                  <p>{selectedDay}</p>
                  <p>
                    {cls.startTime} - {cls.endTime}
                  </p>
                  <p>Host: {cls.publisherName}</p>
                  <a href={cls.zoomLink} target="_blank" rel="noopener noreferrer" className="start-button">
                    Start
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
