import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../styles/MyCourses.css';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null); // For the modal
  const [rating, setRating] = useState(0); // For storing user rating
  const [userRatings, setUserRatings] = useState({}); // Store user's ratings for courses
  const user = auth.currentUser;
  const navigate = useNavigate();

  // Fetch enrolled courses and their details from Firestore
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (user) {
        try {
          const enrolledCoursesRef = collection(db, 'users', user.uid, 'enrolledCourses');
          const coursesSnap = await getDocs(enrolledCoursesRef);
          const coursesList = [];

          for (const courseDoc of coursesSnap.docs) {
            const courseData = courseDoc.data();
            const courseId = courseDoc.id;

            // Fetch course details from courseCategories collection
            const courseDetailsRef = doc(
              db,
              'courseCategories',
              courseData.categoryName,
              'courses',
              courseId
            );
            const courseDetailsSnap = await getDoc(courseDetailsRef);

            if (courseDetailsSnap.exists()) {
              coursesList.push({
                id: courseId,
                ...courseData,
                ...courseDetailsSnap.data(), // Include course details (e.g., imageBase64)
              });
            }
          }

          console.log('Fetched Courses:', coursesList); // Debugging
          setEnrolledCourses(coursesList);
        } catch (error) {
          console.error('Error fetching enrolled courses:', error);
        }
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  // Function to handle course deletion
  const handleDeleteCourse = async (categoryName, courseId) => {
    try {
      if (!categoryName) {
        alert('Error: Cannot find the course category.');
        return;
      }

      // Delete all lessons under the course
      const lessonsRef = collection(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons');
      const lessonsSnap = await getDocs(lessonsRef);
      const deleteLessonsPromises = lessonsSnap.docs.map((lessonDoc) =>
        deleteDoc(doc(db, 'courseCategories', categoryName, 'courses', courseId, 'lessons', lessonDoc.id))
      );
      await Promise.all(deleteLessonsPromises);

      // Delete the course document
      const courseRef = doc(db, 'courseCategories', categoryName, 'courses', courseId);
      await deleteDoc(courseRef);

      // Remove the course from the UI
      setEnrolledCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));

      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting the course. Please try again.');
    }
  };

  // Function to handle rating submission
  const handleSubmitRating = async () => {
    if (selectedCourse && rating > 0) {
      try {
        const courseRef = doc(
          db,
          'courseCategories',
          selectedCourse.categoryName,
          'courses',
          selectedCourse.id
        );

        // Prevent duplicate ratings
        if (userRatings[selectedCourse.id]) {
          alert('You have already rated this course.');
          return;
        }

        // Update the course document with the new rating
        await updateDoc(courseRef, {
          ratings: arrayUnion({ userId: user.uid, rating }),
        });

        alert('Rating submitted successfully!');
        setUserRatings((prev) => ({ ...prev, [selectedCourse.id]: rating })); // Update local state
        setSelectedCourse(null);
        setRating(0);
      } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Error submitting rating. Please try again.');
      }
    } else {
      alert('Please select a rating before submitting.');
    }
  };

  return (
    <div className="my-courses">
      <div style={{ textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0, color: 'black' }}>
          My Enrolled Courses
        </h2>
        <p
          style={{
            fontSize: '1rem',
            fontWeight: 'normal',
            color: 'gray',
            marginTop: '10px',
            marginBottom: '40px',
          }}
        >
          Click on the course to see the lessons
        </p>
      </div>

      <div className="courses-container">
        {enrolledCourses.map((course) => (
          <div
            className="course-card2"
            key={course.id}
            onClick={() =>
              navigate(`/lessons/${course.id}`, { state: { categoryName: course.categoryName } })
            }
          >
            <h3>{course.courseName}</h3>
            <div className="course-image-circle">
              <img
                src={course.imageBase64 || '/default-course.jpg'}
                alt={course.courseName}
                className="course-image2"
              />
            </div>
            <p>Category: {course.categoryName}</p>
            <p>Price: {course.price}$</p>
            <p>_______________________</p>

            {/* Rate This Course Button or Thank You Message */}
            {userRatings[course.id] ? (
              <p className="thank-you-message">Thank you for rating! You rated: {userRatings[course.id]}</p>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourse(course);
                }}
                className="rate-button"
              >
                Rate This Course {'>'}
              </button>
            )}

            {/* Delete Button (Only for the course creator) */}
            {course.instructorUid === user?.uid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course.categoryName, course.id);
                }}
                className="delete-button"
              >
                Delete Course
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Rating Modal */}
      {selectedCourse && (
        <div className="rating-modal">
          <div className="modal-content2">
            <h4>Rate {selectedCourse.courseName}</h4>
            <br />
            <p>How Was Your Course?</p>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`rating-option ${rating === num ? 'selected' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button onClick={handleSubmitRating} className="submit-rating-button">
              Submit Rating
            </button>
            <button onClick={() => setSelectedCourse(null)} className="close-modal-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
