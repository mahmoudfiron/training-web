import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/CalendarPage.css'; // Custom CSS for the Calendar Page

const CalendarPage = () => {
  const [value, setValue] = useState(new Date());
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [classesOnDate, setClassesOnDate] = useState([]);

  // Fetch enrolled courses for the current user directly from courseCategories collection
  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (auth.currentUser) {
        try {
          console.log("Fetching enrolled courses for user:", auth.currentUser.uid);

          // Step 1: Get enrolled courses from user's enrolledCourses collection
          const enrolledCoursesRef = collection(db, 'users', auth.currentUser.uid, 'enrolledCourses');
          const coursesSnap = await getDocs(enrolledCoursesRef);

          if (coursesSnap.empty) {
            console.warn("No enrolled courses found for this user.");
            setEnrolledClasses([]);
            return;
          }

          // Step 2: Get detailed class info from courseCategories collection
          let allClasses = [];
          for (let courseDoc of coursesSnap.docs) {
            const enrolledCourse = courseDoc.data();
            const { categoryName, courseName } = enrolledCourse;

            console.log(`Fetching course details for Category: ${categoryName}, Course Name: ${courseName}`);

            // Fetch all classes under the categoryName/courseName path
            const courseClassesRef = collection(db, 'courseCategories', categoryName, 'courses');
            const q = query(courseClassesRef, where("courseName", "==", courseName));
            const courseClassesSnap = await getDocs(q);

            if (!courseClassesSnap.empty) {
              courseClassesSnap.forEach((doc) => {
                allClasses.push({
                  id: doc.id,
                  ...doc.data(),
                });
              });
            }
          }

          setEnrolledClasses(allClasses);
          console.log("All Enrolled Classes Fetched:", allClasses);
        } catch (error) {
          console.error('Error fetching enrolled classes:', error);
        }
      }
    };

    fetchEnrolledClasses();
  }, []);

  // Filtering the classes based on the selected date
  useEffect(() => {
    const formattedDate = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
      value.getDate()
    ).padStart(2, '0')}`;

    console.log("Selected Date (formatted):", formattedDate);
    console.log("Enrolled Classes:", enrolledClasses);

    // Filter classes that match the selected date
    const filteredClasses = enrolledClasses.filter((cls) => cls.date === formattedDate);
    console.log("Filtered Classes on Selected Date:", filteredClasses);
    setClassesOnDate(filteredClasses);
  }, [value, enrolledClasses]);

  return (
    <div className="calendar-page">
      <h2>My Calendar</h2>
      <Calendar onChange={setValue} value={value} />
      <div className="classes-on-date">
        <h3>Classes on {value.toDateString()}:</h3>
        {classesOnDate.length === 0 ? (
          <p>No classes scheduled for this day.</p>
        ) : (
          <ul>
            {classesOnDate.map((cls) => (
              <li key={cls.id}>
                <strong>{cls.courseName}</strong> - {cls.startTime} to {cls.endTime}
                <br />
                <a href={cls.zoomLink} target="_blank" rel="noopener noreferrer">
                  Join via Zoom
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;