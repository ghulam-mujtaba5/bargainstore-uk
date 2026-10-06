"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, PlusCircle } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    categorySlug: "diy-decorating",
    price: "",
    comparePrice: "",
    competitorName: "Amazon",
    image: "",
    stock: "25",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price) {
      setError("Name, Brand, and Price are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to create product in Turso DB.");
      }
    } catch (err: any) {
      setError("Network error while creating product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-xs text-brand-navy hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products Catalog</span>
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Add New Product</h1>
        <p className="text-xs text-gray-500 mt-1">
          Add an authentic British hardware or garden item to the Turso SQLite catalog.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-2xs">
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ronseal 5 Year Wood Stain Dark Oak 2.5L"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ronseal, Dulux, Stanley, Kärcher"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Department Category *</label>
            <select
              value={formData.categorySlug}
              onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy bg-white"
            >
              <option value="diy-decorating">DIY & Decorating</option>
              <option value="garden-growing">Garden & Growing</option>
              <option value="outdoor-living">Outdoor Living</option>
              <option value="electricals">Electricals</option>
              <option value="housewares">Housewares</option>
              <option value="laundry-utility">Laundry & Utility</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">BargainStore Price (£) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="19.99"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Competitor Compare Price (£)</label>
            <input
              type="number"
              step="0.01"
              placeholder="25.99 (Optional comparison)"
              value={formData.comparePrice}
              onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Competitor Name</label>
            <input
              type="text"
              placeholder="Amazon, B&Q, Argos, Screwfix"
              value={formData.competitorName}
              onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Initial Stock Quantity</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">Product Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
            <span className="text-[10px] text-gray-400">Leave blank to use a default quality hardware image.</span>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              placeholder="Detailed description of features, materials, and applications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving to Turso..." : "Publish Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
