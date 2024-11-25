// CheckoutForm.js
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const CheckoutForm = ({ courseId, categoryName, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    try {
      // Use Stripe to confirm card payment here
      const { error } = await stripe.confirmCardPayment('YOUR_CLIENT_SECRET_HERE', {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name',
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Update Firestore to register the participant
      const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
      await updateDoc(courseRef, {
        participants: arrayUnion({
          name: 'Customer Name', // Ideally, capture from user auth data
          email: 'customer@example.com', // Same as above
        }),
      });

      onSuccess(); // Navigate to a confirmation page or do other actions
    } catch (err) {
      setError('Payment failed, please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <CardElement />
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={!stripe || loading} className="pay-button">
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CheckoutForm;