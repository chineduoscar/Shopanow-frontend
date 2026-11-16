"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { ErrorPanel, LoadingPanel, naira, PageHeading } from "./AdminShared";

const emptyProduct = {
  name: "",
  brand: "",
  description: "",
  price_ngn: "",
  image: "",
  category: "Phones",
  stock: "0",
  available: true,
};

const inputClass = "mt-1 w-full rounded-lg border border-[#E4E0D3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-[#0D110E]";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await axios.get("/api/admin/products");
      setProducts(data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load products."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      description: product.description || "",
      price_ngn: String(product.price_ngn ?? ""),
      image: product.image || "",
      category: product.category || "Phones",
      stock: String(product.stock ?? 0),
      available: product.available !== false,
    });
    setFormOpen(true);
    setSuccess("");
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId("");
    setFormOpen(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = editingId
        ? await axios.patch(`/api/admin/products/${editingId}`, form)
        : await axios.post("/api/admin/products", form);
      setProducts((current) =>
        editingId
          ? current.map((product) => product.id === editingId ? response.data.data : product)
          : [response.data.data, ...current],
      );
      setSuccess(editingId ? "Product updated." : "Product added to the catalog.");
      resetForm();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save product."));
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`/api/admin/products/${product.id}`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setSuccess("Product deleted.");
      if (editingId === product.id) resetForm();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not delete product."));
    }
  };

  const toggleAvailability = async (product) => {
    setError("");
    try {
      const { data } = await axios.patch(`/api/admin/products/${product.id}`, {
        available: !product.available,
      });
      setProducts((current) => current.map((item) => item.id === product.id ? data.data : item));
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Could not update product availability.",
        ),
      );
    }
  };

  return (
    <>
      <PageHeading
        title="Products"
        description="Manage the products shown in your live store catalog."
        action={
          <button
            type="button"
            onClick={() => {
              if (formOpen && !editingId) resetForm();
              else {
                setForm(emptyProduct);
                setEditingId("");
                setFormOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#12201A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0D4633] dark:bg-[#22C55E] dark:text-[#0D110E]"
          >
            <Plus size={16} /> Add product
          </button>
        }
      />
      {error && <div className="mb-4"><ErrorPanel message={error} onRetry={() => void load()} /></div>}
      {success && <p role="status" className="mb-4 rounded-xl bg-[#22C55E]/10 p-3 text-sm text-[#0D4633] dark:text-[#4ADE80]">{success}</p>}

      {formOpen && (
        <form onSubmit={submit} className="mb-6 rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit product" : "New product"}</h2>
            <button type="button" onClick={resetForm} aria-label="Close product form" className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"><X size={18} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm">Product name<input className={inputClass} required maxLength={180} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="text-sm">Brand<input className={inputClass} maxLength={100} value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} /></label>
            <label className="text-sm">Category<input className={inputClass} required maxLength={100} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
            <label className="text-sm">Price (NGN)<input className={inputClass} type="number" min="0" step="0.01" required value={form.price_ngn} onChange={(event) => setForm({ ...form, price_ngn: event.target.value })} /></label>
            <label className="text-sm">Stock quantity<input className={inputClass} type="number" min="0" step="1" required value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></label>
            <label className="text-sm">Image URL<input className={inputClass} type="url" maxLength={2048} placeholder="https://…" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm sm:col-span-2 lg:col-span-3">
              <input type="checkbox" checked={form.available} onChange={(event) => setForm({ ...form, available: event.target.checked })} />
              Available in store
            </label>
            <label className="text-sm sm:col-span-2 lg:col-span-3">Description<textarea className={inputClass} rows={3} maxLength={5000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving} className="rounded-full bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-[#0D110E] disabled:opacity-50">{saving ? "Saving…" : editingId ? "Save changes" : "Create product"}</button>
            <button type="button" onClick={resetForm} className="rounded-full border border-[#E4E0D3] px-5 py-2.5 text-sm dark:border-white/10">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <LoadingPanel label="Loading products" /> : (
        <section className="overflow-hidden rounded-2xl border border-[#E4E0D3] bg-white dark:border-white/10 dark:bg-[#151B18]">
          {!products.length ? (
            <p className="px-5 py-14 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">No products in the catalog yet. Add one to publish it to the store.</p>
          ) : (
            <div className="divide-y divide-[#E4E0D3] dark:divide-white/10">
              {products.map((product) => (
                <article key={product.id} className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt="" className="h-14 w-14 rounded-xl bg-[#F5F4EE] object-contain dark:bg-[#0D110E]" />
                  ) : <div className="h-14 w-14 rounded-xl bg-[#F5F4EE] dark:bg-[#0D110E]" />}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                    <p className="mt-0.5 text-xs text-[#6B7269] dark:text-[#A3AAA4]">{product.category} · Stock: {product.stock}</p>
                    <p className="mt-1 text-sm font-medium">{naira(product.price_ngn)}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-[#56635B] dark:text-[#B1BBB4]">
                    <input type="checkbox" checked={product.available} onChange={() => void toggleAvailability(product)} />
                    Available
                  </label>
                  <button type="button" onClick={() => edit(product)} aria-label={`Edit ${product.name}`} className="rounded-lg p-2 text-[#0D4633] hover:bg-[#22C55E]/10 dark:text-[#4ADE80]"><Pencil size={17} /></button>
                  <button type="button" onClick={() => void deleteProduct(product)} aria-label={`Delete ${product.name}`} className="rounded-lg p-2 text-red-600 hover:bg-red-500/10 dark:text-red-300"><Trash2 size={17} /></button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
