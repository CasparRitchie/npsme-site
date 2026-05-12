// src/components/CsvNpsWorkspaceNav.jsx
import React from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

export default function CsvNpsWorkspaceNav() {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  const datasetBasePath = datasetId
    ? `/workspace/datasets/${datasetId}`
    : null;

  async function handleWorkspaceLogout() {
    try {
      await fetch("/api/workspace-auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Workspace logout failed:", err);
    } finally {
      navigate("/workspace/login", { replace: true });
    }
  }

  return (
    <nav className="csv-nps-workspace-nav" aria-label="NPS workspace navigation">
      <NavLink to="/workspace" end>
        Overview
      </NavLink>

      <NavLink to="/workspace/import">
        Import
      </NavLink>

      <NavLink to="/workspace/datasets">
        Datasets
      </NavLink>

      <NavLink
        to={datasetBasePath ? `${datasetBasePath}/performance` : "/workspace/datasets"}
      >
        Performance
      </NavLink>

      <NavLink
        to={datasetBasePath ? `${datasetBasePath}/responses` : "/workspace/datasets"}
      >
        Responses
      </NavLink>

      <NavLink
        to={
          datasetBasePath
            ? `${datasetBasePath}/closing-the-loop`
            : "/workspace/datasets"
        }
      >
        Close the loop
      </NavLink>
      <NavLink to="/workspace/account">
        Account
      </NavLink>

      <button
        type="button"
        className="csv-nps-workspace-nav-button"
        onClick={handleWorkspaceLogout}
      >
        Sign out
      </button>
    </nav>
  );
}
