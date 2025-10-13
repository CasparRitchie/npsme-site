// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import ImpactPage from "./ImpactPage";          // wrapper that renders <Impact />
import SocialListening from "./SocialListening";
import CxPulseSample from "./CxPulseSample";
import MilestoneNps from "./MilestoneNps";
import Privacy from "./Privacy";
import Terms from "./Terms";
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./Layout";



export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<NpsMeLanding />} />
          <Route path="/products" element={<Products />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/social-listening" element={<SocialListening />} />
          <Route path="/cx-pulse-sample" element={<CxPulseSample />} />
          <Route path="/milestone-nps" element={<MilestoneNps />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          {/* Fallback: send unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  );
}
