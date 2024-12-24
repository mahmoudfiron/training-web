import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';
import SignupPage from './pages/SignupPage.js';
import LoginPage from './pages/LoginPage.js';
import CreateCourse from './pages/CreateCourse.js';
import HomePage from './components/HomePage.js';
import NavBar from './components/NavBar.js';
import Footer from './components/Footer.js';
import ProfileModal from './pages/ProfileModal.js';
import LearnAbout from './pages/LearnAbout.js';
import CourseDetails from './pages/CourseDetails.js'; 
import PaymentPage from './pages/PaymentPage.js';
import MyCourses from './pages/MyCourses.js'; 
import CalendarPage from './pages/CalendarPage.js';
import AddLessonPage from './pages/AddLessonPage.js';
import EditLessonPage from './pages/EditLessonPage.js';
import InstructorCourses from "./pages/InstructorCourses.js"; 
import EditCoursePage from './pages/EditCoursePage.js';
import LessonsPage from './pages/LessonsPage.js';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <NavBar user={user} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-course" element={<CreateCourse user={user} />} />
        <Route path="/profile-modal" element={<ProfileModal />} />
        <Route path="/learnabout" element={<LearnAbout />} />
        <Route path="/course-details/:categoryName/:courseId" element={<CourseDetails />} />
        <Route path="/course-payment/:categoryName/:courseId" element={<PaymentPage />} />\
        <Route path="/My-Courses" element={<MyCourses />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/add-lesson/:courseId" element={<AddLessonPage />} />
        <Route path="/edit-lesson/:courseId/:lessonId" element={<EditLessonPage />} /> 
        <Route path="/instructor-courses" element={<InstructorCourses />} />
        <Route path="/edit-course/:courseId" element={<EditCoursePage />} /> {/* Fixed route */}
        <Route path="/lessons/:courseId" element={<LessonsPage />} />

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;