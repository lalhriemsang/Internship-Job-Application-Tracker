import React, { createContext, useState, useContext, useEffect } from "react";

// Create context
const AuthContext = createContext();

// AuthProvider component to wrap the app and provide the context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage or cookies)
    const savedUser = localStorage.getItem("user");

    // If savedUser is a valid string and can be parsed
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser); // Set user if valid
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []); // This runs only once when the component mounts

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Store user in localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Remove user data from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
