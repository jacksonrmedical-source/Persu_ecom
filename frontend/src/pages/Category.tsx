import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { Product } from "../lib/types";
import ProductCard from "../components/ProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function Category() {
  const { slug } = useParams();
  const location = useLocation();
  const isCollection = location.pathname.startsWith("/collection/");
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("newest");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // reset pagination whenever the category or sort changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [slug, sort]);

  useEffect(() => {
    if (isCollection) {
      // collections aren't paginated server-side yet — fetch a larger batch once
      api.get(`/collections/${slug}/products`, { params: { limit: 60 } }).then((res) => {
        setProducts(res.data);
        setTotal(res.data.length);
      });
      return;
    }
    api
      .get("/products", { params: { category_slug: slug, sort, page } })
      .then((res) => {
        setProducts((prev) => (page === 1 ? res.data.items : [...prev, ...res.data.items]));
        setTotal(res.data.total);
      });
  }, [slug, sort, page, isCollection]);

  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold capitalize text-ink">
          {slug?.replace(/-/g, " ")}
        </h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-ink/15 bg-white px-3 py-1.5 font-body text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-4 font-mono text-xs text-ink/50">{total} items</p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="py-16 text-center font-body text-ink/50">
          Nothing here yet — check back soon.
        </p>
      )}

      {total > products.length && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="mx-auto mt-8 block rounded-full bg-ink px-6 py-2.5 font-body text-sm font-semibold text-sand"
        >
          Load more
        </button>
      )}
    </div>
  );
}
