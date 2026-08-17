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
  tracking_number: string | null;
  carrier: string | null;
  refund_status: string;
  refund_amount: number | null;
  order_items: OrderItem[];
  addresses: Address | null;
}

const STATUS_OPTIONS = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];
const REFUND_OPTIONS = ["none", "requested", "processing", "refunded"];

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
  // local edit buffers, keyed by order id, so typing doesn't trigger a save on every keystroke
  const [drafts, setDrafts] = useState<Record<string, { tracking_number: string; carrier: string; refund_status: string; refund_amount: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

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

  const startEditing = (order: Order) => {
    setDrafts((d) => ({
      ...d,
      [order.id]: {
        tracking_number: order.tracking_number || "",
        carrier: order.carrier || "",
        refund_status: order.refund_status || "none",
        refund_amount: order.refund_amount != null ? String(order.refund_amount) : "",
      },
    }));
  };

  const saveDraft = async (orderId: string) => {
    const draft = drafts[orderId];
    if (!draft) return;
    setSaving(orderId);
    try {
      await adminApi.patch(`/admin/orders/${orderId}`, {
        tracking_number: draft.tracking_number || null,
        carrier: draft.carrier || null,
        refund_status: draft.refund_status,
        refund_amount: draft.refund_amount ? parseFloat(draft.refund_amount) : null,
      });
      load();
    } finally {
      setSaving(null);
    }
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
              onClick={() => {
                const opening = expandedId !== order.id;
                setExpandedId(opening ? order.id : null);
                if (opening && !drafts[order.id]) startEditing(order);
              }}
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

                {drafts[order.id] && (
                  <div className="mt-4 space-y-2 border-t border-border pt-3">
                    <p className="font-body text-xs font-bold text-ink">Shipping & Refund</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={drafts[order.id].tracking_number}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [order.id]: { ...d[order.id], tracking_number: e.target.value } }))
                        }
                        placeholder="Tracking number"
                        className="rounded-md border border-border px-2 py-1.5 font-body text-xs"
                      />
                      <input
                        value={drafts[order.id].carrier}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [order.id]: { ...d[order.id], carrier: e.target.value } }))
                        }
                        placeholder="Carrier (e.g. Delhivery)"
                        className="rounded-md border border-border px-2 py-1.5 font-body text-xs"
                      />
                      <select
                        value={drafts[order.id].refund_status}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [order.id]: { ...d[order.id], refund_status: e.target.value } }))
                        }
                        className="rounded-md border border-border px-2 py-1.5 font-body text-xs capitalize"
                      >
                        {REFUND_OPTIONS.map((r) => (
                          <option key={r} value={r}>Refund: {r}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={drafts[order.id].refund_amount}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [order.id]: { ...d[order.id], refund_amount: e.target.value } }))
                        }
                        placeholder="Refund amount (₹)"
                        className="rounded-md border border-border px-2 py-1.5 font-body text-xs"
                      />
                    </div>
                    <button
                      onClick={() => saveDraft(order.id)}
                      disabled={saving === order.id}
                      className="rounded-full bg-ink px-4 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
                    >
                      {saving === order.id ? "Saving..." : "Save shipping & refund"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
