// src/components/WorkspaceDatasetHeader.jsx
import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function WorkspaceDatasetHeader({ dataset }) {
  if (!dataset?.id) return null;

  const datasetName = dataset.datasetName || dataset.dataset_name || "Dataset";
  const datasetBasePath = `/workspace/datasets/${dataset.id}`;

  return (
    <section className="csv-nps-dataset-context">
      <div className="csv-nps-dataset-context-top">
        <div>
          <p className="csv-nps-breadcrumb">
            <Link to="/workspace">Workspace</Link>
            <span>/</span>
            <Link to="/workspace/datasets">Datasets</Link>
            <span>/</span>
            <strong>{datasetName}</strong>
          </p>

          <h2>{datasetName}</h2>

          <p>
            Use the tabs below to move between performance, responses and follow-up actions.
          </p>
        </div>
      </div>

      <nav
        className="csv-nps-dataset-tabs"
        aria-label="Dataset navigation"
      >
        <NavLink to={`${datasetBasePath}/performance`}>
          Performance
        </NavLink>

        <NavLink to={`${datasetBasePath}/responses`}>
          Responses
        </NavLink>

        <NavLink to={`${datasetBasePath}/closing-the-loop`}>
          Close the loop
        </NavLink>
      </nav>
    </section>
  );
}
