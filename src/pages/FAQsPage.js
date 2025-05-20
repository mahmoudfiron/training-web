import React from 'react';
import './StaticPage.css'; // ✅ Add this line at the top

const FAQsPage = () => {
  return (
    <div className="static-page">
      <h1>Frequently Asked Questions</h1>

      <h3>Do I need to pay to join StreamFit?</h3>
      <p>Some courses are free, and others require a one-time payment. You can view prices on each course page.</p>

      <h3>Can I cancel or pause a course?</h3>
      <p>Since courses are on-demand and/or live-streamed, there's no cancellation fee. Simply stop attending anytime.</p>

      <h3>How can I become an instructor?</h3>
      <p>Click on “Create Courses on StreamFit” in the footer, and log in as an instructor to get started.</p>
    </div>
  );
};

export default FAQsPage;
