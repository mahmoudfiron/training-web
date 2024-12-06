// PaymentPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Ensure auth is imported for current user
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const { courseId, categoryName } = useParams();
  const [course, setCourse] = useState(null);
  const [email, setEmail] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: '',
    country: '',
  });
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
        const courseSnap = await getDoc(docRef);
        if (courseSnap.exists()) {
          setCourse(courseSnap.data());
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    fetchCourse();
  }, [categoryName, courseId]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  const handlePayment = async () => {
    try {
      // Simulating payment success
      alert('Payment successful!');

      // Check if user is logged in
      if (!user) {
        alert('Please log in to complete enrollment.');
        return;
      }

      // Add the course to the user's enrolled courses
      const userRef = doc(db, 'users', user.uid, 'enrolledCourses', courseId);
      await setDoc(userRef, {
        courseName: course.courseName,
        categoryName: categoryName,
        price: course.price,
        enrolledAt: new Date(),
      });

      // Navigate to the home page after successful payment
      navigate('/');

    } catch (error) {
      console.error('Error during payment or enrollment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="payment-page">
      <div className="payment-left">
        <h2>Try {course.courseName}</h2>
        <h4>7 days free</h4>
        <h4>Then ${course.price} per year</h4>
        <div className="course-summary">
          <div className="course-info">
            <h3>Learning Outcomes:</h3>
            <p>{course.learningOutcomes}</p>
            <p><strong>Price: </strong>${course.price}</p>
            <img src="https://cdn.pixabay.com/photo/2021/03/19/13/15/bill-6107551_640.png" alt="Placeholder Img" />
          </div>
        </div>
      </div>
      <div className="payment-right">
        <h2>Pay for your Course</h2>
        <form className="payment-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="card-details">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={cardDetails.cardNumber}
              onChange={handleCardInputChange}
              required
            />
            <input
              type="text"
              name="expiry"
              placeholder="MM / YY"
              value={cardDetails.expiry}
              onChange={handleCardInputChange}
              required
            />
            <input
              type="text"
              name="cvc"
              placeholder="CVC"
              value={cardDetails.cvc}
              onChange={handleCardInputChange}
              required
            />
            <input
              type="text"
              name="nameOnCard"
              placeholder="Full Name on Card"
              value={cardDetails.nameOnCard}
              onChange={handleCardInputChange}
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={cardDetails.country}
              onChange={handleCardInputChange}
              required
            />
          </div>
          <button type="button" className="pay-now-button" onClick={handlePayment}>
            Start Trial
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;