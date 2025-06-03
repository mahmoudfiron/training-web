import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import { useAuth } from '../contexts/AuthContext.js';

export default function Home() {
  const { user } = useAuth();

  const openBicepsTrainer = () => {
    if (!user?.uid) {
    alert("Please login first.");
    return;
}
const uid = user.uid;
    const url = `http://localhost:5000/biceps?uid=${uid}`;
    window.open(url, "_blank");
  };

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

        {/* ✅ Biceps Trainer Block (fixed) */}
        <div className="trainer-card">
          <h2>💪 AI Biceps Trainer</h2>
          <button onClick={openBicepsTrainer} className="btn start-btn">
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
