import React, { useState } from 'react';
import '../styles/ProfilePages.css';
import { auth } from '../firebase.js';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import { deleteDoc, doc } from 'firebase/firestore'; // ADD THIS import
import { db } from '../firebase.js';

const AccountSettings = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password should be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        toast.success('✅ Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('User not authenticated.');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.message || '❌ Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
  const confirmed = window.confirm(
    'Are you sure you want to deactivate your account? This action cannot be undone.'
  );

  if (!confirmed) return;

  const user = auth.currentUser;

  if (!user) {
    toast.error('User not authenticated.');
    return;
  }

  try {
    // Ask for password to reauthenticate
    const email = user.email;
    const password = prompt('Please enter your password to confirm:');

    if (!password) {
      toast.info('Deactivation cancelled.');
      return;
    }

    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);

    // 🔥 Delete Firestore user doc
    await deleteDoc(doc(db, 'users', user.uid));

    // 🔥 Delete Firebase Auth account
    await user.delete();

    toast.success('✅ Account deleted.');
    navigate('/'); // Redirect to home
  } catch (err) {
    console.error('Account delete error:', err);
    toast.error(err.message || '❌ Failed to delete account.');
  }
};

  return (
    <div className="profile-page-container">
      <h2>Account Settings</h2>
      <p>Update password and manage account preferences.</p>

      <div className="section">
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleUpdatePassword} disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      <div className="section">
        <h3>Account Actions</h3>
        <button className="danger-button" onClick={handleDeactivateAccount}>
          Deactivate Account
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
