import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './components/HomePage'; // HomePage is located in components, not pages

// Import all other pages
import CoursesPage from './pages/CoursesPage';
import AboutUsPage from './pages/LearnAbout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CalculatorPage from './pages/CalculatorPage';
import CourseDetailPage from './pages/CourseDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
