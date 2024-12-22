import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/ChatModal.css';

const ChatModal = ({ courseId, instructorId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userNames, setUserNames] = useState({});
    const userId = auth.currentUser?.uid;
    const chatHistoryRef = useRef(null);

    useEffect(() => {
        const messagesRef = collection(db, `chats/${courseId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(messages);

            // Fetch sender names dynamically
            const senderIds = [...new Set(messages.map((msg) => msg.senderId))];
            senderIds.forEach(async (id) => {
                if (!userNames[id]) {
                    const userDoc = await getDoc(doc(db, 'users', id));
                    if (userDoc.exists()) {
                        setUserNames((prev) => ({
                            ...prev,
                            [id]: userDoc.data().fullName || 'Anonymous',
                        }));
                    }
                }
            });

            // Scroll to the bottom of the chat
            if (chatHistoryRef.current) {
                chatHistoryRef.current.scrollTo({
                    top: chatHistoryRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            }

            // Mark messages as read for the current user
            const unreadMessages = messages.filter(
                (msg) => msg.senderId !== userId && !(msg.readBy || []).includes(userId)
            );

            for (const msg of unreadMessages) {
                const msgRef = doc(db, `chats/${courseId}/messages`, msg.id);
                await updateDoc(msgRef, { readBy: [...(msg.readBy || []), userId] });
            }
        });

        return unsubscribe;
    }, [courseId, userId, userNames]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        const user = auth.currentUser;
        const senderName = userNames[user.uid] || 'Anonymous';

        await addDoc(collection(db, `chats/${courseId}/messages`), {
            senderId: user.uid,
            senderName: senderName,
            senderRole: user.uid === instructorId ? 'instructor' : 'user',
            content: newMessage,
            timestamp: new Date(),
            readBy: [], // Reset readBy when sending a new message
        });

        setNewMessage('');
    };

    return (
        <div className="chat-modal">
            <div className="chat-header">
                <h3>Chat</h3>
                <button className="close-button" onClick={onClose}>
                    ✖
                </button>
            </div>
            <div className="chat-history" ref={chatHistoryRef}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`chat-message ${message.senderRole === 'instructor' ? 'instructor' : 'user'}`}
                    >
                        <p className="message-header">
                            <strong>{userNames[message.senderId] || message.senderName || 'Anonymous'}</strong>{' '}
                            <span className="timestamp">
                                {new Date(message.timestamp?.toDate()).toLocaleTimeString()}
                            </span>
                        </p>
                        <p>{message.content}</p>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatModal;