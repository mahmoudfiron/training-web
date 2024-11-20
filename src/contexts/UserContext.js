// src/contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserRoleFromFirestore } from '../utils/firebaseUtils'; // This is your existing function to get the user role

// Create User Context
export const UserContext = createContext();

// Create User Provider to manage user and role state
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const role = await getUserRoleFromFirestore(currentUser.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Failed to fetch user role: ', error);
        }
      } else {
        setUserRole('');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use User Context
export const useUser = () => useContext(UserContext);
