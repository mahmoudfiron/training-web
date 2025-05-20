import React from 'react';
import './StaticPage.css'; // ✅ Add this line at the top

const ContactPage = () => {
  return (
    <div className="static-page">
      <h1>Contact Us</h1>
      <p>Have a question, issue, or suggestion? We'd love to hear from you!</p>

      <h3>Email</h3>
      <p>mahmoudfiron13@gmail.com</p>

      <h3>Business Hours</h3>
      <p>Sunday – Thursday: 9:00 AM – 5:00 PM (GMT+2)</p>

      <h3>Response Time</h3>
      <p>We typically reply within 1–2 business days.</p>
    </div>
  );
};

export default ContactPage;
