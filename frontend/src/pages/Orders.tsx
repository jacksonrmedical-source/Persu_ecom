import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { title_snapshot: string; quantity: number; price_snapshot: number }[];
}

export default function Orders() {
  const location = useLocation() as { state?: { justPlaced?: boolean } };
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get<Order[]>("/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {location.state?.justPlaced && (
        <div className="mb-4 rounded-card bg-lime/30 p-4 font-body text-sm font-semibold text-ink">
          🎉 Order placed! We'll email you the tracking details shortly.
        </div>
      )}
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">Your Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-card bg-white p-4">
            <div className="flex justify-between font-mono text-xs text-ink/50">
              <span>{new Date(o.created_at).toLocaleDateString()}</span>
              <span className="capitalize">{o.status}</span>
            </div>
            <div className="mt-2 space-y-1">
              {o.order_items.map((item, i) => (
                <p key={i} className="font-body text-sm text-ink">
                  {item.title_snapshot} × {item.quantity}
                </p>
              ))}
            </div>
            <p className="mt-2 font-mono text-sm font-bold text-ink">Total: ₹{o.total}</p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="py-16 text-center font-body text-ink/50">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
