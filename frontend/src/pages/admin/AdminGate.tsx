import { useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { api } from "../../lib/api";

type Status = "checking" | "ok" | "denied";

export default function AdminGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStatus("denied");
        return;
      }
      try {
        await api.get("/admin/categories"); // any admin-only endpoint verifies the role server-side
        setStatus("ok");
      } catch {
        setStatus("denied");
      }
    };
    check();
  }, []);

  if (status === "checking") {
    return <div className="px-4 py-16 text-center text-muted">Checking access...</div>;
  }

  if (status === "denied") {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="mb-2 font-display text-xl font-bold text-ink">Admin access required</h1>
        <p className="mb-6 font-body text-sm text-muted">
          Sign in with an admin account to continue.
        </p>
        <Link to="/admin/login" className="inline-block rounded-full bg-ink px-6 py-2.5 font-body text-sm font-bold text-white">
          Go to admin sign in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
