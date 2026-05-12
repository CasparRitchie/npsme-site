// utils/workspaceRoles.js

export function formatWorkspaceRole(role) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "member") return "Member";
  return "Member";
}

export function canManageWorkspace(role) {
  return role === "owner" || role === "admin";
}

export function canDeleteDatasets(role) {
  return role === "owner" || role === "admin";
}

export function canChangeOwnPassword(role) {
  return Boolean(role);
}

export function canGenerateInsights(role) {
  return role === "owner" || role === "admin" || role === "member";
}

export function getWorkspaceRoleDescription(role) {
  if (role === "owner") {
    return "Full workspace access, including account, data and user-management actions.";
  }

  if (role === "admin") {
    return "Can manage workspace data and day-to-day analysis workflows.";
  }

  if (role === "member") {
    return "Can view and work with assigned workspace feedback workflows.";
  }

  return "Standard workspace access.";
}
