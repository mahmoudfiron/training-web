import React from 'react';
import './StaticPage.css'; // ✅ Add this line at the top

const TermsPage = () => {
  return (
    <div className="static-page">
      <h1>Terms of Service</h1>

      <p>
        By using StreamFit, you agree to our terms and conditions. You must be 13 years or older
        to create an account. Instructors are responsible for the content they publish.
      </p>

      <p>
        All payments are final unless otherwise stated. StreamFit reserves the right to remove any
        course or user who violates our community guidelines.
      </p>

      <p>
        For full legal terms, please contact our legal team at mahmoudfiron13@gmail.com
      </p>
    </div>
  );
};

export default TermsPage;
