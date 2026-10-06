"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { Search, Trash2, ExternalLink } from "lucide-react";

export default function AdminProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.categorySlug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product from Turso DB?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      alert("Error deleting product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand, category..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-navy"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="text-xs text-gray-500">
          Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> items
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-100/70 text-gray-600 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Amazon Compare</th>
              <th className="py-3 px-4">Savings Badge</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-white"
                    />
                    <div>
                      <div className="font-bold text-gray-900 line-clamp-1 max-w-xs">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase">{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 capitalize">
                  {p.categorySlug.replace("-", " & ")}
                </td>
                <td className="py-3 px-4 font-black text-brand-navy">
                  £{p.price.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {p.comparePrice ? (
                    <span>
                      {p.competitorName}: <del>£{p.comparePrice.toFixed(2)}</del>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 px-4">
                  {p.badge ? (
                    <span className="bg-brand-red/10 text-brand-red font-bold px-2 py-0.5 rounded text-[10px]">
                      {p.badge}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      p.stock > 15
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {p.stock} in stock
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="p-1.5 text-gray-500 hover:text-brand-navy rounded hover:bg-gray-100"
                      title="View live product"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
