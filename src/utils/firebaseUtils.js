// src/utils/firebaseUtils.js
import { db } from '../firebase.js'; // Import Firestore database instance from your firebase configuration
import { doc, getDoc } from 'firebase/firestore';

export const getUserRoleFromFirestore = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.role || ''; // Assuming 'role' field exists in the Firestore document
    } else {
      console.error('No user found with the provided ID.');
      return '';
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    return '';
  }
};