import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function CsvNpsWorkspaceNav() {
  const { datasetId } = useParams();
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (path, fallback) => translations(lang, path, fallback);
  const lp = (path) => localizePath(path, lang);

  const [hasActiveIntercomSource, setHasActiveIntercomSource] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadActiveSource() {
      try {
        const res = await fetch("/api/workspace-intercom/sources/active", {
          credentials: "include",
        });

        if (!res.ok) {
          if (!cancelled) setHasActiveIntercomSource(false);
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          setHasActiveIntercomSource(Boolean(data?.ok && data?.source));
        }
      } catch (_err) {
        if (!cancelled) setHasActiveIntercomSource(false);
      }
    }

    loadActiveSource();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const datasetBasePath = datasetId ? lp(`/workspace/datasets/${datasetId}`) : "";
  const sourceId = new URLSearchParams(location.search).get("source") || "";
  const withSource = (path) =>
    sourceId ? `${path}?source=${encodeURIComponent(sourceId)}` : path;

  const links = useMemo(() => {
    if (datasetBasePath) {
      return {
        performance: `${datasetBasePath}/performance`,
        responses: `${datasetBasePath}/responses`,
        invitations: `${datasetBasePath}/invitations`,
        closing: `${datasetBasePath}/closing-the-loop`,
      };
    }

    if (hasActiveIntercomSource) {
      return {
        performance: withSource(lp("/workspace/performance")),
        responses: withSource(lp("/workspace/responses")),
        invitations: withSource(lp("/workspace/invitations")),
        closing: withSource(lp("/workspace/closing-the-loop")),
      };
    }

    return {
      performance: lp("/workspace/datasets"),
      responses: lp("/workspace/datasets"),
      invitations: lp("/workspace/datasets"),
      closing: lp("/workspace/datasets"),
    };
  }, [datasetBasePath, hasActiveIntercomSource, lang, sourceId]);

  return (
    <nav className="csv-nps-workspace-nav" aria-label={tr("workspaceNav.ariaLabel", "NPS workspace navigation")}>
      <NavLink to={lp("/workspace")} end>
        {tr("workspaceNav.overview", "Overview")}
      </NavLink>

      <NavLink to={lp("/workspace/import")}>
        {tr("workspaceNav.import", "Import")}
      </NavLink>

      <NavLink to={lp("/workspace/datasets")}>
        {tr("workspaceNav.datasets", "Datasets")}
      </NavLink>

      <NavLink to={links.performance}>
        {tr("workspaceNav.performance", "Performance")}
      </NavLink>

      <NavLink to={links.responses}>
        {tr("workspaceNav.responses", "Responses")}
      </NavLink>

      <NavLink to={links.invitations}>
        {tr("workspaceNav.invitations", "Invitations")}
      </NavLink>

      <NavLink to={links.closing}>
        {tr("workspaceNav.closing", "Close the loop")}
      </NavLink>

      <NavLink to={lp("/workspace/journey")}>
        {tr("workspaceNav.journey", "Journey")}
      </NavLink>

      <NavLink to={lp("/workspace/account")}>
        {tr("workspaceNav.account", "Account")}
      </NavLink>

    </nav>
  );
}
