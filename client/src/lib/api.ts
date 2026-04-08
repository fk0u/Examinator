<<<<<<< Updated upstream
// ─── API Client ─────────────────────────────────────────
// Central API client for communicating with Elysia backend

const API_BASE = "http://localhost:5000/api";

/** Get stored auth token */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("examinator_token");
}

/** Set auth token */
export function setToken(token: string) {
  localStorage.setItem("examinator_token", token);
}

/** Clear auth token */
export function clearToken() {
  localStorage.removeItem("examinator_token");
}

/** Get stored user data */
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("examinator_user");
  return data ? JSON.parse(data) : null;
}

/** Store user data */
export function setStoredUser(user: any) {
  localStorage.setItem("examinator_user", JSON.stringify(user));
}

/** Generic fetch wrapper with auth */
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Auth API ───────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: any) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiFetch("/auth/me"),
};

// ─── Exams API ──────────────────────────────────────────
export const examsApi = {
  list: () => apiFetch("/exams"),
  get: (id: string) => apiFetch(`/exams/${id}`),
  create: (data: any) =>
    apiFetch("/exams", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/exams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/exams/${id}`, { method: "DELETE" }),
};

// ─── Questions API ──────────────────────────────────────
export const questionsApi = {
  list: (examId: string) => apiFetch(`/exams/${examId}/questions`),
  create: (examId: string, data: any) =>
    apiFetch(`/exams/${examId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (examId: string, questionId: string, data: any) =>
    apiFetch(`/exams/${examId}/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (examId: string, questionId: string) =>
    apiFetch(`/exams/${examId}/questions/${questionId}`, { method: "DELETE" }),
};

// ─── Users API ──────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch(`/users${query}`);
  },
  get: (id: string) => apiFetch(`/users/${id}`),
  create: (data: any) =>
    apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
};

// ─── Attempts API ───────────────────────────────────────
export const attemptsApi = {
  start: (examId: string, cameraEnabled: boolean = false, accessToken?: string) =>
    apiFetch("/attempts/start", {
      method: "POST",
      body: JSON.stringify({ examId, cameraEnabled, accessToken }),
    }),
  answer: (attemptId: string, data: any) =>
    apiFetch(`/attempts/${attemptId}/answer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submit: (attemptId: string) =>
    apiFetch(`/attempts/${attemptId}/submit`, { method: "POST" }),
  my: () => apiFetch("/attempts/my"),
  forced: (params?: { limit?: number; examId?: string; from?: string; to?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.examId) query.set("examId", params.examId);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch(`/attempts/forced${suffix}`);
  },
  byExam: (examId: string) => apiFetch(`/attempts/exam/${examId}`),
};

// ─── Cheat Logs API ─────────────────────────────────────
export const cheatLogsApi = {
  log: (data: any) =>
    apiFetch("/cheat-logs", { method: "POST", body: JSON.stringify(data) }),
  capture: (formData: FormData) =>
    apiFetch("/cheat-logs/capture", { method: "POST", body: formData }),
  byAttempt: (attemptId: string) =>
    apiFetch(`/cheat-logs/attempt/${attemptId}`),
  stats: (examId?: string) => {
    const query = examId ? `?examId=${examId}` : "";
    return apiFetch(`/cheat-logs/stats${query}`);
  },
};
=======
// ─── API Client ─────────────────────────────────────────
// Central API client for communicating with Elysia backend

const API_BASE = "http://localhost:5000/api";

/** Get stored auth token */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("examinator_token");
}

/** Set auth token */
export function setToken(token: string) {
  localStorage.setItem("examinator_token", token);
}

/** Clear auth token */
export function clearToken() {
  localStorage.removeItem("examinator_token");
}

/** Get stored user data */
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("examinator_user");
  return data ? JSON.parse(data) : null;
}

/** Store user data */
export function setStoredUser(user: any) {
  localStorage.setItem("examinator_user", JSON.stringify(user));
}

/** Generic fetch wrapper with auth */
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Auth API ───────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: any) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiFetch("/auth/me"),
};

// ─── Exams API ──────────────────────────────────────────
export const examsApi = {
  list: () => apiFetch("/exams"),
  get: (id: string) => apiFetch(`/exams/${id}`),
  create: (data: any) =>
    apiFetch("/exams", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/exams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/exams/${id}`, { method: "DELETE" }),
};

// ─── Questions API ──────────────────────────────────────
export const questionsApi = {
  list: (examId: string) => apiFetch(`/exams/${examId}/questions`),
  create: (examId: string, data: any) =>
    apiFetch(`/exams/${examId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (examId: string, questionId: string, data: any) =>
    apiFetch(`/exams/${examId}/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (examId: string, questionId: string) =>
    apiFetch(`/exams/${examId}/questions/${questionId}`, { method: "DELETE" }),
};

// ─── Users API ──────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch(`/users${query}`);
  },
  get: (id: string) => apiFetch(`/users/${id}`),
  create: (data: any) =>
    apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
};

// ─── Attempts API ───────────────────────────────────────
export const attemptsApi = {
  start: (examId: string, cameraEnabled: boolean = false) =>
    apiFetch("/attempts/start", {
      method: "POST",
      body: JSON.stringify({ examId, cameraEnabled }),
    }),
  answer: (attemptId: string, data: any) =>
    apiFetch(`/attempts/${attemptId}/answer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submit: (attemptId: string) =>
    apiFetch(`/attempts/${attemptId}/submit`, { method: "POST" }),
  my: () => apiFetch("/attempts/my"),
  byExam: (examId: string) => apiFetch(`/attempts/exam/${examId}`),
};

// ─── Cheat Logs API ─────────────────────────────────────
export const cheatLogsApi = {
  log: (data: any) =>
    apiFetch("/cheat-logs", { method: "POST", body: JSON.stringify(data) }),
  capture: (formData: FormData) =>
    apiFetch("/cheat-logs/capture", { method: "POST", body: formData }),
  byAttempt: (attemptId: string) =>
    apiFetch(`/cheat-logs/attempt/${attemptId}`),
  stats: (examId?: string) => {
    const query = examId ? `?examId=${examId}` : "";
    return apiFetch(`/cheat-logs/stats${query}`);
  },
};
>>>>>>> Stashed changes
