import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";

interface Analytics {
  revenue_total: number;
  revenue_today: number;
  order_count: number;
  avg_order_value: number;
  status_breakdown: Record<string, number>;
  top_products: { title: string; qty_sold: number; revenue: number }[];
  low_stock: { title: string; slug: string; stock_remaining: number; stock_total: number }[];
  sales_by_day: { date: string; revenue: number }[];
  coupon_stats: { code: string; times_used: number; usage_limit: number | null }[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-muted",
  paid: "bg-gold",
  processing: "bg-purple",
  shipped: "bg-pink",
  delivered: "bg-green-500",
  cancelled: "bg-red-400",
  refunded: "bg-red-400",
};

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    adminApi.get<Analytics>("/admin/analytics").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="px-4 py-16 text-center text-muted">Loading dashboard...</div>;

  const totalStatusCount = Object.values(data.status_breakdown).reduce((a, b) => a + b, 0) || 1;
  const maxRevenue = Math.max(...data.sales_by_day.map((d) => d.revenue), 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Dashboard</h1>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total Revenue" value={`₹${data.revenue_total}`} />
        <KpiCard label="Today" value={`₹${data.revenue_today}`} />
        <KpiCard label="Paid Orders" value={data.order_count} />
        <KpiCard label="Avg Order Value" value={`₹${data.avg_order_value}`} />
      </div>

      {/* Sales trend */}
      <section className="mb-8 rounded-card border border-border bg-white p-4">
        <h2 className="mb-4 font-body text-sm font-bold text-ink">Sales — Last 14 Days</h2>
        <div className="flex h-32 items-end gap-1">
          {data.sales_by_day.map((d) => (
            <div key={d.date} className="group relative flex-1">
              <div
                className="btn-gradient w-full rounded-t-sm transition-all"
                style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 font-body text-[10px] text-white group-hover:block">
                ₹{d.revenue} · {d.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {/* Order status breakdown */}
        <section className="rounded-card border border-border bg-white p-4">
          <h2 className="mb-3 font-body text-sm font-bold text-ink">Order Status</h2>
          <div className="space-y-2">
            {Object.entries(data.status_breakdown).map(([status, count]) => (
              <div key={status}>
                <div className="mb-0.5 flex justify-between font-body text-xs capitalize text-muted">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-panel">
                  <div
                    className={`h-full ${STATUS_COLOR[status] || "bg-muted"}`}
                    style={{ width: `${(count / totalStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top products */}
        <section className="rounded-card border border-border bg-white p-4">
          <h2 className="mb-3 font-body text-sm font-bold text-ink">Top Sellers</h2>
          {data.top_products.length === 0 ? (
            <p className="font-body text-xs text-muted">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {data.top_products.map((p, i) => (
                <div key={i} className="flex items-center justify-between font-body text-xs">
                  <span className="truncate text-ink">{i + 1}. {p.title}</span>
                  <span className="shrink-0 text-muted">{p.qty_sold} sold</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {/* Low stock alerts */}
        <section className="rounded-card border border-border bg-white p-4">
          <h2 className="mb-3 font-body text-sm font-bold text-ink">Low Stock Alerts</h2>
          {data.low_stock.length === 0 ? (
            <p className="font-body text-xs text-muted">Everything's well stocked.</p>
          ) : (
            <div className="space-y-2">
              {data.low_stock.map((p) => (
                <Link
                  key={p.slug}
                  to={`/product/${p.slug}`}
                  className="flex items-center justify-between font-body text-xs hover:underline"
                >
                  <span className="truncate text-ink">{p.title}</span>
                  <span className="shrink-0 font-semibold text-pink">{p.stock_remaining} left</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Coupon performance */}
        <section className="rounded-card border border-border bg-white p-4">
          <h2 className="mb-3 font-body text-sm font-bold text-ink">Coupon Performance</h2>
          {data.coupon_stats.length === 0 ? (
            <p className="font-body text-xs text-muted">No coupons yet.</p>
          ) : (
            <div className="space-y-2">
              {data.coupon_stats.map((c) => (
                <div key={c.code} className="flex items-center justify-between font-body text-xs">
                  <span className="font-mono text-ink">{c.code}</span>
                  <span className="text-muted">
                    {c.times_used} used{c.usage_limit ? ` / ${c.usage_limit}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/products/new" className="btn-gradient rounded-full px-5 py-2.5 font-body text-sm font-bold text-white">
          + Add Product
        </Link>
        <Link to="/admin/orders" className="rounded-full border border-border px-5 py-2.5 font-body text-sm font-bold text-ink">
          Manage Orders
        </Link>
        <button
          onClick={() => downloadCsv("/admin/products/export.csv", "products.csv")}
          className="rounded-full border border-border px-5 py-2.5 font-body text-sm font-bold text-ink"
        >
          Export Products CSV
        </button>
        <button
          onClick={() => downloadCsv("/admin/orders/export.csv", "orders.csv")}
          className="rounded-full border border-border px-5 py-2.5 font-body text-sm font-bold text-ink"
        >
          Export Orders CSV
        </button>
      </div>
    </div>
  );
}

async function downloadCsv(path: string, filename: string) {
  const res = await adminApi.get(path, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-white p-4">
      <p className="font-body text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
