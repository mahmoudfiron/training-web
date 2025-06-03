import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/AIReports.css';

export default function AIReports() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const q = query(
        collection(db, "users", user.uid, "aiSessions"),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const session = doc.data();
        const timestamp = session.timestamp?.toDate?.();
        return {
          id: doc.id,
          ...session,
          formattedDate: timestamp
            ? timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Unknown',
          rawDate: timestamp || null
        };
      });

      setSessions(data);
    });

    return () => unsubscribe();
  }, []);

  const bicepsSessions = sessions.filter(s => s.exerciseType === 'biceps');
  const yogaSessions = sessions.filter(s => s.exerciseType === 'yoga');

  // 🧠 Summary calculations
  const totalBicepsReps = bicepsSessions.reduce((sum, s) => sum + s.reps, 0);
  const totalYogaDuration = yogaSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  const lastSessionDate = sessions[0]?.rawDate
    ? sessions[0].rawDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  return (
    <div className="ai-reports-container">
      <h1>📊 AI Training Progress</h1>

      {/* 🧠 Summary Panel */}
      <div className="summary-panel">
        <h3>🧠 AI Summary Overview</h3>
        <p>🕒 Last Session: <strong>{lastSessionDate}</strong></p>
        <p>💪 Total Biceps Reps: <strong>{totalBicepsReps}</strong></p>
        <p>🧘 Total Yoga Duration: <strong>{totalYogaDuration} sec</strong></p>
      </div>

      <p>Fetched {sessions.length} session(s).</p>

      {bicepsSessions.length > 0 && (
        <div className="section">
          <h2>💪 Biceps Reps Over Time</h2>
          {(() => {
            const averageReps =
              bicepsSessions.reduce((sum, s) => sum + s.reps, 0) / bicepsSessions.length;

            const labels = bicepsSessions.map(s => s.formattedDate);
            const repsData = bicepsSessions.map(s => s.reps);
            const averageLine = Array(bicepsSessions.length).fill(averageReps);

            return (
              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: 'Reps',
                      data: repsData,
                      borderColor: 'rgba(75,192,192,1)',
                      fill: false,
                      tension: 0.3
                    },
                    {
                      label: 'Average Reps',
                      data: averageLine,
                      borderColor: 'rgba(255,99,132,0.6)',
                      borderDash: [5, 5],
                      fill: false,
                      pointRadius: 0,
                      tension: 0
                    }
                  ]
                }}
              />
            );
          })()}
        </div>
      )}

      {yogaSessions.length > 0 && (
        <div className="section">
          <h2>🧘 Yoga Pose Durations</h2>
          <Line
            data={{
              labels: yogaSessions.map(s => `${s.pose} (${s.formattedDate})`),
              datasets: [
                {
                  label: 'Duration (seconds)',
                  data: yogaSessions.map(s => s.duration),
                  borderColor: 'rgba(153,102,255,1)',
                  fill: false
                }
              ]
            }}
          />
        </div>
      )}
    </div>
  );
}
