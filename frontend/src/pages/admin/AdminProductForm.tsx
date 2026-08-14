import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";

interface Category {
  id: string;
  name: string;
  slug: string;
}
interface Collection {
  id: string;
  name: string;
  slug: string;
}
interface VariantRow {
  size: string;
  stock: number;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminProductForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [mrp, setMrp] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockTotal, setStockTotal] = useState("");
  const [dispatchHours, setDispatchHours] = useState("48");
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [flashEndsAt, setFlashEndsAt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi.get<Category[]>("/admin/categories").then((res) => {
      setCategories(res.data);
      if (res.data[0]) setCategoryId(res.data[0].id);
    });
    adminApi.get<Collection[]>("/admin/collections").then((res) => setCollections(res.data));
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setMrp("");
    setSalePrice("");
    setStockTotal("");
    setIsFlashDeal(false);
    setFlashEndsAt("");
    setImageUrls([""]);
    setVariants([]);
    setSelectedCollections([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !slug || !categoryId || !mrp || !salePrice || !stockTotal) {
      setMessage({ type: "error", text: "Fill in title, category, MRP, sale price, and stock." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.post("/admin/products", {
        title,
        slug,
        description: description || null,
        category_id: categoryId,
        mrp: parseFloat(mrp),
        sale_price: parseFloat(salePrice),
        stock_total: parseInt(stockTotal, 10),
        dispatch_hours: parseInt(dispatchHours, 10),
        is_flash_deal: isFlashDeal,
        flash_deal_ends_at: isFlashDeal && flashEndsAt ? new Date(flashEndsAt).toISOString() : null,
        image_urls: imageUrls.filter((u) => u.trim()),
        variants: variants
          .filter((v) => v.size.trim())
          .map((v) => ({ size: v.size, stock: v.stock })),
        collection_ids: selectedCollections,
      });
      setMessage({ type: "success", text: `Created "${res.data.slug}" — live on the site now.` });
      resetForm();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.detail || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">Add a product</h1>
        <Link to="/admin/orders" className="font-body text-sm font-semibold text-pink">
          View Orders →
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
            placeholder="Floral Wrap Midi Dress"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
            Slug (URL) — auto-filled, edit if needed
          </label>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-mono text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block font-body text-xs font-semibold text-ink/60">MRP (₹)</label>
            <input
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
              Sale price (₹)
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
              Total stock
            </label>
            <input
              type="number"
              value={stockTotal}
              onChange={(e) => setStockTotal(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
            Dispatch time
          </label>
          <select
            value={dispatchHours}
            onChange={(e) => setDispatchHours(e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 font-body text-sm"
          >
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
            <option value="72">72 hours</option>
          </select>
        </div>

        <div className="rounded-card bg-white p-4">
          <label className="flex items-center gap-2 font-body text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={isFlashDeal}
              onChange={(e) => setIsFlashDeal(e.target.checked)}
            />
            Flash deal (shows countdown badge)
          </label>
          {isFlashDeal && (
            <input
              type="datetime-local"
              value={flashEndsAt}
              onChange={(e) => setFlashEndsAt(e.target.value)}
              className="mt-3 w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-sm"
            />
          )}
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
            Image URLs (first one is the primary image)
          </label>
          {imageUrls.map((url, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input
                value={url}
                onChange={(e) => {
                  const next = [...imageUrls];
                  next[i] = e.target.value;
                  setImageUrls(next);
                }}
                placeholder="https://..."
                className="flex-1 rounded-md border border-ink/15 px-3 py-2 font-mono text-xs"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                  className="rounded-md border border-ink/15 px-2 text-ink/50"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setImageUrls([...imageUrls, ""])}
            className="font-body text-xs font-semibold text-pink"
          >
            + Add another image
          </button>
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
            Sizes (leave empty for products without sizes, e.g. accessories)
          </label>
          {variants.map((v, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input
                value={v.size}
                onChange={(e) => {
                  const next = [...variants];
                  next[i].size = e.target.value;
                  setVariants(next);
                }}
                placeholder="Size (e.g. M)"
                className="w-24 rounded-md border border-ink/15 px-3 py-2 font-mono text-xs"
              />
              <input
                type="number"
                value={v.stock}
                onChange={(e) => {
                  const next = [...variants];
                  next[i].stock = parseInt(e.target.value, 10) || 0;
                  setVariants(next);
                }}
                placeholder="Stock"
                className="w-24 rounded-md border border-ink/15 px-3 py-2 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                className="rounded-md border border-ink/15 px-2 text-ink/50"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setVariants([...variants, { size: "", stock: 0 }])}
            className="font-body text-xs font-semibold text-pink"
          >
            + Add a size
          </button>
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-semibold text-ink/60">
            Show in collections (homepage rails)
          </label>
          <div className="flex flex-wrap gap-3">
            {collections.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 font-body text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(c.id)}
                  onChange={(e) =>
                    setSelectedCollections(
                      e.target.checked
                        ? [...selectedCollections, c.id]
                        : selectedCollections.filter((id) => id !== c.id)
                    )
                  }
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        {message && (
          <p
            className={`font-body text-sm ${
              message.type === "success" ? "text-green-700" : "text-pink"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full btn-gradient py-3.5 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create product"}
        </button>
      </form>
    </div>
  );
}
