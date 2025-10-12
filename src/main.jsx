import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NpsMeLanding from "./NpsMeLanding.jsx";
import Products from "./Products.jsx";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 grid place-items-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-slate-400">
          The page you’re looking for doesn’t exist.{" "}
          <a href="/" className="text-[#22C55E] underline">Go home</a>
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NpsMeLanding />} />
        <Route path="/products" element={<Products />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
