import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAllProducts } from "../lib/allProductsContext";
import { supabase } from "../lib/supabaseClient";
import MegaMenu from "./MegaMenu";

const SECONDARY_LINKS = [
  { label: "Flash Deals", href: "/collection/flash-deals" },
  { label: "Dresses", href: "/category/dresses" },
  { label: "Shoes", href: "/category/shoes" },
  { label: "Bags", href: "/category/bags" },
  { label: "Accessories", href: "/category/accessories" },
];

// Top nav is customer-only by design — admin access lives in the footer instead.
export default function StickyTopNav() {
  const { itemCount } = useCart();
  const { products } = useAllProducts();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const results =
    query.trim().length > 1
      ? products
          .filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()))
          .slice(0, 8)
      : [];

  const goToProduct = (slug: string) => {
    setQuery("");
    setSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-amber px-4" style={{ minHeight: 64 }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="hidden shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 font-body text-xs font-semibold text-ink hover:bg-white/80 md:flex"
          >
            <MenuIcon /> All Categories
          </button>

          <Link to="/" className="shrink-0 leading-tight">
            <span className="font-display text-2xl font-black tracking-tight text-ink">
              PERZN
            </span>
          </Link>

          <div ref={searchRef} className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for products, brands and more"
              className="w-full rounded-full border-none bg-white px-4 py-2.5 font-body text-sm text-ink outline-none focus:ring-2 focus:ring-ink/30"
            />
            {searchOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-xl bg-white p-2 shadow-xl">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => goToProduct(p.slug)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-panel"
                  >
                    <img
                      src={p.product_images?.[0]?.url || "https://placehold.co/60x80"}
                      alt=""
                      className="h-12 w-9 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-body text-sm text-ink">{p.title}</p>
                      <p className="font-body text-xs text-muted">₹{p.sale_price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="font-body text-sm font-semibold text-ink"
              >
                {email ? email.split("@")[0] : "Sign In"}
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white p-2 shadow-lg">
                  {email ? (
                    <>
                      <p className="truncate px-3 py-1.5 font-body text-xs text-muted">{email}</p>
                      <Link
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-md px-3 py-2 font-body text-sm text-ink hover:bg-panel"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-md px-3 py-2 text-left font-body text-sm text-pink hover:bg-panel"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-md px-3 py-2 font-body text-sm font-semibold text-ink hover:bg-panel"
                    >
                      Log in
                    </Link>
                  )}
                </div>
              )}
            </div>
            <Link to="/cart" aria-label="Cart" className="relative text-ink">
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink font-body text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* secondary category strip */}
      <div className="flex gap-5 overflow-x-auto border-b border-border bg-white px-4 py-2.5">
        {SECONDARY_LINKS.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              `shrink-0 font-body text-xs font-bold uppercase tracking-wide ${
                isActive ? "text-pink" : "text-ink/70 hover:text-ink"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {menuOpen && <MegaMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
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
