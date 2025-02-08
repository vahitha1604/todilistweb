import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./App.css";

const App = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  // Handle Signup/Login logic
  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate email format (only Gmail addresses)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid Gmail address.");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      const url = isSignup
        ? "http://localhost:5000/api/signup"
        : "http://localhost:5000/api/login";

      const response = await axios.post(url, { email, password });

      if (isSignup) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          setIsSignup(false);
        }, 2000);
      } else {
        const { token } = response.data;
        localStorage.setItem("token", token);
        setIsLeaving(true);
        setTimeout(() => navigate("/tasks"), 2000);
      }
    } catch (err) {
      console.error("Error from backend:", err);
      if (err.response) {
        setErrorMessage(err.response.data.message || "An error occurred");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.div
          initial={{ y: "-100vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100vh", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="auth-box"
        >
          <h1>{isSignup ? "Sign Up" : "Log In"}</h1>
          <form method="POST" action="#" onSubmit={handleAuth}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
            />
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                style={{ paddingRight: "30px" }}
                required
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit">{isSignup ? "Sign Up" : "Log In"}</button>
          </form>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <button onClick={() => setIsSignup((prev) => !prev)}>
            {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
          {showSuccessPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="popup"
            >
              <p>Account successfully created!</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
