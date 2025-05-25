import React from 'react';
import '../styles/ProfilePages.css';

const FinancialAccount = () => {
  return (
    <div className="profile-page-container">
      <h2>Financial Account</h2>
      <p>Manage your earnings, payment methods, and payout info here.</p>

      <div className="section">
        <h3>Payout Method</h3>
        <input type="text" placeholder="PayPal Email or Bank Account" />
        <button>Save Payment Method</button>
      </div>

      <div className="section">
        <h3>Earnings Summary</h3>
        <p>You have earned <strong>$0.00</strong> so far.</p>
      </div>
    </div>
  );
};

export default FinancialAccount;
