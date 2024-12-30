import React from 'react';
import '../styles/LearnAbout.css';
import aboutImage from '../assets/images/about-Image.jpg';
import missionImage from '../assets/images/mission-image.jpg';
import storyImage from '../assets/images/our-story.jpg';

const LearnAbout = () => {
  return (
    <div className="learn-about">
      {/* About Us Section */}
      <section className="about-section">
        <div className="content">
          <h2>About Us</h2>
          <p>
            StreamFit is more than just a platform—it’s a movement. Designed for individuals of all fitness levels, we’re here to make wellness accessible, empowering, and transformative. From live-streamed fitness classes to expert-led wellness sessions, StreamFit brings the experience of a professional studio into your home.
          </p>
        </div>
        <img src={aboutImage} alt="About StreamFit" className="section-image" />
      </section>
      {/* Our Mission Section */}
      <section className="mission-section">
        <img src={missionImage} alt="Mission" className="section-image2" />
        <div className="content">
          <h2>Our Mission</h2>
          <p>
            To redefine how the world experiences fitness and wellness. By connecting people with world-class instructors through live and interactive sessions, we’re helping individuals unlock their potential and live healthier, happier lives.
          </p>
        </div>
      </section>
      {/* Our Story Section */}
      <section className="story-section">
        <div className="content">
          <h2>Our Story</h2>
          <p>
            It all began with a moment of frustration. I had just moved to a new city. The gyms were expensive, the schedules didn’t fit my 9-to-5 grind, and trying to stay consistent with fitness felt like a never-ending battle. One day, after missing yet another class due to traffic, I thought to myself, <em>“There has to be a better way.”</em>
          </p>
          <p>
            That’s when the idea for StreamFit was born. It wasn’t just about convenience; it was about creating a community. A space where people could connect with top-tier instructors, work out from anywhere, and feel supported no matter their level of experience.
          </p>
          <p>
            What started as a simple idea grew into a platform that’s changing lives. Today, StreamFit isn’t just for fitness—it’s for resilience, transformation, and finding strength in connection. Because no matter where you are or what challenges you face, fitness should always be within reach.
          </p>
        </div>
        <img src={storyImage} alt="Our Story" className="section-image3" />
      </section>
    </div>
  );
};

export default LearnAbout;