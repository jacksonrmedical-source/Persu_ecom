import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Mode = "signin" | "signup" | "forgot";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupMsg, setSignupMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

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
    } else if (mode === "signup") {
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
    } else {
      // forgot password
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) setError(error.message);
      else setResetSent(true);
    }
  };

  const heading =
    mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password";
  const subtitle =
    mode === "signin"
      ? "Enter your email and password."
      : mode === "signup"
      ? "Set a password to sign up."
      : "We'll email you a link to set a new password.";

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 font-display text-2xl font-bold text-ink">{heading}</h1>
      <p className="mb-6 font-body text-sm text-muted">{subtitle}</p>

      {signupMsg && (
        <p className="mb-4 rounded-card bg-panel p-3 font-body text-sm text-ink">{signupMsg}</p>
      )}

      {mode === "forgot" && resetSent ? (
        <div>
          <p className="rounded-card bg-panel p-3 font-body text-sm text-ink">
            Check your inbox for the password reset link.
          </p>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setResetSent(false);
            }}
            className="mt-4 w-full font-body text-xs text-muted underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2.5 font-body text-sm"
          />
          {mode !== "forgot" && (
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2.5 font-body text-sm"
            />
          )}
          {error && <p className="font-body text-sm text-pink">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full btn-gradient py-3 font-body text-sm font-bold text-white disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign in"
              : mode === "signup"
              ? "Create account"
              : "Send reset link"}
          </button>

          {mode === "signin" && (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError(null);
              }}
              className="w-full font-body text-xs text-muted underline"
            >
              Forgot password?
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
              setSignupMsg(null);
            }}
            className="w-full font-body text-xs text-muted underline"
          >
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </form>
      )}
    </div>
  );
}
