import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { api } from "../lib/api";
import { supabase } from "../lib/supabaseClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AddressForm {
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export default function Checkout() {
  const { items } = useCart();
  const location = useLocation() as { state?: { discount?: number; couponCode?: string } };
  const navigate = useNavigate();
  const discount = location.state?.discount || 0;
  const couponCode = location.state?.couponCode || null;

  const [address, setAddress] = useState<AddressForm>({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.products.sale_price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    setError(null);
    if (!address.full_name || !address.phone || !address.line1 || !address.pincode) {
      setError("Please fill in all required address fields");
      return;
    }

    setPlacing(true);
    try {
      // 1. save address directly via Supabase (RLS scopes it to the logged-in user)
      const { data: userData } = await supabase.auth.getUser();
      const { data: addressRow, error: addressErr } = await supabase
        .from("addresses")
        .insert({ ...address, user_id: userData.user?.id })
        .select()
        .single();
      if (addressErr) throw addressErr;
      const addressId = addressRow.id;

      // 2. create order + Razorpay order
      const orderRes = await api.post("/orders", {
        address_id: addressId,
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          title_snapshot: i.products.title,
          price_snapshot: i.products.sale_price,
          quantity: i.quantity,
        })),
        coupon_code: couponCode,
        discount,
        shipping_fee: 0,
      });

      const { order_id, razorpay_order_id, amount, currency, razorpay_key_id } = orderRes.data;

      // 3. open Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Could not load payment gateway. Check your connection and try again.");
        setPlacing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpay_key_id,
        amount,
        currency,
        name: "Persu",
        description: "Order payment",
        order_id: razorpay_order_id,
        prefill: {
          name: address.full_name,
          contact: address.phone,
        },
        theme: { color: "#FF4D6D" },
        handler: async (response: any) => {
          await api.post("/orders/verify-payment", {
            order_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          navigate("/orders", { state: { justPlaced: true } });
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Something went wrong placing your order");
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">Delivery Address</h1>

      <div className="space-y-3">
        <input
          placeholder="Full name"
          value={address.full_name}
          onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
        />
        <input
          placeholder="Phone number"
          value={address.phone}
          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
        />
        <input
          placeholder="Address line 1"
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
        />
        <input
          placeholder="Address line 2 (optional)"
          value={address.line2}
          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
          />
          <input
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className="rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
          />
        </div>
        <input
          placeholder="Pincode"
          value={address.pincode}
          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
        />
      </div>

      <div className="mt-6 space-y-1.5 rounded-card bg-white p-4 font-mono text-sm">
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

      {error && <p className="mt-3 font-body text-sm text-pink">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="mt-4 w-full rounded-full btn-gradient py-3.5 font-body text-sm font-bold text-white disabled:opacity-50"
      >
        {placing ? "Processing..." : `Pay ₹${total} with UPI/Card`}
      </button>
    </div>
  );
}
