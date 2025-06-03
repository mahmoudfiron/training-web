import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [learnerCounts, setLearnerCounts] = useState({});
  const navigate = useNavigate();

  // ✅ Date formatter (kept for future use if needed)
  // const formatDate = (isoString) => {
  //   if (!isoString) return '';
  //   const options = { year: 'numeric', month: 'short', day: 'numeric' };
  //   return new Date(isoString).toLocaleDateString(undefined, options);
  // };

  // ✅ Helper to check for free pricing
  const isFreeCourse = (price) => {
    const numericPrice = parseFloat(price);
    return numericPrice <= 1;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchEnrolledCourses(currentUser.uid);
      } else {
        setEnrolledCourses([]);
        setLoadingEnrolled(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEnrolledCourses = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setEnrolledCourses(userDoc.data().enrolledCourses || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoadingEnrolled(false);
    }
  };

  const fetchLearnerCounts = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const counts = {};

      for (const userDoc of usersSnapshot.docs) {
        const enrolledCoursesSnapshot = await getDocs(collection(db, `users/${userDoc.id}/enrolledCourses`));
        enrolledCoursesSnapshot.forEach((doc) => {
          const courseId = doc.id;
          if (counts[courseId]) {
            counts[courseId] += 1;
          } else {
            counts[courseId] = 1;
          }
        });
      }

      setLearnerCounts(counts);
    } catch (error) {
      console.error('Error fetching learner counts:', error);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = [];
        const categories = ['yoga', 'pilates', 'full-body', 'stretch', 'meditation'];

        for (const category of categories) {
          const coursesSnapshot = await getDocs(collection(db, `courseCategories/${category}/courses`));
          coursesSnapshot.forEach((doc) => {
            coursesData.push({ id: doc.id, ...doc.data(), categoryName: category });
          });
        }

        setCourses(coursesData);

        await fetchLearnerCounts();
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleMoreInfo = (courseId, categoryName) => {
    console.log(`Navigating to course-details for category: ${categoryName}, course ID: ${courseId}`);
    navigate(`/course-details/${categoryName}/${courseId}`);
  };

  if (loadingEnrolled) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="homepage">
      <div className="courses-container">
        {courses.map((course) => {
          const isEnrolled = enrolledCourses.includes(course.id);
          const price = parseFloat(course.price).toFixed(2);
          const isFree = isFreeCourse(course.price);

          return (
            <div className="course-card" key={course.id}>
              <div className="course-card-header">
            <span
                   className="availability-badge"
                      style={{ backgroundColor: course.available ? '#4caf50' : '#f44336' }}
            >
                  {course.available ? 'Available' : 'Unavailable'}
            </span>                <span className="category-badge">{course.categoryName}</span>
              </div>
              <img src={course.imageBase64 || '/default-course.jpg'} alt={`${course.courseName}`} className="course-image" />
              <div className="course-card-body">
                <h3>{course.courseName}</h3>



                <div className="course-details">
                  <span className="learners-count">
                    {learnerCounts[course.id] || 0} learners
                  </span>

                  {/* ✅ Only show price if NOT free */}
                  <span className="course-duration">
  {isFree ? (
    <span className="availability-badge" style={{ backgroundColor: '#ff9800' }}>Free</span>
  ) : (
    <>
      <i className="fa fa-usd"></i> {price}
    </>
  )}
</span>
                </div>

                <button
                  className="more-info-button"
                  onClick={() => handleMoreInfo(course.id, course.categoryName)}
                >
                  More Info
                </button>

                {isEnrolled ? (
                  <span className="enrolled-badge">Enrolled</span>
                ) : (
                  <button
                    className="start-course-button"
                    onClick={() => navigate(`/course-payment/${course.categoryName}/${course.id}`)}
                  >
                    Start Course Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;

