import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Category } from "../lib/types";

const FALLBACK_COLORS = ["bg-pink", "bg-purple", "bg-gold", "bg-ink"];

export default function CategoryTileGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>("/categories").then((res) => setCategories(res.data));
  }, []);

  if (!categories.length) return null;

  return (
    <section className="px-4 py-6">
      <h2 className="mb-3 font-display text-xl font-bold text-ink sm:text-2xl">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className="group overflow-hidden rounded-lg border border-border"
          >
            {c.image_url ? (
              <img src={c.image_url} alt={c.name} className="h-28 w-full object-cover transition-transform group-hover:scale-105 sm:h-36" />
            ) : (
              <div className={`flex h-28 w-full items-center justify-center sm:h-36 ${FALLBACK_COLORS[i % FALLBACK_COLORS.length]}`}>
                <span className="font-display text-lg font-bold text-white">{c.name[0]}</span>
              </div>
            )}
            <p className="bg-white py-2 text-center font-body text-sm font-semibold text-ink">
              {c.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
