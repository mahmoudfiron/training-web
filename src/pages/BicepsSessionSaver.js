import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

function BicepsSessionSaver({ onDone }) {
  useEffect(() => {
    const saveBicepsSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/biceps/count');
        const data = await response.json();
        const count = data.count;

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        await addDoc(collection(db, 'users', user.uid, 'aiSessions'), {
          exerciseType: 'biceps',
          reps: count,
          timestamp: serverTimestamp()
        });

        console.log("✅ Biceps session saved to Firebase:", count, "reps");
        onDone(); // Optional callback (if you want to auto-redirect or close modal)
      } catch (error) {
        console.error("❌ Failed to save Biceps session:", error);
      }
    };

    saveBicepsSession();
  }, [onDone]);

  return null;
}

export default BicepsSessionSaver;
