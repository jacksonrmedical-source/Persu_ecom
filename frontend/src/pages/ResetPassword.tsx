import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <p className="mb-4 font-body text-sm text-ink">Password updated.</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-full btn-gradient px-6 py-2.5 font-body text-sm font-bold text-white"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 font-display text-2xl font-bold text-ink">Set a new password</h1>
      <p className="mb-6 font-body text-sm text-muted">
        You followed a reset link — choose a new password below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          required
          minLength={6}
          placeholder="New password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2.5 font-body text-sm"
        />
        {error && <p className="font-body text-sm text-pink">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full btn-gradient py-3 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
