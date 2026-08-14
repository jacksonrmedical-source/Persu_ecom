import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, setAdminKey } from "../../lib/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setChecking(true);
    setAdminKey(key);
    try {
      await adminApi.get("/admin/categories");
      navigate("/admin/orders");
    } catch {
      setAdminKey("");
      setError("Wrong admin key");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-6 flex items-center gap-2 text-ink">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        </svg>
        <span className="font-body text-xs font-bold uppercase tracking-wide text-muted">
          Store Admin
        </span>
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-ink">Admin access</h1>
      <p className="mb-6 font-body text-sm text-muted">
        Enter the shared admin key to manage products and orders.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          placeholder="Admin key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2.5 font-body text-sm"
          autoFocus
        />
        {error && <p className="font-body text-sm text-pink">{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full rounded-full bg-ink py-3 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          {checking ? "Checking..." : "Unlock admin"}
        </button>
      </form>
    </div>
  );
}
