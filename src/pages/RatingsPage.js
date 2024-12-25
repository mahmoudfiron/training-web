import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import '../styles/RatingsPage.css';

const RatingsPage = () => {
  const [topRatedCourses, setTopRatedCourses] = useState([]);
  const [userNames, setUserNames] = useState({}); // Map to store userId to name

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const courseCategoriesRef = collection(db, 'courseCategories');
        const categoriesSnap = await getDocs(courseCategoriesRef);
        let allCourses = [];

        for (const category of categoriesSnap.docs) {
          const coursesRef = collection(db, 'courseCategories', category.id, 'courses');
          const coursesSnap = await getDocs(coursesRef);
          const coursesList = coursesSnap.docs.map((doc) => {
            const data = doc.data();
            const ratings = data.ratings || [];
            const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = ratings.length ? (totalRating / ratings.length).toFixed(1) : 'No ratings yet';
            return {
              id: doc.id,
              categoryName: category.id,
              courseName: data.courseName,
              description: data.description,
              avgRating,
              totalRatings: ratings.length,
              reviews: ratings,
            };
          });
          allCourses = [...allCourses, ...coursesList];
        }

        // Sort courses by average rating
        const sortedCourses = allCourses.sort((a, b) => b.avgRating - a.avgRating);
        setTopRatedCourses(sortedCourses);

        // Fetch user names
        const userIds = new Set();
        sortedCourses.forEach((course) =>
          course.reviews.forEach((review) => userIds.add(review.userId))
        );

        const userNamesMap = {};
        const userFetchPromises = Array.from(userIds).map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            userNamesMap[userId] = userDoc.data().fullName || 'Unknown User';
          }
        });

        await Promise.all(userFetchPromises);
        setUserNames(userNamesMap);
      } catch (error) {
        console.error('Error fetching top-rated courses:', error);
      }
    };

    fetchRatings();
  }, []);

  return (
    <div className="ratings-page">
      <h1>Top Rated Courses</h1>
      <div className="courses-container">
        {topRatedCourses.length > 0 ? (
          topRatedCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.courseName}</h3>
              <p>Category: {course.categoryName}</p>
              <p>Average Rating: {course.avgRating}</p>
              <p>Total Reviews: {course.totalRatings}</p>
              <button
                className="view-course-button"
                onClick={() => alert(`View more details about ${course.courseName}`)}
              >
                View Course
              </button>
              <div className="reviews-section">
                <h4>User Reviews:</h4>
                {course.reviews.slice(0, 3).map((review, index) => (
                  <p key={index}>
                    {review.rating} ★ by {userNames[review.userId] || 'Anonymous'}
                  </p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No top-rated courses available yet.</p>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;
