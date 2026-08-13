import { useState, ReactNode } from "react";
import { adminApi, setAdminKey, getAdminKey } from "../../lib/adminApi";

export default function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(!!getAdminKey());
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    setAdminKey(input);
    try {
      // any admin-protected GET works as a verification ping
      await adminApi.get("/admin/categories");
      setUnlocked(true);
    } catch {
      setAdminKey("");
      setError("Wrong key");
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xs px-4 py-24">
      <h1 className="mb-4 font-display text-xl font-bold text-ink">Admin access</h1>
      <form onSubmit={handleUnlock} className="space-y-3">
        <input
          type="password"
          placeholder="Admin key"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
          autoFocus
        />
        {error && <p className="font-body text-sm text-pink">{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full rounded-full bg-ink py-3 font-body text-sm font-bold text-sand disabled:opacity-50"
        >
          {checking ? "Checking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
