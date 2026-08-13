import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Category, Collection } from "../lib/types";

export default function MegaMenu({ onClose }: { onClose: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    api.get<Category[]>("/categories").then((res) => setCategories(res.data));
    api.get<Collection[]>("/collections").then((res) => setCollections(res.data));

    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [onClose]);

  return (
    <>
      {/* click-outside catcher */}
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute left-0 right-0 top-full z-40 border-t border-border bg-white shadow-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4">
          <div>
            <p className="mb-3 font-body text-xs font-bold uppercase tracking-wide text-muted">
              Shop by Category
            </p>
            <div className="space-y-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  onClick={onClose}
                  className="block font-body text-sm text-ink hover:text-pink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-2 md:col-span-3">
            <p className="mb-3 font-body text-xs font-bold uppercase tracking-wide text-muted">
              Curated Collections
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {collections.map((c) => (
                <Link
                  key={c.id}
                  to={`/collection/${c.slug}`}
                  onClick={onClose}
                  className="btn-gradient rounded-lg px-4 py-6 text-center font-body text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
