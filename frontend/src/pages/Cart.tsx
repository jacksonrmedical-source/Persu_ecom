import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { api } from "../lib/api";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, i) => sum + i.products.sale_price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    setCouponMsg(null);
    try {
      const res = await api.post("/coupons/validate", { code: couponCode, subtotal });
      setDiscount(res.data.discount);
      setCouponMsg(`Applied — you saved ₹${res.data.discount}`);
    } catch (err: any) {
      setDiscount(0);
      setCouponMsg(err?.response?.data?.detail || "Invalid coupon");
    }
  };

  if (items.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="font-display text-xl font-bold text-ink">Your bag is empty</p>
        <Link to="/" className="mt-4 inline-block rounded-full bg-pink px-6 py-2.5 font-body text-sm font-bold text-white">
          Start looting
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">Your Bag</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-card bg-white p-3">
            <img
              src={item.products.product_images?.[0]?.url || "https://placehold.co/120x150"}
              alt={item.products.title}
              className="h-24 w-20 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="font-body text-sm font-medium text-ink">{item.products.title}</p>
              {item.product_variants?.size && (
                <p className="font-mono text-xs text-ink/50">Size: {item.product_variants.size}</p>
              )}
              <p className="mt-1 font-mono text-sm font-bold text-ink">
                ₹{item.products.sale_price}
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-full border border-ink/20">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="px-2.5 py-1 font-mono text-sm"
                  >
                    −
                  </button>
                  <span className="px-2 font-mono text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 font-mono text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="font-body text-xs text-ink/50 underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card bg-white p-4">
        <div className="flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            className="flex-1 rounded-full border border-ink/15 px-3 py-2 font-mono text-sm"
          />
          <button
            onClick={applyCoupon}
            className="rounded-full bg-ink px-4 py-2 font-body text-sm font-semibold text-sand"
          >
            Apply
          </button>
        </div>
        {couponMsg && <p className="mt-2 font-body text-xs text-ink/60">{couponMsg}</p>}
      </div>

      <div className="mt-4 space-y-1.5 rounded-card bg-white p-4 font-mono text-sm">
        <div className="flex justify-between text-ink/70">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-pink">
            <span>Discount</span>
            <span>−₹{discount}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-ink/10 pt-1.5 text-base font-bold text-ink">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        onClick={() => navigate("/checkout", { state: { discount, couponCode: discount ? couponCode : null } })}
        className="mt-4 w-full rounded-full btn-gradient py-3.5 font-body text-sm font-bold text-white"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
