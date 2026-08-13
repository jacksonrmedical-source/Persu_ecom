import { Link } from "react-router-dom";
import { Product } from "../lib/types";
import ProductCard from "./ProductCard";

interface DealRailProps {
  title: string;
  viewAllHref?: string;
  products: Product[];
}

export default function DealRail({ title, viewAllHref, products }: DealRailProps) {
  if (!products?.length) return null;

  return (
    <section className="py-6">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h2>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="font-body text-sm font-semibold text-pink hover:underline"
          >
            View all →
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
