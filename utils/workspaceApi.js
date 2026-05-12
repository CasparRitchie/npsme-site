// src/utils/workspaceApi.js

export async function workspaceFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    console.error("Expected JSON from workspace API:", {
      path,
      status: res.status,
      contentType,
      preview: text.slice(0, 500),
    });

    if (res.status === 401) {
      redirectToWorkspaceLogin();
    }

    throw new Error("The server returned an unexpected response.");
  }

  if (res.status === 401) {
    redirectToWorkspaceLogin(data?.error);
    throw new Error(data?.error || "Workspace login required");
  }

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export function redirectToWorkspaceLogin(reason = "") {
  const currentPath =
    window.location.pathname + window.location.search + window.location.hash;

  const params = new URLSearchParams();

  if (currentPath && currentPath !== "/workspace/login") {
    params.set("next", currentPath);
  }

  if (reason) {
    params.set("reason", reason);
  }

  const query = params.toString();
  window.location.href = query
    ? `/workspace/login?${query}`
    : "/workspace/login";
}
