import axios from "axios";

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
});

// The admin key is kept in memory only (sessionStorage), never in env files
// or committed anywhere — it's typed in each browser session.
export function setAdminKey(key: string) {
  sessionStorage.setItem("perzn_admin_key", key);
}

export function getAdminKey(): string | null {
  return sessionStorage.getItem("perzn_admin_key");
}

adminApi.interceptors.request.use((config) => {
  const key = getAdminKey();
  if (key) config.headers["X-Admin-Key"] = key;
  return config;
});
