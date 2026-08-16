import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const TABS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Add Product", href: "/admin/products/new" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div>
      <div className="border-b border-border bg-white px-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <nav className="flex gap-6">
            {TABS.map((tab) => (
              <NavLink
                key={tab.href}
                to={tab.href}
                end={tab.href === "/admin"}
                className={({ isActive }) =>
                  `border-b-2 py-3 font-body text-sm font-semibold ${
                    isActive ? "border-pink text-pink" : "border-transparent text-muted hover:text-ink"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={handleLogout} className="font-body text-xs font-semibold text-muted hover:text-pink">
            Log out
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
