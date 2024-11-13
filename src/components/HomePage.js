import React from 'react';
import './HomePage.css';

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
            <img src="path/to/yoga-course.jpg" alt="Yoga" />
            <h3>Yoga</h3>
            <p>Join our Yoga classes to improve flexibility and mental clarity.</p>
            <button>View Course</button>
          </div>

          {/* Pilates Course */}
          <div className="course-card">
            <img src="path/to/pilates-course.jpg" alt="Pilates" />
            <h3>Pilates</h3>
            <p>Strengthen your core and improve balance with our Pilates classes.</p>
            <button>View Course</button>
          </div>

          {/* Full Body Training Course */}
          <div className="course-card">
            <img src="path/to/fullbody-course.jpg" alt="Full Body Training" />
            <h3>Full Body Training</h3>
            <p>Get a full-body workout from the comfort of your home.</p>
            <button>View Course</button>
          </div>

          {/* Stretch & Flexibility Course */}
          <div className="course-card">
            <img src="path/to/stretch-flexibility-course.jpg" alt="Stretch & Flexibility" />
            <h3>Stretch & Flexibility</h3>
            <p>Enhance your range of motion and reduce muscle tension with our Stretch & Flexibility classes.</p>
            <button>View Course</button>
          </div>

          {/* Meditation & Mindfulness Course */}
          <div className="course-card">
            <img src="path/to/meditation-course.jpg" alt="Meditation & Mindfulness" />
            <h3>Meditation & Mindfulness</h3>
            <p>Find peace and balance through guided meditation and mindfulness exercises.</p>
            <button>View Course</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
