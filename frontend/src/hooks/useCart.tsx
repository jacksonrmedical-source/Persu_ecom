import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api";
import { CartItem } from "../lib/types";
import { supabase } from "../lib/supabaseClient";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, variantId: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<CartItem[]>("/cart");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, []);

  const addItem = async (productId: string, variantId: string | null, quantity = 1) => {
    await api.post("/cart", { product_id: productId, variant_id: variantId, quantity });
    await refresh();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    await api.patch(`/cart/${itemId}`, null, { params: { quantity } });
    await refresh();
  };

  const removeItem = async (itemId: string) => {
    await api.delete(`/cart/${itemId}`);
    await refresh();
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, loading, refresh, addItem, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
