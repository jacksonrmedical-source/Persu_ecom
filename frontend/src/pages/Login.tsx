import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupMsg, setSignupMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignupMsg(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else navigate("/");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else if (data.session) {
        navigate("/");
      } else {
        setSignupMsg("Account created — check your email to confirm before signing in.");
        setMode("signin");
      }
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 font-display text-2xl font-bold text-ink">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <p className="mb-6 font-body text-sm text-muted">
        {mode === "signin" ? "Enter your email and password." : "Set a password to sign up."}
      </p>

      {signupMsg && (
        <p className="mb-4 rounded-card bg-panel p-3 font-body text-sm text-ink">{signupMsg}</p>
      )}

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
          minLength={6}
          placeholder="Password (min 6 characters)"
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
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setSignupMsg(null);
          }}
          className="w-full font-body text-xs text-muted underline"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
