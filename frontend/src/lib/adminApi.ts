// Admin routes now use the same Supabase-JWT auth as customer routes —
// access is controlled by profiles.role='admin' on the backend/database,
// not a shared secret. This file is kept as an alias so existing
// `adminApi.get(...)` calls across the admin pages don't need touching.
export { api as adminApi } from "./api";
