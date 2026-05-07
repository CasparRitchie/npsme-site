// src/components/CsvNpsWorkspaceNav.jsx
import React from "react";

export default function CsvNpsWorkspaceNav() {
  return (
    <nav className="csv-nps-workspace-nav" aria-label="CSV NPS workspace navigation">
      <a href="/csv-nps/upload">Upload</a>
      <a href="/csv-nps/performance">Performance</a>
      <a href="/csv-nps/responses">Responses</a>
      <a href="/csv-nps/closing-the-loop">Closing the loop</a>
    </nav>
  );
}
