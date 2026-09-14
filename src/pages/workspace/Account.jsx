// src/pages/workspace/Account.jsx
import React, { useEffect, useState } from "react";
import CsvNpsWorkspaceNav from "../../components/CsvNpsWorkspaceNav";
import { useLanguage } from "../../i18n/LanguageContext";
import { localizePath } from "../../i18n/pathHelpers";
import {
  formatWorkspaceRole,
  getWorkspaceRoleDescription,
} from "../../../utils/workspaceRoles";

export default function WorkspaceAccount() {
  const { lang } = useLanguage();
  const tr = (en, fr) => (lang === "fr" ? fr : en);
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
          throw new Error(tr("Unexpected response while loading account details.", "Réponse inattendue lors du chargement du compte."));
        }

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || tr("Failed to load account details", "Impossible de charger les informations du compte"));
        }

        setMe(data);
      } catch (err) {
        console.error("Failed to load workspace account:", err);
        setMeError(err.message || tr("Failed to load account details", "Impossible de charger les informations du compte"));
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
      setPasswordError(tr("Please complete all password fields.", "Veuillez remplir tous les champs de mot de passe."));
      return;
    }

    if (newPassword.length < 12) {
      setPasswordError(tr("New password must be at least 12 characters.", "Le nouveau mot de passe doit contenir au moins 12 caractères."));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError(tr("The new passwords do not match.", "Les nouveaux mots de passe ne correspondent pas."));
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(tr("New password must be different from the current password.", "Le nouveau mot de passe doit être différent de l’actuel."));
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
        throw new Error(tr("Unexpected response while changing password.", "Réponse inattendue lors du changement de mot de passe."));
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || tr("Failed to change password", "Impossible de modifier le mot de passe"));
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMessage(tr("Password changed successfully.", "Mot de passe modifié."));
    } catch (err) {
      console.error("Failed to change workspace password:", err);
      setPasswordError(err.message || tr("Failed to change password", "Impossible de modifier le mot de passe"));
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
      window.location.href = localizePath("/workspace/login", lang);
    }
  }

  const role = me?.workspace?.role;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>{tr("Account", "Compte")}</h1>
        <p>{tr("Manage your workspace login, password and account access.", "Gérez votre connexion, votre mot de passe et l’accès à votre espace de travail.")}</p>
      </section>

      <CsvNpsWorkspaceNav />

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>{tr("Workspace account", "Compte de l’espace de travail")}</h2>
            <p>{tr("View your signed-in account and change your password securely.", "Consultez votre compte et modifiez votre mot de passe en toute sécurité.")}</p>
          </div>

          <button
            type="button"
            className="csv-nps-danger-button"
            onClick={handleWorkspaceLogout}
          >
            {tr("Sign out", "Se déconnecter")}
          </button>
        </div>

        {loadingMe ? (
          <div className="csv-nps-empty-state">{tr("Loading account details...", "Chargement du compte...")}</div>
        ) : meError ? (
          <div className="csv-nps-error">{meError}</div>
        ) : (
          <div className="workspace-account-grid">
            <section className="csv-nps-chart-card">
              <h3>{tr("Your details", "Vos informations")}</h3>

              <div className="workspace-account-detail-list">
                <AccountDetail label={tr("Name", "Nom")} value={me?.user?.fullName || "—"} />
                <AccountDetail label={tr("Email", "E-mail")} value={me?.user?.email || "—"} />

                <AccountDetail
                  label={tr("Workspace ID", "Identifiant de l’espace")}
                  value={me?.workspace?.id || "—"}
                />

                <AccountDetail
                  label={tr("Role", "Rôle")}
                  value={formatWorkspaceRole(role)}
                />

                <AccountDetail
                  label={tr("Role permissions", "Autorisations du rôle")}
                  value={getWorkspaceRoleDescription(role)}
                />
              </div>
            </section>

            <section className="csv-nps-chart-card">
              <h3>{tr("Change password", "Modifier le mot de passe")}</h3>
              <p>
                {tr("Use this after receiving a temporary password, or whenever you want to update your workspace login.", "Utilisez ce formulaire après avoir reçu un mot de passe temporaire, ou pour mettre à jour votre accès.")}
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
                  <span>{tr("Current password", "Mot de passe actuel")}</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    autoComplete="current-password"
                    disabled={saving}
                  />
                </label>

                <label className="csv-nps-filter-field">
                  <span>{tr("New password", "Nouveau mot de passe")}</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </label>

                <label className="csv-nps-filter-field">
                  <span>{tr("Confirm new password", "Confirmer le nouveau mot de passe")}</span>
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
                    {saving
                      ? tr("Changing password...", "Modification...")
                      : tr("Change password", "Modifier le mot de passe")}
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
