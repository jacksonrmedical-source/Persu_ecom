import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Product } from "../lib/types";
import DealRail from "./DealRail";

export const RECENTLY_VIEWED_KEY = "persu_recently_viewed";

export default function RecentlyViewedRail() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const slugs: string[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    if (!slugs.length) return;
    Promise.all(
      slugs.slice(0, 12).map((slug) =>
        api.get<Product>(`/products/${slug}`).then((res) => res.data).catch(() => null)
      )
    ).then((results) => setProducts(results.filter((p): p is Product => !!p)));
  }, []);

  if (!products.length) return null;

  return <DealRail title="Recently Viewed" products={products} />;
}
