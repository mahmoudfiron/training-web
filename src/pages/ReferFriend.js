// pages/ReferFriend.js
import React from 'react';
import './ReferFriend.css';

const ReferFriend = () => {
  return (
    <div className="refer-container">
      <h1 className="refer-title">Refer a Friend</h1>
      <p className="refer-text">
        Share StreamFit with a friend and earn discounts once they sign up!
      </p>
      <button className="refer-button" onClick={() => alert('Link copied (fake)!')}>
        Copy Link
      </button>
    </div>
  );
};

export default ReferFriend;
