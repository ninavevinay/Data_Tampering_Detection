const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? payload?.message ?? "Request failed");
  }

  return payload;
}

export function fetchRecords(token) {
  return request("/api/records", { token });
}

export function createRecord(token, body) {
  return request("/api/records", { method: "POST", token, body });
}

export function verifyRecord(token, body) {
  return request("/api/records/verify", { method: "POST", token, body });
}

export function fetchProfile(token) {
  return request("/api/auth/me", { token });
}
