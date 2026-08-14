import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../hooks/useCart";
import { supabase } from "../lib/supabaseClient";

const NAV_LINKS = [
  { label: "Flash Deals", href: "/collection/flash-deals" },
  { label: "Dresses", href: "/category/dresses" },
  { label: "Shoes", href: "/category/shoes" },
  { label: "Bags", href: "/category/bags" },
  { label: "Accessories", href: "/category/accessories" },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="leading-tight">
          <span className="font-display text-2xl font-black tracking-tight">
            <span className="text-pink">PERZN</span>
          </span>
          <span className="block font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">
            Drape Fashion
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `font-body text-xs font-bold uppercase tracking-wide transition-colors ${
                  isActive ? "text-pink" : "text-ink/70 hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account"
              className="flex items-center gap-1.5 text-ink/80 hover:text-ink"
            >
              <UserIcon />
              {email && (
                <span className="hidden font-body text-xs font-semibold sm:inline">
                  {email.split("@")[0]}
                </span>
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white p-2 shadow-lg">
                {email ? (
                  <>
                    <p className="truncate px-3 py-1.5 font-body text-xs text-ink/50">{email}</p>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-md px-3 py-2 font-body text-sm text-ink hover:bg-sand"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md px-3 py-2 text-left font-body text-sm text-pink hover:bg-sand"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 font-body text-sm font-semibold text-ink hover:bg-sand"
                  >
                    Log in
                  </Link>
                )}
              </div>
            )}
          </div>
          <Link to="/cart" aria-label="Cart" className="relative text-ink/80 hover:text-ink">
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink font-mono text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile category scroller */}
      <div className="flex gap-4 overflow-x-auto border-t border-ink/10 px-4 py-2 md:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              `shrink-0 font-body text-xs font-semibold ${
                isActive ? "text-pink" : "text-ink/60"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1.5" />
      <circle cx="18" cy="21" r="1.5" />
      <path d="M2.5 3h2l2.3 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H5.5" />
    </svg>
  );
}

