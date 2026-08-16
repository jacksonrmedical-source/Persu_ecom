import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { api } from "../../lib/api";

// Real admin login: same Supabase email/password auth as customers.
// Access is granted purely by profiles.role = 'admin' in the database,
// verified server-side on every request — not by knowing a shared secret.
export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    try {
      // any admin-only endpoint works as a role verification ping
      await api.get("/admin/categories");
      navigate("/admin");
    } catch {
      await supabase.auth.signOut();
      setError("This account doesn't have admin access.");
    } finally {
      setLoading(false);
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
      <h1 className="mb-2 font-display text-2xl font-bold text-ink">Admin sign in</h1>
      <p className="mb-6 font-body text-sm text-muted">
        Sign in with your admin account email and password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2.5 font-body text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2.5 font-body text-sm"
        />
        {error && <p className="font-body text-sm text-pink">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink py-3 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
