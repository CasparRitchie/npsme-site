import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";

export default function CsvNpsWorkspaceNav() {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  const datasetBasePath = datasetId ? `/workspace/datasets/${datasetId}` : "";

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
        performance: "/workspace/performance",
        responses: "/workspace/responses",
        invitations: "/workspace/invitations",
        closing: "/workspace/closing-the-loop",
      };
    }

    return {
      performance: "/workspace/datasets",
      responses: "/workspace/datasets",
      invitations: "/workspace/datasets",
      closing: "/workspace/datasets",
    };
  }, [datasetBasePath, hasActiveIntercomSource]);

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

      <NavLink to={links.performance}>
        Performance
      </NavLink>

      <NavLink to={links.responses}>
        Responses
      </NavLink>

      <NavLink to={links.invitations}>
        Invitations
      </NavLink>

      <NavLink to={links.closing}>
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
