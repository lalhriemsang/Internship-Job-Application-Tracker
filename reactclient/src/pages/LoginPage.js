import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext"; // Hook to access authentication context
import { loginUser } from "../services/authService"; // Function to handle API login

const LoginPage = () => {
  const { login } = useAuth(); // Access the login function from context
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // To store error messages
  const [loading, setLoading] = useState(false); // Show loader while submitting

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors
    try {
      // Call the API to login
      const data=await loginUser(formData);
      login({
        email:data.email,
        userId:data.userId,
        username:data.username
      }); // Update the auth context to mark the user as logged in
      navigate("/home"); // Redirect to home page after successful login
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      <p style={{ marginTop: "1rem" }}>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
};

export default LoginPage;
