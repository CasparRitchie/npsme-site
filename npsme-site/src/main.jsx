import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import NpsMeLanding from "./NpsMeLanding.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NpsMeLanding />
  </React.StrictMode>
);
