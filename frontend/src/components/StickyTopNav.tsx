import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAllProducts } from "../lib/allProductsContext";
import { supabase } from "../lib/supabaseClient";
import MegaMenu from "./MegaMenu";
import Logo from "./Logo";

const SECONDARY_LINKS = [
  { label: "Flash Deals", href: "/collection/flash-deals" },
  { label: "Dresses", href: "/category/dresses" },
  { label: "Shoes", href: "/category/shoes" },
  { label: "Bags", href: "/category/bags" },
  { label: "Accessories", href: "/category/accessories" },
];

// Top nav is customer-only by design — admin access lives in the footer instead.
export default function StickyTopNav() {
  const { itemCount, items } = useCart();
  const { products } = useAllProducts();
  const navigate = useNavigate();

  const cartTotal = items.reduce((sum, i) => sum + i.products.sale_price * i.quantity, 0);

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
      <div className="bg-pink px-4" style={{ minHeight: 72 }}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4">
          <Link to="/" className="shrink-0" aria-label="PERZN">
            <Logo textOnly textClassName="text-3xl" />
          </Link>

          {/* Delivery location — Walmart-style pill. Static placeholder for now;
              not wired to real geolocation or saved addresses yet. */}
          <button className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-left text-white hover:bg-white/10 lg:flex">
            <LocationIcon />
            <span className="leading-tight">
              <span className="block font-body text-[10px] text-white/70">Deliver to</span>
              <span className="block font-body text-xs font-semibold">Select location</span>
            </span>
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 font-body text-xs font-semibold text-white hover:opacity-90 md:flex"
          >
            <MenuIcon />
            All Categories
          </button>

          <div ref={searchRef} className="relative w-full max-w-md">
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

          <div className="ml-auto flex shrink-0 items-center gap-5">
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-1.5 text-white"
              >
                <AccountIcon />
                <span className="font-body text-xs font-semibold leading-tight text-left">
                  <span className="block text-[10px] text-white/70">
                    {email ? "Hi, " + email.split("@")[0] : "Sign In"}
                  </span>
                  <span className="block">Account</span>
                </span>
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
                      <Link
                        to="/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-md px-3 py-2 font-body text-sm text-ink hover:bg-panel"
                      >
                        My Wishlist
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

            <Link to="/cart" aria-label="Bag" className="relative flex items-center gap-1.5 text-white">
              <span className="relative">
                <BagIcon />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-body text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </span>
              <span className="hidden font-body text-sm font-bold sm:inline">₹{cartTotal.toFixed(0)}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* secondary category strip */}
      <div className="flex gap-5 overflow-x-auto bg-gold px-4 py-2.5">
        {SECONDARY_LINKS.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              `shrink-0 font-body text-xs font-bold uppercase tracking-wide ${
                isActive ? "text-ink" : "text-white/85 hover:text-white"
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

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1.5" />
      <circle cx="18" cy="21" r="1.5" />
      <path d="M2.5 3h2l2.3 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H5.5" />
    </svg>
  );
}
