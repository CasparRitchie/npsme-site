// src/pages/workspace/Account.jsx
import React, { useEffect, useState } from "react";
import CsvNpsWorkspaceNav from "../../components/CsvNpsWorkspaceNav";
import {
  formatWorkspaceRole,
  getWorkspaceRoleDescription,
} from "../../../utils/workspaceRoles";

export default function WorkspaceAccount() {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [meError, setMeError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadMe() {
      setLoadingMe(true);
      setMeError("");

      try {
        const res = await fetch("/api/workspace-auth/me", {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Expected JSON from workspace auth me:", text.slice(0, 500));
          throw new Error("Unexpected response while loading account details.");
        }

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load account details");
        }

        setMe(data);
      } catch (err) {
        console.error("Failed to load workspace account:", err);
        setMeError(err.message || "Failed to load account details");
      } finally {
        setLoadingMe(false);
      }
    }

    loadMe();
  }, []);

  async function handleChangePassword(event) {
    event.preventDefault();

    setSuccessMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 12) {
      setPasswordError("New password must be at least 12 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from the current password.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/workspace-auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error(
          "Expected JSON from change-password endpoint:",
          text.slice(0, 500)
        );
        throw new Error("Unexpected response while changing password.");
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMessage("Password changed successfully.");
    } catch (err) {
      console.error("Failed to change workspace password:", err);
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  async function handleWorkspaceLogout() {
    try {
      await fetch("/api/workspace-auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Workspace logout failed:", err);
    } finally {
      window.location.href = "/workspace/login";
    }
  }

  const role = me?.workspace?.role;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>Account</h1>
        <p>Manage your workspace login, password and account access.</p>
      </section>

      <CsvNpsWorkspaceNav />

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Workspace account</h2>
            <p>View your signed-in account and change your password securely.</p>
          </div>

          <button
            type="button"
            className="csv-nps-danger-button"
            onClick={handleWorkspaceLogout}
          >
            Sign out
          </button>
        </div>

        {loadingMe ? (
          <div className="csv-nps-empty-state">Loading account details...</div>
        ) : meError ? (
          <div className="csv-nps-error">{meError}</div>
        ) : (
          <div className="workspace-account-grid">
            <section className="csv-nps-chart-card">
              <h3>Your details</h3>

              <div className="workspace-account-detail-list">
                <AccountDetail label="Name" value={me?.user?.fullName || "—"} />
                <AccountDetail label="Email" value={me?.user?.email || "—"} />

                <AccountDetail
                  label="Workspace ID"
                  value={me?.workspace?.id || "—"}
                />

                <AccountDetail
                  label="Role"
                  value={formatWorkspaceRole(role)}
                />

                <AccountDetail
                  label="Role permissions"
                  value={getWorkspaceRoleDescription(role)}
                />
              </div>
            </section>

            <section className="csv-nps-chart-card">
              <h3>Change password</h3>
              <p>
                Use this after receiving a temporary password, or whenever you
                want to update your workspace login.
              </p>

              <form
                className="workspace-account-password-form"
                onSubmit={handleChangePassword}
              >
                {successMessage && (
                  <div className="csv-nps-success">{successMessage}</div>
                )}

                {passwordError && (
                  <div className="csv-nps-error csv-nps-error-compact">
                    {passwordError}
                  </div>
                )}

                <label className="csv-nps-filter-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    autoComplete="current-password"
                    disabled={saving}
                  />
                </label>

                <label className="csv-nps-filter-field">
                  <span>New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </label>

                <label className="csv-nps-filter-field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) =>
                      setConfirmNewPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </label>

                <div className="csv-nps-actions">
                  <button
                    type="submit"
                    className="csv-nps-button"
                    disabled={
                      saving ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmNewPassword
                    }
                  >
                    {saving ? "Changing password..." : "Change password"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function AccountDetail({ label, value }) {
  return (
    <div className="workspace-account-detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
