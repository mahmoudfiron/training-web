import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import CreateCourse from './pages/CreateCourse';
import HomePage from './components/HomePage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import LearnAbout from './pages/LearnAbout';
import CourseDetails from './pages/CourseDetails'; 
import PaymentPage from './pages/PaymentPage'; // Import PaymentPage

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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/learnabout" element={<LearnAbout />} />
        <Route path="/course-details/:categoryName/:courseId" element={<CourseDetails />} />
        <Route path="/course-payment/:categoryName/:courseId" element={<PaymentPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;