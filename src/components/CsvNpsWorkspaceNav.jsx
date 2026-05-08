import React from "react";
import { NavLink, useParams } from "react-router-dom";

export default function CsvNpsWorkspaceNav() {
  const { datasetId } = useParams();

  const datasetBasePath = datasetId
    ? `/workspace/datasets/${datasetId}`
    : null;

  return (
    <nav className="csv-nps-workspace-nav" aria-label="NPS workspace navigation">
      <NavLink to="/workspace" end>
        Workspace
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
        Closing the loop
      </NavLink>
    </nav>
  );
}
