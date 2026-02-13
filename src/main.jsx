import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppShell from "./App.jsx";
import "./styles.css";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";

// src/main.jsx
const params = new URLSearchParams(window.location.search);
const debugCharts = params.get("debugCharts") === "1";

if (debugCharts) {
  const patch = (methodName) => {
    const orig = console[methodName].bind(console);
    console[methodName] = (...args) => {
      const text = args.map((a) => {
        try {
          return typeof a === "string" ? a : JSON.stringify(a);
        } catch {
          return String(a);
        }
      }).join(" ");

      // Match the *actual* Recharts warning shape
      const isRechartsSize =
        text.includes("width(") &&
        text.includes("height(") &&
        (text.includes("chart should be greater than 0") ||
          text.includes("please check the style of container"));

      if (isRechartsSize) {
        orig("🔎 Recharts size warning caught:", ...args);
        orig("🔎 Stack trace:\n", new Error().stack);
        // also show the current URL to ensure flag is active
        orig("🔎 URL:", window.location.href);
        return;
      }

      orig(...args);
    };
  };

  patch("warn");
  patch("error");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <BrowserRouter>
    <LanguageProvider>
        <AppShell />
    </LanguageProvider>
      </BrowserRouter>
  </React.StrictMode>
);
