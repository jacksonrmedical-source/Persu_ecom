import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { adminApi, setAdminKey } from "../lib/adminApi";

type Tab = "customer" | "admin";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("customer");

  // customer (email + password) state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [custError, setCustError] = useState<string | null>(null);
  const [custLoading, setCustLoading] = useState(false);
  const [signupMsg, setSignupMsg] = useState<string | null>(null);

  // admin (shared key) state
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustError(null);
    setSignupMsg(null);
    setCustLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setCustLoading(false);
      if (error) setCustError(error.message);
      else navigate("/");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setCustLoading(false);
      if (error) {
        setCustError(error.message);
      } else if (data.session) {
        // email confirmation is off in this Supabase project — signed in immediately
        navigate("/");
      } else {
        // email confirmation is on — Supabase sent a verification link
        setSignupMsg("Account created — check your email to confirm before signing in.");
        setMode("signin");
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setCheckingAdmin(true);
    setAdminKey(adminKeyInput);
    try {
      await adminApi.get("/admin/categories");
      navigate("/admin/products/new");
    } catch {
      setAdminKey("");
      setAdminError("Wrong admin key");
    } finally {
      setCheckingAdmin(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      {/* Clickable icon toggle between customer / admin login */}
      <div className="mb-8 flex justify-center gap-3">
        <button
          onClick={() => setTab("customer")}
          aria-pressed={tab === "customer"}
          aria-label="Customer login"
          className={`flex flex-col items-center gap-1.5 rounded-2xl px-6 py-3 transition-colors ${
            tab === "customer" ? "bg-ink text-sand" : "bg-white text-ink/50"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
          <span className="font-body text-xs font-semibold">Customer</span>
        </button>
        <button
          onClick={() => setTab("admin")}
          aria-pressed={tab === "admin"}
          aria-label="Admin login"
          className={`flex flex-col items-center gap-1.5 rounded-2xl px-6 py-3 transition-colors ${
            tab === "admin" ? "bg-ink text-sand" : "bg-white text-ink/50"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          </svg>
          <span className="font-body text-xs font-semibold">Admin</span>
        </button>
      </div>

      {tab === "customer" ? (
        <>
          <h1 className="mb-2 font-display text-2xl font-bold text-ink">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="mb-6 font-body text-sm text-ink/60">
            {mode === "signin" ? "Enter your email and password." : "Set a password to sign up."}
          </p>

          {signupMsg && (
            <p className="mb-4 rounded-card bg-white p-3 font-body text-sm text-ink">{signupMsg}</p>
          )}

          <form onSubmit={handleCustomerSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
            />
            {custError && <p className="font-body text-sm text-pink">{custError}</p>}
            <button
              type="submit"
              disabled={custLoading}
              className="w-full rounded-full btn-gradient py-3 font-body text-sm font-bold text-white disabled:opacity-50"
            >
              {custLoading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setCustError(null);
                setSignupMsg(null);
              }}
              className="w-full font-body text-xs text-ink/50 underline"
            >
              {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="mb-2 font-display text-2xl font-bold text-ink">Admin access</h1>
          <p className="mb-6 font-body text-sm text-ink/60">
            Enter the shared admin key to manage products.
          </p>
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Admin key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
              autoFocus
            />
            {adminError && <p className="font-body text-sm text-pink">{adminError}</p>}
            <button
              type="submit"
              disabled={checkingAdmin}
              className="w-full rounded-full bg-ink py-3 font-body text-sm font-bold text-sand disabled:opacity-50"
            >
              {checkingAdmin ? "Checking..." : "Unlock admin"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

