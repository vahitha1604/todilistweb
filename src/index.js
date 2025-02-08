import React from "react";
import ReactDOM from "react-dom/client";
import Main from "./Main"; // Import the Main (router) component
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Main /> {/* Render the Main component */}
  </React.StrictMode>
);
