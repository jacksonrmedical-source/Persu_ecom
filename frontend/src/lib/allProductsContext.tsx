import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";
import { Product } from "./types";

interface AllProductsContextValue {
  products: Product[];
  loading: boolean;
}

const AllProductsContext = createContext<AllProductsContextValue>({
  products: [],
  loading: true,
});

export function AllProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side search only — fetches a large page once on load rather than
    // hitting the backend per keystroke. Fine for a catalog this size; swap
    // for a real search endpoint if the catalog grows past a few thousand items.
    api
      .get("/products", { params: { page: 1, page_size: 500 } })
      .then((res) => setProducts(res.data.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AllProductsContext.Provider value={{ products, loading }}>
      {children}
    </AllProductsContext.Provider>
  );
}

export function useAllProducts() {
  return useContext(AllProductsContext);
}
