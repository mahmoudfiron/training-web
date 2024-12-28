import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/MessagesPage.css';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null); // Selected message to display
  const user = auth.currentUser;
  const { messageId } = useParams(); // Capture messageId if navigating to `/messages/:messageId`

  // Fetch messages for the logged-in user
  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        try {
          const messagesRef = collection(db, 'users', user.uid, 'messages');
          const messagesSnap = await getDocs(messagesRef);
          const messagesList = messagesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(messagesList);

          // Automatically select a message if messageId exists in the URL
          if (messageId) {
            const selectedMsg = messagesList.find((msg) => msg.id === messageId);
            if (selectedMsg) setSelectedMessage(selectedMsg);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [user, messageId]);

  // Handle message click to display details
  const handleSelectMessage = async (id) => {
    try {
      const messageRef = doc(db, 'users', user.uid, 'messages', id);
      const messageSnap = await getDoc(messageRef);
      if (messageSnap.exists()) {
        setSelectedMessage({ id: messageSnap.id, ...messageSnap.data() });
      }
    } catch (error) {
      console.error('Error fetching message details:', error);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-sidebar">
        <h3>Your Messages</h3>
        <ul>
          {messages.map((msg) => (
            <li
              key={msg.id}
              onClick={() => handleSelectMessage(msg.id)}
              className={selectedMessage?.id === msg.id ? 'active' : ''}
            >
              <p><strong>{msg.subject}</strong></p>
              <p>From: {msg.sender || 'Unknown'}</p>
              <p>{msg.timestamp}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="message-details">
        {selectedMessage ? (
          <>
            <h3>Message Details</h3>
            <p><strong>From:</strong> {selectedMessage.sender || 'Unknown'}</p>
            <p><strong>Subject:</strong> {selectedMessage.subject}</p>
            <p><strong>Course:</strong> {selectedMessage.courseName || 'N/A'}</p>
            <p><strong>Date:</strong> {selectedMessage.timestamp}</p>
            <hr />
            <p>{selectedMessage.body}</p>
          </>
        ) : (
          <p>Select a message to view its details.</p>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;