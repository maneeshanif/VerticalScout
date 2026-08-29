const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("vertical_access_token");
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    // If token expired, try refresh or redirect to login
    const refreshToken = localStorage.getItem("vertical_refresh_token");
    if (refreshToken && endpoint !== "/auth/refresh") {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("vertical_access_token", data.access_token);
          localStorage.setItem("vertical_refresh_token", data.refresh_token);
          headers.set("Authorization", `Bearer ${data.access_token}`);
          return fetch(`${API_URL}${endpoint}`, { ...options, headers });
        }
      } catch (e) {
        console.error("Token refresh failed", e);
      }
    }
  }

  return res;
}
