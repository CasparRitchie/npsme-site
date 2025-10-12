// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";

// Pages
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import ImpactPage from "./ImpactPage";          // wrapper that renders <Impact />
// import SocialListening from "./SocialListening";
import CxPulseSample from "./CxPulseSample";
import Privacy from "./Privacy";
import Terms from "./Terms";


export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <NavBar />
      <Routes>
        <Route path="/" element={<NpsMeLanding />} />
        <Route path="/products" element={<Products />} />
        <Route path="/impact" element={<ImpactPage />} />
        {/* <Route path="/social-listening" element={<SocialListening />} /> */}
        <Route path="/cx-pulse-sample" element={<CxPulseSample />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* Fallback: send unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
