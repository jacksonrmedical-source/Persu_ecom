import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";

export default function Wishlist() {
  const { items, toggle } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="font-display text-xl font-bold text-ink">Your wishlist is empty</p>
        <Link to="/" className="mt-4 inline-block rounded-full btn-gradient px-6 py-2.5 font-body text-sm font-bold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">My Wishlist</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-card border border-border bg-white p-3">
            <Link to={`/product/${item.products.slug}`}>
              <img
                src={item.products.product_images?.[0]?.url || "https://placehold.co/120x150"}
                alt={item.products.title}
                className="h-24 w-20 rounded-md object-cover"
              />
            </Link>
            <div className="flex-1">
              <Link to={`/product/${item.products.slug}`} className="font-body text-sm font-medium text-ink hover:underline">
                {item.products.title}
              </Link>
              <p className="mt-1 font-body text-sm font-bold text-ink">₹{item.products.sale_price}</p>
              <button
                onClick={() => toggle(item.product_id)}
                className="mt-2 font-body text-xs text-pink underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
