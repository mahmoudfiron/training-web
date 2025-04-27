import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="ai-trainer-home">

      <h1 className="page-title">Welcome to StreamFit AI Trainers</h1>
      <p className="subtitle">Choose your workout and start training smarter, not harder 💪</p>

      <div className="trainer-options">

        {/* Yoga Trainer Block */}
        <div className="trainer-card">
          <h2>🧘 AI Yoga Trainer</h2>
          <Link to='/ai-trainer/yoga'>
            <button className="btn start-btn">Start Yoga Trainer</button>
          </Link>
        </div>

        
        <div className="trainer-card">
          <h2>💪 AI Biceps Trainer</h2>
          <button
            onClick={() => window.open("http://localhost:5000/biceps", "_blank")}
            className="btn start-btn"
          >
            Start Biceps Trainer
          </button>
        </div>




        {/* Squat Trainer (Live) Block */}
        <div className="trainer-card">
          <h2>🏋️‍♂️ AI Squat Trainer (Live)</h2>
          <button
            onClick={() => window.open("http://localhost:8502", "_blank", "noopener,noreferrer")}
            className="btn start-btn"
          >
            Start Squat Trainer (Live)
          </button>
        </div>

        {/* Squat Trainer (Upload) Block */}
        <div className="trainer-card">
          <h2>📤 AI Squat Trainer (Upload Video)</h2>
          <button
            onClick={() => window.open("http://localhost:8501", "_blank", "noopener,noreferrer")}
            className="btn start-btn"
          >
            Start Squat Trainer (Upload Video)
          </button>
        </div>





      </div>

    </div>
  );
}
