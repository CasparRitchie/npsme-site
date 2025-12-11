// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import NavBar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import ScrollToTop from "./components/ScrollToTop";
import { ROUTES } from "./routesRegistry";

function AppShell() {
  const location = useLocation();

  const bareRoutes = [
    "/live-invitation-survey",
    "/live-survey-page",
    "/live-survey/thanks",
  ];

  const isBare = bareRoutes.includes(location.pathname);

  const rootClass = isBare
    ? "min-h-screen bg-[#F5F7FF] text-slate-900"
    : "min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200";

  return (
    <HelmetProvider>
      <div className={rootClass}>
        {!isBare && <NavBar />}
        <ScrollToTop />
        <Routes>
          {ROUTES.filter((r) => r.enabled && r.component).map(
            ({ path, component: C }) => (
              <Route key={path} path={path} element={<C />} />
            )
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!isBare && <SiteFooter />}
      </div>
    </HelmetProvider>
  );
}

export default AppShell;
