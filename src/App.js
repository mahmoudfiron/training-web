import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import CreateCourse from './pages/CreateCourse';
import HomePage from './components/HomePage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import LearnAbout from './pages/LearnAbout'; // Import the LearnAbout component


function App() {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} /> {/* Ensure this matches */}
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/learnabout" element={<LearnAbout />} /> {/* Add this route */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
