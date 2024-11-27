import React, { useState, useEffect } from "react";
import { useAuth } from "../authContext"; // Hook for user authentication
import axios from "axios";

const ProfilePage = () => {
  const { user } = useAuth(); // Get the logged-in user's information
  const [skills, setSkills] = useState([]); // List of skills
  const [newSkill, setNewSkill] = useState({ skill: "", proficiency: 0, dateGained: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch skills from the backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        console.log("fetching skills")
        const res = await axios.get(`http://localhost:5000/api/skills/?userId=${user.userId}`);
        console.log(res.data)
        setSkills(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching skills.");
      }
    };

    fetchSkills();
  }, []);
  if (!user || !user.userId) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Please log in to access your applications.</h2>
      </div>
    );
  }
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSkill({ ...newSkill, [name]: value });
  };

  // Add a new skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/skills", { ...newSkill, userId: user.userId });
      setSkills([...skills, res.data.skills[res.data.skills.length - 1]]);
      setMessage("Skill added successfully!");
      setNewSkill({ skill: "", proficiency: 0, dateGained: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error adding skill.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h2>Name: {user.username}</h2>
      <h2>Skills</h2>
      <form onSubmit={handleAddSkill} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          name="skill"
          placeholder="Skill Name"
          value={newSkill.skill}
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
        />
        <select
          name="proficiency"
          value={newSkill.proficiency}
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
        >
          <option value="0">Beginner</option>
          <option value="1">Intermediate</option>
          <option value="2">Expert</option>
        </select>
        <input
          type="date"
          name="dateGained"
          placeholder="Date Gained"
          value={newSkill.dateGained}
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
          Add Skill
        </button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h3>Your Skills</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <li key={index} style={{ marginBottom: "1rem", textAlign: "left" }}>
              <strong>{skill.skill}</strong> -{" "}
              {["Beginner", "Intermediate", "Expert"][skill.proficiency]} (
              {new Date(skill.dateGained).toLocaleDateString()})
            </li>
          ))
        ) : (
          <p>No skills added yet.</p>
        )}
      </ul>
    </div>
  );
};

export default ProfilePage;
