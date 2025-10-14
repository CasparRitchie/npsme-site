// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import NavBar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import ScrollToTop from "./components/ScrollToTop";
import { ROUTES } from "./routesRegistry";

export default function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
        <NavBar />
        <ScrollToTop/>
        <Routes>
          {ROUTES.filter((r) => r.enabled && r.component).map(({ path, component: C }) => (
            <Route key={path} path={path} element={<C />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SiteFooter />
      </div>
    </HelmetProvider>
  );
}
