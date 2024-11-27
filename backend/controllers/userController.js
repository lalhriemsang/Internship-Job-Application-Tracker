const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("authToken", token, {
      httpOnly: true, // Cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS
      maxAge: 3600000, // Token expiry time (1 hour)
      sameSite: "Strict", // Prevent sending cookie in cross-origin requests
    });

    res.json({ message: "Login successful",email:email,userId:user._id,username:user.name });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Clear the authToken cookie by setting its expiration date in the past
    res.cookie("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send the cookie over HTTPS in production
      maxAge: 0, // Set maxAge to 0 to immediately expire the cookie
      sameSite: "Strict", // Prevent sending cookie in cross-origin requests
    });

    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
