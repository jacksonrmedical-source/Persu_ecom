import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Collection, Product } from "../lib/types";
import DealRail from "../components/DealRail";
import HeroCarousel from "../components/HeroCarousel";
import CategoryTileGrid from "../components/CategoryTileGrid";
import RecentlyViewedRail from "../components/RecentlyViewedRail";
import ProductCard from "../components/ProductCard";

// used as a fallback countdown on the "Top Deals" rail when no real flash
// deals exist yet, so the section still feels alive on a fresh install
const FAKE_DEAL_ENDS_AT = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

export default function Home() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<Record<string, Product[]>>({});
  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [hasRealDeals, setHasRealDeals] = useState(true);

  useEffect(() => {
    api.get<Collection[]>("/collections").then(async (res) => {
      setCollections(res.data);
      const entries = await Promise.all(
        res.data.map(async (c) => {
          const p = await api.get<Product[]>(`/collections/${c.slug}/products`, {
            params: { limit: 12 },
          });
          return [c.slug, p.data] as const;
        })
      );
      setCollectionProducts(Object.fromEntries(entries));
    });

    api.get("/products", { params: { is_flash_deal: true, page_size: 12 } }).then((res) => {
      if (res.data.items.length > 0) {
        setTopDeals(res.data.items);
      } else {
        // no real flash deals yet — show a subset of products with a fake timer
        api.get("/products", { params: { page_size: 12 } }).then((fallback) => {
          setTopDeals(fallback.data.items);
          setHasRealDeals(false);
        });
      }
    });
  }, []);

  return (
    <div>
      <HeroCarousel />

      {topDeals.length > 0 && (
        <section className="py-6">
          <div className="mb-3 flex items-center justify-between px-4">
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">🔥 Top Deals</h2>
            <Link to="/collection/flash-deals" className="font-body text-sm font-semibold text-pink hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {topDeals.map((p) => (
              <div key={p.id} className="w-[168px] shrink-0 sm:w-[200px]">
                <ProductCard product={p} forceDealEndTime={hasRealDeals ? undefined : FAKE_DEAL_ENDS_AT} />
              </div>
            ))}
          </div>
        </section>
      )}

      <CategoryTileGrid />

      <RecentlyViewedRail />

      {collections.map((c) => (
        <DealRail
          key={c.id}
          title={c.name}
          viewAllHref={`/collection/${c.slug}`}
          products={collectionProducts[c.slug] || []}
        />
      ))}
    </div>
  );
}
