import React from 'react';
import '../styles/LearnAbout.css';
import aboutImage from '../assets/images/about-Image.jpeg';
import ourStoryImage from '../assets/images/our-story.png';
import learningImage from '../assets/images/learning-Image.jpeg';

const LearnAbout = () => {
  return (
    <div className="learn-about">
      
      {/* About StreamFit Section */}
      <section className="about-streamfit">
        <img src={aboutImage} alt="About StreamFit" className="section-image" />
        <div className="section-content">
          <h2>About StreamFit</h2>
          <p>
            StreamFit is your go-to platform for live-streamed fitness and wellness classes, offering a wide range of sessions led by professional instructors. We aim to bring high-quality fitness training directly to you—wherever you are.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story">
        <div className="our-story-header">
          <img src={ourStoryImage} alt="Our Story" className="section-image-large" />
          <div className="header-text">
            <h2>Our Story</h2>
            <p>Created by the passion to help people achieve a healthier, happier lifestyle.</p>
          </div>
        </div>
        <div className="our-story-content">
          <p>
            StreamFit started with a simple idea: to make fitness accessible for everyone, regardless of their location. What started as a small online group has grown into a worldwide platform where thousands of people join classes, motivate each other, and build healthier habits. Our instructors come from diverse backgrounds, but they share a common goal—to inspire people to live their best lives.
          </p>
        </div>
      </section>

      {/* Learning on StreamFit Section */}
      <section className="learning-streamfit">
        <div className="learning-content">
          <div className="learning-text">
            <h2>Learning on StreamFit is Easy</h2>
            <p>
              We believe that empowering yourself should not only be effective, but also simple and engaging. StreamFit helps you take your fitness journey from starting your first course to mastering skills—all in an easy and fun environment. Our instructors are ready to help you learn, grow, and transform yourself.
            </p>
            <button className="learning-signup-button">Sign Up</button>
          </div>
          <img src={learningImage} alt="Learning on StreamFit" className="learning-image" />
        </div>
      </section>
      
    </div>
  );
};

export default LearnAbout;
