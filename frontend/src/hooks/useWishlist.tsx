import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabaseClient";

interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    title: string;
    slug: string;
    sale_price: number;
    mrp: number;
    product_images: { url: string; is_primary?: boolean }[];
  };
}

interface WishlistContextValue {
  items: WishlistItem[];
  productIds: Set<string>;
  toggle: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const refresh = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setItems([]);
      return;
    }
    try {
      const res = await api.get<WishlistItem[]>("/wishlist");
      setItems(res.data);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, []);

  const productIds = new Set(items.map((i) => i.product_id));

  const toggle = async (productId: string) => {
    if (productIds.has(productId)) {
      await api.delete(`/wishlist/${productId}`);
    } else {
      await api.post("/wishlist", { product_id: productId });
    }
    await refresh();
  };

  return (
    <WishlistContext.Provider value={{ items, productIds, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
