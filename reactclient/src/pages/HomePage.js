import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../authContext";

const HomePage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/applications?userId=${user.userId}`
        );
        setApplications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching applications.");
      }
    };

    if (user && user.userId) {
      fetchApplications();
    }
  }, [user]);
  if (!user || !user.userId) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Please log in to access your applications.</h2>
      </div>
    );
  }
  const handleSkillRecommendations = async (company, job) => {
    setLoading(true);
    setModalVisible(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/applications/skillRecommendations",
        { userId: user.userId, company, job },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOutput({ type: "skills", data: response.data.skillRecommendations });
    } catch (err) {
      setOutput({ type: "error", message: err.response?.data?.message || "Error fetching skill recommendations." });
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewPrep = async (company, job) => {
    setLoading(true);
    setModalVisible(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/applications/interviewPrep",
        { userId: user.userId, company, job },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOutput({ type: "interview", data: response.data.recommendations });
    } catch (err) {
      setOutput({ type: "error", message: err.response?.data?.message || "Error fetching interview prep tips." });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAnalysis = async (company, job) => {
    setLoading(true);
    setModalVisible(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/applications/skillAnalysis",
        { userId: user.userId, company, job },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOutput({ type: "skillAnalysis", data: response.data });
    } catch (err) {
      setOutput({ type: "error", message: err.response?.data?.message || "Error fetching skill analysis." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
      await axios.delete(`http://localhost:5000/api/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${user.token}` }      }
    );
      setApplications(applications.filter((app) => app._id !== applicationId));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting application.");
    }
  };

  const truncateText = (text, maxLines = 4) => {
    const lineLimit = 100 * maxLines; // Approximation for character limit per line
    return text.length > lineLimit ? `${text.substring(0, lineLimit)}...` : text;
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h2>Applications</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {applications.length > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {applications.map((app) => (
            <li
              key={app._id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              <h4>{app.company}</h4>
              <p><strong>Job:</strong> {app.job}</p>
              <p>
                <strong>Details:</strong> {truncateText(app.jobDetails)}
              </p>
              <p><strong>Deadline:</strong> {new Date(app.deadline).toLocaleDateString()}</p>
              <p><strong>Contact Info:</strong> {app.contactInfo}</p>
              <button
                onClick={() => handleSkillRecommendations(app.company, app.job)}
                style={{ margin: "5px", padding: "5px 10px", background: "#007bff", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
              >
                Get Skill Recommendations
              </button>
              <button
                onClick={() => handleInterviewPrep(app.company, app.job)}
                style={{ margin: "5px", padding: "5px 10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
              >
                Get Interview Prep Tips
              </button>
              <button
                onClick={() => handleSkillAnalysis(app.company, app.job)}
                style={{ margin: "5px", padding: "5px 10px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
              >
                Skill Analysis for Job
              </button>
              <button
                onClick={() => handleDeleteApplication(app._id)}
                style={{ margin: "5px", padding: "5px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
              >
                Delete Application
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No applications found.</p>
      )}

      {/* Modal for displaying output */}
      {modalVisible && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh", // Limit the height of the modal
        overflow: "hidden", // Prevent content from spilling outside
        position: "relative", // For absolute positioning of close button
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setModalVisible(false)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "5px 10px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        X
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
        {output?.type === "skills" && (
  <>
    <h4>Recommended Skills:</h4>
    <div
      style={{
        maxHeight: "60vh", // Limits content area height
        overflowY: "auto", // Enables scrolling within the content
      }}
    >
      <ul style={{ padding: 0, listStyleType: "none" }}>
        {output.data.map((skill, index) => (
          <li
            key={index}
            style={{
              backgroundColor: "#f1f1f1", // Light gray background for each item
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px", // Rounded corners
              border: "1px solid #ddd", // Border around each item
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Optional shadow for depth
              transition: "background-color 0.3s", // Smooth transition on hover
            }}
          >
            <strong>{skill.skill}</strong>
            <p><strong>Course:</strong> {skill.courseName}</p>
            <p><strong>Provider:</strong> {skill.provider}</p>
            <p><strong>Description:</strong> {skill.description}</p>
          </li>
        ))}
      </ul>
    </div>
  </>
)}

{output?.type === "interview" && (
  <>
    <h4>Interview Prep Tips:</h4>
    <div
      style={{
        maxHeight: "60vh", // Limits content area height
        overflowY: "auto", // Enables scrolling within the content
      }}
    >
      <ul style={{ padding: 0, listStyleType: "none" }}>
        {output.data.map((tip, index) => (
          <li
            key={index}
            style={{
              backgroundColor: "#f1f1f1", // Light gray background for each item
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px", // Rounded corners
              border: "1px solid #ddd", // Border around each item
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Optional shadow for depth
              transition: "background-color 0.3s", // Smooth transition on hover
            }}
          >
            <p><strong>Platform Name:</strong> {tip.platformName}</p>
            <p><strong>URL:</strong> {tip.url}</p>
            <p><strong>Focus:</strong> {tip.focus}</p>
            <p><strong>Category:</strong> {tip.category}</p>
          </li>
        ))}
      </ul>
    </div>
  </>
)}

{output?.type === "skillAnalysis" && (
  <>
    <h4>Skill Analysis:</h4>
    <div
      style={{
        maxHeight: "60vh", // Limits content area height
        overflowY: "auto", // Enables scrolling within the content
      }}
    >
      <div
        style={{
          backgroundColor: "#f1f1f1", // Light gray background for each item
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px", // Rounded corners
          border: "1px solid #ddd", // Border around each item
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Optional shadow for depth
        }}
      >
        <p><strong>Matched Skills:</strong> {output.data.matchedSkills.join(", ")}</p>
        <p><strong>Improve Skills:</strong> {output.data.improveSkills.join(", ")}</p>
        <p><strong>Missing Skills:</strong> {output.data.missingSkills.join(", ")}</p>

      </div>
    </div>
  </>
)}

          {output?.type === "error" && (
            <p style={{ color: "red" }}>{output.message}</p>
          )}
        </>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default HomePage;
