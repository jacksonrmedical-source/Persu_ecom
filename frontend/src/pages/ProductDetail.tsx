import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Product } from "../lib/types";
import { useCart } from "../hooks/useCart";
import CountdownBadge from "../components/CountdownBadge";
import { RECENTLY_VIEWED_KEY } from "../components/RecentlyViewedRail";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Product>(`/products/${slug}`).then((res) => {
      setProduct(res.data);
      setSelectedVariant(res.data.product_variants?.[0]?.id || null);
    });

    // track for the "Recently Viewed" rail — newest first, capped at 12, no dupes
    if (slug) {
      const existing: string[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      const next = [slug, ...existing.filter((s) => s !== slug)].slice(0, 12);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    }
  }, [slug]);

  if (!product) return <div className="px-4 py-16 text-center text-ink/50">Loading...</div>;

  const discountPct = Math.round(((product.mrp - product.sale_price) / product.mrp) * 100);
  const images = product.product_images?.length
    ? product.product_images
    : [{ url: "https://placehold.co/600x800/FFF8F0/131A2B?text=PERZN" }];

  const handleAddToCart = async (goToCart: boolean) => {
    setAdding(true);
    setCartError(null);
    try {
      await addItem(product.id, selectedVariant, 1);
      if (goToCart) navigate("/cart");
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 422) {
        setCartError("Please log in to add items to your bag.");
      } else {
        setCartError("Couldn't add to cart — please try again.");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-card bg-white">
            <img
              src={images[activeImage].url}
              alt={product.title}
              className="aspect-[3/4] w-full object-cover"
            />
            {product.is_flash_deal && <CountdownBadge endsAt={product.flash_deal_ends_at} />}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-14 w-14 overflow-hidden rounded-md border-2 ${
                    i === activeImage ? "border-pink" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{product.title}</h1>
          {product.rating > 0 && (
            <p className="mt-1 font-body text-sm text-ink/60">
              ★ {product.rating} ({product.rating_count} ratings)
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-ink">₹{product.sale_price}</span>
            {product.mrp > product.sale_price && (
              <>
                <span className="font-mono text-lg text-ink/40 line-through">₹{product.mrp}</span>
                <span className="rounded-full bg-pink/10 px-2 py-0.5 font-mono text-xs font-bold text-pink">
                  {discountPct}% OFF
                </span>
              </>
            )}
          </div>

          {product.product_variants && product.product_variants.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 font-body text-sm font-semibold text-ink">Select size</p>
              <div className="flex flex-wrap gap-2">
                {product.product_variants.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stock === 0}
                    onClick={() => setSelectedVariant(v.id)}
                    className={`rounded-md border px-3 py-1.5 font-mono text-sm ${
                      v.stock === 0
                        ? "cursor-not-allowed border-ink/10 text-ink/30 line-through"
                        : selectedVariant === v.id
                        ? "border-ink bg-ink text-sand"
                        : "border-ink/20 text-ink hover:border-ink"
                    }`}
                  >
                    {v.size || v.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 font-body text-xs text-ink/50">
            Dispatch in {product.dispatch_hours} hours
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={adding}
              className="flex-1 rounded-full border-2 border-ink py-3 font-body text-sm font-bold text-ink disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={adding}
              className="flex-1 rounded-full btn-gradient py-3 font-body text-sm font-bold text-white disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {cartError && (
            <p className="mt-3 font-body text-sm text-pink">
              {cartError}{" "}
              {cartError.includes("log in") && (
                <Link to="/login" className="underline font-semibold">
                  Log in now
                </Link>
              )}
            </p>
          )}

          {product.description && (
            <div className="mt-6 border-t border-ink/10 pt-4">
              <p className="font-body text-sm leading-relaxed text-ink/70">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
