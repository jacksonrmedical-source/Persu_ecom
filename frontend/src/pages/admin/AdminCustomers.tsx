import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";

interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  email: string;
  order_count: number;
  total_spent: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get<Customer[]>("/admin/customers").then((res) => {
      setCustomers(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="px-4 py-16 text-center text-muted">Loading customers...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Customers ({customers.length})</h1>

      {customers.length === 0 ? (
        <p className="py-16 text-center font-body text-muted">No customers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-panel">
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Name</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Email</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Phone</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Orders</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Total Spent</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-body text-sm text-ink">{c.full_name || "—"}</td>
                  <td className="px-4 py-2.5 font-body text-sm text-ink">{c.email}</td>
                  <td className="px-4 py-2.5 font-body text-sm text-muted">{c.phone || "—"}</td>
                  <td className="px-4 py-2.5 font-body text-sm text-ink">{c.order_count}</td>
                  <td className="px-4 py-2.5 font-body text-sm text-ink">₹{c.total_spent}</td>
                  <td className="px-4 py-2.5 font-body text-xs text-muted">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
