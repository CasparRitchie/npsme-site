// src/components/WorkspaceDatasetHeader.jsx
import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function WorkspaceDatasetHeader({ dataset }) {
  const { lang } = useLanguage();
  const tr = (path, fallback) => translations(lang, path, fallback);
  const lp = (path) => localizePath(path, lang);
  if (!dataset?.id) return null;

  const datasetName = dataset.datasetName || dataset.dataset_name || "Dataset";
  const datasetBasePath = lp(`/workspace/datasets/${dataset.id}`);

  return (
    <section className="csv-nps-dataset-context">
      <div className="csv-nps-dataset-context-top">
        <div>
          <p className="csv-nps-breadcrumb">
            <Link to={lp("/workspace")}>{tr("routes.workspace", "Workspace")}</Link>
            <span>/</span>
            <Link to={lp("/workspace/datasets")}>{tr("workspaceNav.datasets", "Datasets")}</Link>
            <span>/</span>
            <strong>{datasetName}</strong>
          </p>

          <h2>{datasetName}</h2>

          <p>
            {tr("workspaceDatasetHeader.help", "Use the tabs below to move between performance, responses and follow-up actions.")}
          </p>
        </div>
      </div>

      <nav
        className="csv-nps-dataset-tabs"
        aria-label={tr("workspaceDatasetHeader.ariaLabel", "Dataset navigation")}
      >
        <NavLink to={`${datasetBasePath}/performance`}>
          {tr("workspaceNav.performance", "Performance")}
        </NavLink>

        <NavLink to={`${datasetBasePath}/responses`}>
          {tr("workspaceNav.responses", "Responses")}
        </NavLink>

        <NavLink to={`${datasetBasePath}/closing-the-loop`}>
          {tr("workspaceNav.closing", "Close the loop")}
        </NavLink>
      </nav>
    </section>
  );
}
