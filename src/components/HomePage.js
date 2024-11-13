import React from 'react';
import './HomePage.css';

// Importing the images from the assets folder correctly
import yogaImage from '../assets/images/yoga-course.png';
import pilatesImage from '../assets/images/pilates-course.png';
import fullBodyImage from '../assets/images/fullbody-course.webp';
import stretchImage from '../assets/images/stretch-flexibility-course.webp';
import meditationImage from '../assets/images/meditation-course.png';

const HomePage = () => {
  const scrollToCourses = () => {
    document.getElementById('courses-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Train with the Best Instructors, From the Comfort of Your Home</h1>
          <p>Join live classes in Yoga, Pilates, Meditation, and more. Flexible schedules and top-rated instructors.</p>
          <button className="cta-button" onClick={scrollToCourses}>Explore Courses</button>
        </div>
      </div>

      {/* Courses Section */}
      <div id="courses-section" className="courses-section">
        <h2>Our Courses</h2>
        <div className="course-cards">
          {/* Yoga Course */}
          <div className="course-card">
            <div className="course-labels">
              <span className="availability-label">Available</span>
              <span className="category-label">Yoga</span>
            </div>
            <img src={yogaImage} alt="Yoga" />
            <h3 className="course-title">Sunrise Yoga Class</h3>
            <div className="course-details">
              <span className="course-duration"><i className="fas fa-clock"></i> 4-5 hrs</span>
              <span className="course-learners">200 learners</span>
            </div>
            <div className="course-buttons">
              <button className="info-button">More Info</button>
              <button className="start-button">Start Course</button>
            </div>
          </div>

          {/* Pilates Course */}
          <div className="course-card">
            <div className="course-labels">
              <span className="availability-label">Available</span>
              <span className="category-label">Pilates</span>
            </div>
            <img src={pilatesImage} alt="Pilates" />
            <h3 className="course-title">Core Strength Pilates</h3>
            <div className="course-details">
              <span className="course-duration"><i className="fas fa-clock"></i> 3-4 hrs</span>
              <span className="course-learners">150 learners</span>
            </div>
            <div className="course-buttons">
              <button className="info-button">More Info</button>
              <button className="start-button">Start Course</button>
            </div>
          </div>

          {/* Full Body Training Course */}
          <div className="course-card">
            <div className="course-labels">
              <span className="availability-label">Available</span>
              <span className="category-label">Full Body</span>
            </div>
            <img src={fullBodyImage} alt="Full Body Training" />
            <h3 className="course-title">Total Body Bootcamp</h3>
            <div className="course-details">
              <span className="course-duration"><i className="fas fa-clock"></i> 5-6 hrs</span>
              <span className="course-learners">180 learners</span>
            </div>
            <div className="course-buttons">
              <button className="info-button">More Info</button>
              <button className="start-button">Start Course</button>
            </div>
          </div>

          {/* Stretch & Flexibility Course */}
          <div className="course-card">
            <div className="course-labels">
              <span className="availability-label">Available</span>
              <span className="category-label">Stretch & Flexibility</span>
            </div>
            <img src={stretchImage} alt="Stretch & Flexibility" />
            <h3 className="course-title">Flexibility Flow</h3>
            <div className="course-details">
              <span className="course-duration"><i className="fas fa-clock"></i> 2-3 hrs</span>
              <span className="course-learners">120 learners</span>
            </div>
            <div className="course-buttons">
              <button className="info-button">More Info</button>
              <button className="start-button">Start Course</button>
            </div>
          </div>

          {/* Meditation & Mindfulness Course */}
          <div className="course-card">
            <div className="course-labels">
              <span className="availability-label">Available</span>
              <span className="category-label">Meditation</span>
            </div>
            <img src={meditationImage} alt="Meditation & Mindfulness" />
            <h3 className="course-title">Mindfulness Meditation</h3>
            <div className="course-details">
              <span className="course-duration"><i className="fas fa-clock"></i> 1-2 hrs</span>
              <span className="course-learners">220 learners</span>
            </div>
            <div className="course-buttons">
              <button className="info-button">More Info</button>
              <button className="start-button">Start Course</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
