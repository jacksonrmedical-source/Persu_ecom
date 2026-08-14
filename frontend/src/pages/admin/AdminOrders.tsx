import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";

interface OrderItem {
  title_snapshot: string;
  quantity: number;
  price_snapshot: number;
}

interface Address {
  full_name: string;
  phone: string;
  city: string;
  state: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
  addresses: Address | null;
}

const STATUS_OPTIONS = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-panel text-muted",
  paid: "bg-gold/15 text-gold",
  processing: "bg-purple/15 text-purple",
  shipped: "bg-pink/15 text-pink",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    adminApi.get<Order[]>("/admin/orders").then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // near-real-time without websockets — refresh every 20s while the tab is open
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await adminApi.patch(`/admin/orders/${orderId}`, { status });
    load();
  };

  if (loading) return <div className="px-4 py-16 text-center text-muted">Loading orders...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Orders ({orders.length})</h1>
        <button onClick={load} className="font-body text-sm font-semibold text-pink">
          Refresh
        </button>
      </div>

      {orders.length === 0 && (
        <p className="py-16 text-center font-body text-muted">No orders yet.</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-card border border-border bg-white">
            <button
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-ink">
                  {order.addresses?.full_name || "Unknown customer"}
                </p>
                <p className="font-body text-xs text-muted">
                  {new Date(order.created_at).toLocaleString()} · ₹{order.total}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 font-body text-xs font-bold capitalize ${STATUS_COLOR[order.status] || "bg-panel text-muted"}`}>
                {order.status}
              </span>
            </button>

            {expandedId === order.id && (
              <div className="border-t border-border px-4 py-3">
                <div className="mb-3 space-y-1">
                  {order.order_items.map((item, i) => (
                    <p key={i} className="font-body text-sm text-ink">
                      {item.title_snapshot} × {item.quantity} — ₹{item.price_snapshot}
                    </p>
                  ))}
                </div>
                {order.addresses && (
                  <p className="mb-3 font-body text-xs text-muted">
                    {order.addresses.phone} · {order.addresses.city}, {order.addresses.state}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <label className="font-body text-xs font-semibold text-muted">Update status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="rounded-md border border-border px-2 py-1 font-body text-xs capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
