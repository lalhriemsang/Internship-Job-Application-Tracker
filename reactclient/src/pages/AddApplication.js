import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../authContext"; // Hook for accessing authentication context

const AddApplicationPage = () => {
  const { user } = useAuth(); // Get logged-in user info
  const [formData, setFormData] = useState({
    company: "",
    job: "",
    jobDetails: "",
    deadline: "",
    contactInfo: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/applications", {
        ...formData,
        userId: user.userId, // Pass the user ID for association
      });
      setMessage("Application added successfully!");
      setFormData({
        company: "",
        job: "",
        jobDetails: "",
        deadline: "",
        contactInfo: "",
      }); // Reset form fields
    } catch (err) {
      setError(err.response?.data?.message || "Error adding application.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h2>Add New Job Application</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={formData.company}
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
        />
        <input
          type="text"
          name="job"
          placeholder="Job Title"
          value={formData.job}
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
        />
        <textarea
          name="jobDetails"
          placeholder="Job Details"
          value={formData.jobDetails}
          onChange={handleChange}
          required
          style={{
            padding: "0.5rem",
            width: "100%",
            height: "100px",
            marginBottom: "0.5rem",
          }}
        />
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
        />
        <input
          type="text"
          name="contactInfo"
          placeholder="Contact Information"
          value={formData.contactInfo}
          onChange={handleChange}
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Application
        </button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddApplicationPage;
