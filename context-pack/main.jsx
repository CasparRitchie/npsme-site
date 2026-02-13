import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppShell from "./App.jsx";
import "./styles.css";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <BrowserRouter>
    <LanguageProvider>
        <AppShell />
    </LanguageProvider>
      </BrowserRouter>
  </React.StrictMode>
);
