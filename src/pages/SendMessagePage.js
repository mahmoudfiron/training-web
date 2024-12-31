import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import '../styles/SendMessagePage.css';

const SendMessagePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState('all');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('User logged in:', currentUser.uid);
        setUser(currentUser);
      } else {
        console.warn('No user logged in.');
        setUser(null);
        setCourses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInstructorCourses = async (userId) => {
      try {
        const coursesData = [];
        const categories = ['yoga', 'pilates', 'full-body', 'stretch', 'meditation'];

        for (const category of categories) {
          const coursesSnapshot = await getDocs(collection(db, `courseCategories/${category}/courses`));
          coursesSnapshot.forEach((doc) => {
            const courseData = { id: doc.id, ...doc.data(), categoryName: category };
            if (courseData.instructorUid === userId) {
              coursesData.push(courseData);
            }
          });
        }

        console.log('Fetched Courses:', coursesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching instructor courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInstructorCourses(user.uid);
    }
  }, [user]);

  // Fetch participants when a course is selected
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!selectedCourse) return;

      try {
        const selectedCourseDetails = courses.find((course) => course.id === selectedCourse);
        if (!selectedCourseDetails) {
          console.warn('Selected course details not found.');
          return;
        }

        // Query users enrolled in the selected course
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        const participantsList = [];

        for (const userDoc of usersSnap.docs) {
          const userData = userDoc.data();

          const enrolledCoursesRef = collection(db, `users/${userDoc.id}/enrolledCourses`);
          const enrolledCoursesSnap = await getDocs(enrolledCoursesRef);

          for (const enrolledDoc of enrolledCoursesSnap.docs) {
            if (enrolledDoc.id === selectedCourse) {
              participantsList.push({
                id: userDoc.id,
                name: userData.fullName || 'Unknown Participant',
              });
              break;
            }
          }
        }

        console.log('Fetched Participants:', participantsList);
        setParticipants(participantsList);
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    fetchParticipants();
  }, [selectedCourse, courses]);

  const handleSendMessage = async () => {
    if (!selectedCourse || !subject || !messageBody) {
      alert('Please fill all required fields!');
      return;
    }

    try {
      const selectedCourseDetails = courses.find((course) => course.id === selectedCourse);

      if (selectedParticipant === 'all') {
        for (const participant of participants) {
          await addDoc(collection(db, `users/${participant.id}/messages`), {
            sender: user.displayName || 'Instructor',
            courseName: selectedCourseDetails.courseName || 'Unknown Course',
            subject,
            body: messageBody,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      } else {
        await addDoc(collection(db, `users/${selectedParticipant}/messages`), {
          sender: user.displayName || 'Instructor',
          courseName: selectedCourseDetails.courseName || 'Unknown Course',
          subject,
          body: messageBody,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
      alert('Message sent successfully!');
      setSelectedCourse('');
      setSelectedParticipant('all');
      setSubject('');
      setMessageBody('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send the message. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="send-message-page">
      <h2>Send a New Message</h2>

      <div className="form-group">
        <label>Select Course:</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseName}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="form-group">
          <label>Select Participant:</label>
          <select
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
          >
            <option value="all">All Participants</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Message:</label>
        <textarea
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
        ></textarea>
      </div>

      <button
  onClick={() => {
    handleSendMessage(); // Call handleSendMessage
    navigate('/'); // Navigate after sending the message
  }}
  className="send-button"
>
  Send Message
</button>

    </div>
  );
};

export default SendMessagePage;