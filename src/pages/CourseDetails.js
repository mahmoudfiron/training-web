import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import "../styles/CourseDetails.css";

const CourseDetails = () => {
  const { courseId, categoryName } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("modules"); // For active tab handling
  const [activeModule, setActiveModule] = useState("module1"); // For active module dropdown
  const [expandedContent, setExpandedContent] = useState(null); // For expanded Learning Outcomes/Units
  const [hoveredButton, setHoveredButton] = useState(null); // For hovered button
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, "courseCategories", categoryName, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          setCourse(courseSnap.data());
        } else {
          console.error("No such course found!");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [categoryName, courseId]);

  if (!course) {
    return <div>Loading...</div>;
  }

  const toggleModule = (module) => {
    setActiveModule(activeModule === module ? null : module);
  };

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? "" : tab);
  };

  const toggleContent = (contentKey) => {
    setExpandedContent(expandedContent === contentKey ? null : contentKey);
  };

  // Ensure courseUnits is an array
  const courseUnits = Array.isArray(course.courseUnits)
    ? course.courseUnits
    : course.courseUnits
    ? course.courseUnits.split(",")
    : [];

  return (
    <div className="course-details-container">
      {/* Left Section */}
      <div className="course-info-container">
        <div className="course-tabs">
          {/* Tabs */}
          <button
            className={`tab-button ${activeTab === "modules" ? "active" : ""}`}
            onClick={() => toggleTab("modules")}
          >
            Course Modules <span>{activeTab === "modules" ? "▲" : "▼"}</span>
          </button>
          <button
            className={`tab-button ${activeTab === "description" ? "active" : ""}`}
            onClick={() => toggleTab("description")}
          >
            Course Description <span>{activeTab === "description" ? "▲" : "▼"}</span>
          </button>
          <button
            className={`tab-button ${activeTab === "certification" ? "active" : ""}`}
            onClick={() => toggleTab("certification")}
          >
            StreamFit Certification <span>{activeTab === "certification" ? "▲" : "▼"}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Course Modules */}
          {activeTab === "modules" && (
            <div className="modules-section">
              <button
                className={`dropdown-buttonM ${activeModule === "module1" ? "expanded" : ""}`}
                onClick={() => toggleModule("module1")}
              >
                <h3>{activeModule === "module1" ? "▲" : "▼"} MODULE 1</h3>
                <p>{course.categoryName} Exercises, Positions, and Benefits of {course.categoryName}</p>
              </button>
              {activeModule === "module1" && (
                <div className="module-content">
                  <div
                    className="module-row"
                    onMouseEnter={() => setHoveredButton("learningOutcomes")}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <button
                      className="content-button"
                      onClick={() => toggleContent("learningOutcomes")}
                    >
                      <h4>1). Learning Outcomes {expandedContent === "learningOutcomes" ? "▲" : "▼"}</h4>
                    </button>
                    {hoveredButton === "learningOutcomes" && (
                      <button
                        className="start-course-hover-button inline-button"
                        onClick={() => navigate(`/course-payment/${categoryName}/${courseId}`)}
                      >
                        Start Course Now
                      </button>
                    )}
                  </div>

                  {expandedContent === "learningOutcomes" && (
                    <p className="content-details">{course.learningOutcomes}</p>
                  )}

                  {courseUnits.map((unit, index) => (
                    <div key={index} style={{ display: "flex", flexDirection: "column" }}>
                      <button
                        className="content-button"
                        onClick={() => toggleContent(`unit${index + 1}`)}
                      >
                        <h4>
                          {index + 2}). Unit {index + 1}{" "}
                          {expandedContent === `unit${index + 1}` ? "▲" : "▼"}
                        </h4>
                        
                        
                      </button>
                      {expandedContent === `unit${index + 1}` && (
                        <div className="unit-content" style={{ padding: "10px 15px" }}>
                          <p>{unit.trim()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <br />

              <button
                className={`dropdown-buttonM ${activeModule === "module2" ? "expanded" : ""}`}
                onClick={() => toggleModule("module2")}
              >
                <h3>{activeModule === "module2" ? "▲" : "▼"} MODULE 2</h3>
                <p>Course Assessment</p>
              </button>
              {activeModule === "module2" && (
                <ol className="module-content">
                  {course.assessments?.map((assessment, index) => (
                    <li key={index}>
                      Assessment {index + 1}: {assessment}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* Course Description */}
          {activeTab === "description" && (
            <div className="description-section">
              <p>{course.description}</p>
              <button
                className="start-course-button"
                onClick={() => navigate(`/course-payment/${categoryName}/${courseId}`)}
              >
                Start Course Now
              </button>
            </div>
          )}

          {/* StreamFit Certification */}
          {activeTab === "certification" && (
            <div className="certification-section">
              <h5 className="certification-text">
                After completing this course, you will receive a StreamFit certification. Keep
                learning and achieving!
              </h5>
              <button
                className="start-course-button2"
                onClick={() => navigate(`/course-payment/${categoryName}/${courseId}`)}
              >
                Start Course Now {" >"}
              </button>
              <div className="certification-image-container"></div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Card */}
      <div className="course-overview">
        <img
          src={course.imageBase64 || "/default-course.jpg"}
          alt={course.courseName}
          className="course-image"
        />
        <div className="course-overview-info">
          <h2>{course.courseName}</h2>
          <p>
            <strong>Duration:</strong> {course.duration} hours
          </p>
          <p>
            <strong>Equipment:</strong> {course.equipment}
          </p>
          <p>
            <strong>Availability:</strong> {course.available ? "Available" : "Unavailable"}
          </p>
          <button
            className="start-course-button"
            onClick={() => navigate(`/course-payment/${categoryName}/${courseId}`)}
          >
            Start Course Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
