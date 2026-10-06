"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  ShoppingBag,
  Star,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Calculator,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Product } from "@/lib/types";
import { useAdminToast } from "./AdminToast";

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

const CATEGORIES = [
  { slug: "diy-decorating", label: "DIY & Decorating" },
  { slug: "garden-growing", label: "Garden & Growing" },
  { slug: "outdoor-living", label: "Outdoor Living" },
  { slug: "electricals", label: "Electricals" },
  { slug: "housewares", label: "Housewares" },
  { slug: "laundry-utility", label: "Laundry & Utility" },
];

const PRESET_BADGES = [
  "Clearance",
  "Special Buy",
  "Best Seller",
  "Price Drop",
  "Staff Pick",
  "Low Price Locked",
  "Save 25%",
];

const PRESET_COMPETITORS = ["Amazon", "B&Q", "Screwfix", "Argos", "Wickes"];

const SAMPLE_IMAGES = [
  { label: "Hardware Tool", url: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80" },
  { label: "Garden Tools", url: "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=600&auto=format&fit=crop&q=80" },
  { label: "Power Tool", url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80" },
  { label: "Paint & Decorating", url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80" },
  { label: "Kitchen Utensil", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80" },
];

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    categorySlug: initialData?.categorySlug || "diy-decorating",
    price: initialData?.price ? String(initialData.price) : "",
    comparePrice: initialData?.comparePrice ? String(initialData.comparePrice) : "",
    competitorName: initialData?.competitorName || "Amazon",
    badge: initialData?.badge || "",
    image: initialData?.image || "",
    stock: initialData?.stock !== undefined ? String(initialData.stock) : "25",
    description: initialData?.description || "",
    specs: initialData?.specs || "",
    isFeatured: Boolean(initialData?.isFeatured),
    isStaffPick: Boolean(initialData?.isStaffPick),
    isDealOfTheDay: Boolean(initialData?.isDealOfTheDay),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewTab, setPreviewTab] = useState<"form" | "preview">("form");

  // Computed savings calculation
  const numPrice = parseFloat(formData.price) || 0;
  const numCompare = parseFloat(formData.comparePrice) || 0;
  const hasSavings = numCompare > numPrice && numPrice > 0;
  const calculatedSavings = hasSavings ? numCompare - numPrice : 0;
  const savingsPercent = hasSavings ? Math.round((calculatedSavings / numCompare) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand.trim() || !formData.price) {
      setError("Product Title, Brand Name, and Price are required.");
      return;
    }

    if (numPrice <= 0) {
      setError("Price must be greater than £0.00.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const endpoint = isEdit ? `/api/products/${initialData?.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        categorySlug: formData.categorySlug,
        price: numPrice,
        comparePrice: numCompare > 0 ? numCompare : null,
        competitorName: formData.competitorName || "Amazon",
        badge: formData.badge.trim() || (hasSavings ? `Save £${calculatedSavings.toFixed(2)}` : null),
        image: formData.image.trim() || "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80",
        stock: parseInt(formData.stock, 10) || 0,
        description: formData.description.trim() || "Quality British hardware item.",
        specs: formData.specs.trim() || null,
        isFeatured: formData.isFeatured ? 1 : 0,
        isStaffPick: formData.isStaffPick ? 1 : 0,
        isDealOfTheDay: formData.isDealOfTheDay ? 1 : 0,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.product)) {
        showToast(
          isEdit ? `Product "${formData.name}" updated successfully!` : `Product "${formData.name}" published successfully!`,
          "success"
        );
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(data.error || "Failed to save product in Turso SQLite database.");
      }
    } catch (err: any) {
      setError("Network error while communicating with the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applySuggestedBadge = () => {
    if (savingsPercent > 0) {
      setFormData((prev) => ({ ...prev, badge: `Save ${savingsPercent}%` }));
    } else if (calculatedSavings > 0) {
      setFormData((prev) => ({ ...prev, badge: `Save £${calculatedSavings.toFixed(2)}` }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-brand-navy hover:underline flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products Catalog</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {isEdit ? `Edit Product: ${initialData?.name}` : "Add New Catalog Product"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isEdit
              ? "Update details, pricing, competitor comparisons, and stock in the Turso edge database."
              : "Create an authentic British hardware, DIY, or garden listing in Turso SQLite."}
          </p>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden bg-gray-200 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPreviewTab("form")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-all ${
              previewTab === "form" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600"
            }`}
          >
            Edit Form
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab("preview")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              previewTab === "preview" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form (left) + Live Store Preview (right) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div
          className={`lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-2xs ${
            previewTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Info */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-navy" />
                <span>Basic Product Information</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ronseal 5 Year Wood Stain Dark Oak 2.5L"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ronseal, Dulux, Stanley, Kärcher"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Department Category *
                  </label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Comparison */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Pricing & UK Competitor Comparison</span>
                </h2>
                {hasSavings && (
                  <button
                    type="button"
                    onClick={applySuggestedBadge}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    Auto-Badge: Save {savingsPercent}%
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    BargainStore Price (£) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="19.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Competitor Price (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="25.99 (Optional comparison)"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Competitor Name
                  </label>
                  <input
                    type="text"
                    placeholder="Amazon"
                    value={formData.competitorName}
                    onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />
                </div>
              </div>

              {/* Quick Competitor Presets */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-gray-400">Presets:</span>
                {PRESET_COMPETITORS.map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setFormData({ ...formData, competitorName: comp })}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      formData.competitorName === comp
                        ? "bg-brand-navy text-white border-brand-navy"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>

              {/* Savings Calculation Preview */}
              {hasSavings && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Customer saves £{calculatedSavings.toFixed(2)} ({savingsPercent}% cheaper than {formData.competitorName})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Badges & Stock */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-yellow" />
                <span>Inventory & Promotions</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Promotional Badge / Ribbon
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Save 20%, Best Seller, Clearance"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />

                  {/* Preset Badge Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PRESET_BADGES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormData({ ...formData, badge: b })}
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                          formData.badge === b
                            ? "bg-brand-red text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          stock: String(Math.max(0, (parseInt(prev.stock, 10) || 0) + 10)),
                        }))
                      }
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-brand-navy focus:ring-brand-navy"
                  />
                  <span className="font-semibold text-gray-800">Featured Item</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isStaffPick}
                    onChange={(e) => setFormData({ ...formData, isStaffPick: e.target.checked })}
                    className="rounded text-brand-navy focus:ring-brand-navy"
                  />
                  <span className="font-semibold text-gray-800">Staff Pick</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDealOfTheDay}
                    onChange={(e) => setFormData({ ...formData, isDealOfTheDay: e.target.checked })}
                    className="rounded text-brand-navy focus:ring-brand-navy"
                  />
                  <span className="font-semibold text-gray-800">Deal of the Day</span>
                </label>
              </div>
            </div>

            {/* Media & Details */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>Product Media & Descriptions</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />

                  {/* Sample Image Presets */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">Sample hardware images:</span>
                    {SAMPLE_IMAGES.map((img) => (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: img.url })}
                        className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed explanation of features, materials, coverage, and manufacturer specifications..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link
                href="/admin/products"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Turso...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEdit ? "Update Product" : "Publish to Catalog"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Storefront Card Preview (Right side) */}
        <div
          className={`lg:col-span-5 sticky top-20 space-y-4 ${
            previewTab === "form" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <Eye className="w-4 h-4 text-brand-navy" />
                <span>Live Storefront Card Preview</span>
              </div>
              <span className="text-[10px] bg-brand-yellow/30 text-brand-navy font-bold px-2 py-0.5 rounded-full">
                Interactive Preview
              </span>
            </div>

            {/* Mock Product Card rendered exactly like Customer Storefront */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-w-sm mx-auto">
              {/* Product Image Container */}
              <div className="relative aspect-square w-full bg-gray-50 p-6 flex items-center justify-center border-b border-gray-100">
                {formData.badge && (
                  <div className="absolute top-3 left-3 bg-brand-red text-white text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-xs z-10">
                    {formData.badge}
                  </div>
                )}

                {parseInt(formData.stock, 10) <= 5 && parseInt(formData.stock, 10) > 0 && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10">
                    Only {formData.stock} left!
                  </div>
                )}

                <img
                  src={
                    formData.image ||
                    "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={formData.name || "Preview Product"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80";
                  }}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {formData.brand || "BRAND NAME"}
                </div>

                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-2">
                  {formData.name || "Enter a product title..."}
                </h3>

                {/* Rating Stars Mock */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">(24)</span>
                </div>

                {/* Price & Competitor Comparison */}
                <div className="mt-auto pt-2 border-t border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-brand-navy">
                      £{numPrice.toFixed(2)}
                    </span>
                    {numCompare > numPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        £{numCompare.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {numCompare > numPrice && (
                    <div className="text-[11px] text-brand-green font-bold mt-0.5">
                      Save £{calculatedSavings.toFixed(2)} vs {formData.competitorName}
                    </div>
                  )}

                  <button
                    type="button"
                    className="w-full mt-3 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-brand-navy font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Basket</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-4">
              This card reflects exactly how shoppers will see this hardware listing on BargainStore.uk storefront and search pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
