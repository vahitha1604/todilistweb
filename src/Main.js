import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App"; // Main component (Login/Signup)
import TaskPage from "./components/TaskPage"; // Task page component

const Main = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/tasks" element={<TaskPage />} />
    </Routes>
  </Router>
);

export default Main;
