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
import RatingsPage from './pages/RatingsPage.js';
import MessagesPage from './pages/MessagesPage.js';
import SendMessagePage  from './pages/SendMessagePage.js';
import CalculatorPage from './pages/CalculatorPage.js';

import AIReports from './pages/AIReports.js';

import Home from './pages/Home.js';                                                    
import Yoga from './pages/Yoga.js';

import ReferFriend from './pages/ReferFriend.js'; // ✅ Add at the top

import ContactPage from './pages/ContactPage.js';
import FAQsPage from './pages/FAQsPage.js';
import TermsPage from './pages/TermsPage.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import 'font-awesome/css/font-awesome.min.css';

import FinancialAccount from './pages/FinancialAccount.js';
import AccountSettings from './pages/AccountSettings.js';

import { ToastContainer } from 'react-toastify';
<ToastContainer position="top-right" autoClose={3000} />


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
        <Route path="/ratings" element={<RatingsPage />} />
        <Route path="/messages/:messageId?" element={<MessagesPage />} />
        <Route path="/send-message" element={<SendMessagePage />} />
        <Route path="/CalculatorPage" element={<CalculatorPage />} />

        <Route path="/ai-trainer" element={<Home />} />
        <Route path="/ai-trainer/yoga" element={<Yoga />} />
        
        <Route path="/refer-a-friend" element={<ReferFriend />} />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route path="/financial-account" element={<FinancialAccount />} />
        <Route path="/account-settings" element={<AccountSettings />} />

        <Route path="/ai-reports" element={<AIReports />} />


      </Routes>
      <Footer />
    </Router>
  );
}

export default App;