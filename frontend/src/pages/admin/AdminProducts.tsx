import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";

interface Product {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  stock_remaining: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminApi.get<Product[]>("/admin/products").then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    await adminApi.delete(`/admin/products/${id}`);
    load();
  };

  const togglePublish = async (p: Product) => {
    await adminApi.patch(`/admin/products/${p.id}`, { is_active: !p.is_active });
    load();
  };

  if (loading) return <div className="px-4 py-16 text-center text-muted">Loading products...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Products ({products.length})</h1>
        <Link to="/admin/products/new" className="btn-gradient rounded-full px-5 py-2 font-body text-sm font-bold text-white">
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center font-body text-muted">No products yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-panel">
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Title</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Price</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Stock</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Status</th>
                <th className="px-4 py-2.5 font-body text-xs font-bold uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-body text-sm text-ink">{p.title}</td>
                  <td className="px-4 py-2.5 font-body text-sm text-ink">₹{p.sale_price}</td>
                  <td className="px-4 py-2.5 font-body text-sm text-ink">{p.stock_remaining}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => togglePublish(p)}
                      className={`rounded-full px-2.5 py-1 font-body text-xs font-bold ${
                        p.is_active ? "bg-green-100 text-green-700" : "bg-panel text-muted"
                      }`}
                    >
                      {p.is_active ? "Published" : "Unpublished"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3 font-body text-xs font-semibold">
                      <Link to={`/admin/products/${p.id}/edit`} className="text-pink">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.title)} className="text-red-600">
                        Delete
                      </button>
                    </div>
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
