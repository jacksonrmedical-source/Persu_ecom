import { Link, useNavigate } from "react-router-dom";
import { Product } from "../lib/types";
import CountdownBadge from "./CountdownBadge";
import { useWishlist } from "../hooks/useWishlist";

interface ProductCardProps {
  product: Product;
  compact?: boolean;          // smaller card for rails/grids (default true)
  forceDealEndTime?: string;  // shows a countdown badge even if the product isn't a real flash deal
}

export default function ProductCard({ product, compact = true, forceDealEndTime }: ProductCardProps) {
  const navigate = useNavigate();
  const { productIds, toggle } = useWishlist();
  const isWishlisted = productIds.has(product.id);

  const primaryImage =
    product.product_images?.find((i) => i.is_primary)?.url ||
    product.product_images?.[0]?.url ||
    "https://placehold.co/400x520/F5F5F6/282C3F?text=PERZN";

  const discountPct = Math.round(
    ((product.mrp - product.sale_price) / product.mrp) * 100
  );

  const lowStock =
    product.stock_total > 0 && product.stock_remaining / product.stock_total < 0.15;

  const showCountdown = product.is_flash_deal || !!forceDealEndTime;
  const countdownEndsAt = product.flash_deal_ends_at || forceDealEndTime;

  const cardWidth = compact ? "w-[168px] sm:w-[200px]" : "w-full sm:w-[260px]";
  const titleSize = compact ? "text-[13px]" : "text-base";

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await toggle(product.id);
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 422) {
        navigate("/login");
      }
    }
  };

  return (
    <Link to={`/product/${product.slug}`} className={`group block shrink-0 ${cardWidth}`}>
      <div className="relative overflow-hidden rounded-card border border-border bg-white">
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {showCountdown && <CountdownBadge endsAt={countdownEndsAt} />}
        <button
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistClick}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-muted hover:text-pink"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#0A0F2D" : "none"}
            stroke={isWishlisted ? "#0A0F2D" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0L12 6.9l-2.3-2.3c-1.8-1.8-4.7-1.8-6.5 0-1.8 1.8-1.8 4.7 0 6.5L12 20.4l8.8-9.3c1.8-1.8 1.8-4.7 0-6.5z" />
          </svg>
        </button>
      </div>

      <div className="mt-2 space-y-0.5">
        <p className={`font-body font-bold text-ink ${titleSize}`}>PERZN</p>
        <p className={`line-clamp-1 font-body text-muted ${titleSize}`}>{product.title}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`font-body font-bold text-ink ${titleSize}`}>₹{product.sale_price}</span>
          {product.mrp > product.sale_price && (
            <>
              <span className="font-body text-[12px] text-muted line-through">₹{product.mrp}</span>
              <span className="btn-gradient rounded-full px-1.5 py-0.5 font-body text-[10px] font-bold text-white">
                {discountPct}% OFF
              </span>
            </>
          )}
        </div>
        {product.rating > 0 && (
          <span className="mt-0.5 inline-flex items-center gap-0.5 rounded-sm bg-gold/15 px-1.5 py-0.5 font-body text-[11px] font-bold text-gold">
            {product.rating} ★
          </span>
        )}
        {lowStock && (
          <p className="font-body text-[11px] font-semibold text-pink">Only a few left</p>
        )}
      </div>
    </Link>
  );
}

