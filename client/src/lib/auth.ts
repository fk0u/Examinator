// ─── Auth Helpers ───────────────────────────────────────

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("examinator_token");
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("examinator_user");
  if (!user) return null;
  try {
    return JSON.parse(user).role;
  } catch {
    return null;
  }
}

export function getUserData(): any | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("examinator_user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("examinator_token");
  localStorage.removeItem("examinator_user");
  window.location.href = "/";
}

/** Get role-based redirect path */
export function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/";
    case "OPERATOR":
      return "/proctor/";
    case "STUDENT":
      return "/student/";
    default:
      return "/";
  }
}
