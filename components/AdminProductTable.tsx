"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import {
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { useAdminToast } from "./AdminToast";

interface AdminProductTableProps {
  initialProducts: Product[];
}

export default function AdminProductTable({ initialProducts }: AdminProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Deletion state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick stock updating map
  const [stockUpdatingId, setStockUpdatingId] = useState<number | null>(null);

  const { showToast } = useAdminToast();

  // Metrics
  const totalCount = products.length;
  const lowStockCount = products.filter((p) => p.stock <= 15 && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const inStockCount = products.filter((p) => p.stock > 15).length;

  // Categories list extracted from data
  const categoriesList = useMemo(() => {
    const set = new Set(products.map((p) => p.categorySlug));
    return Array.from(set);
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          search.trim() === "" ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || p.categorySlug === selectedCategory;

        const matchesStock =
          stockFilter === "all"
            ? true
            : stockFilter === "in_stock"
            ? p.stock > 15
            : stockFilter === "low_stock"
            ? p.stock <= 15 && p.stock > 0
            : p.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "stock_asc") return a.stock - b.stock;
        if (sortBy === "stock_desc") return b.stock - a.stock;
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        return b.id - a.id; // newest
      });
  }, [products, search, selectedCategory, stockFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  // Quick Stock Adjustment
  const handleQuickStockChange = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;

    setStockUpdatingId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
        );
        showToast(`Stock for "${product.name}" updated to ${newStock}`, "info");
      } else {
        showToast("Failed to update stock quantity.", "error");
      }
    } catch {
      showToast("Error updating stock quantity.", "error");
    } finally {
      setStockUpdatingId(null);
    }
  };

  // Delete product action
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        showToast(`Product "${productToDelete.name}" deleted successfully.`, "success");
        setProductToDelete(null);
      } else {
        showToast("Failed to delete product from database.", "error");
      }
    } catch {
      showToast("Error communicating with database.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Products
            </div>
            <div className="text-2xl font-black text-brand-navy mt-0.5">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Healthy Stock (&gt;15)
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{inStockCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Low Stock Warnings
            </div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{lowStockCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Out of Stock
            </div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{outOfStockCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by title, brand, or code..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border-none text-xs text-gray-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">Healthy Stock (&gt;15)</option>
                <option value="low_stock">Low Stock (≤15)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>

              {/* Sorting */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs text-gray-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock_asc">Stock: Low to High</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <div>
              Showing <strong className="text-gray-900">{filteredProducts.length}</strong> matched{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
              {filteredProducts.length !== totalCount && ` (filtered from ${totalCount} total)`}
            </div>
            {(search || selectedCategory !== "all" || stockFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setStockFilter("all");
                }}
                className="text-brand-navy font-bold hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Our Price</th>
                <th className="py-3 px-4">Compare Price</th>
                <th className="py-3 px-4">Promo Badge</th>
                <th className="py-3 px-4">Inventory Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-gray-300" />
                    <div>No hardware products found matching your current filter criteria.</div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isUpdatingStock = stockUpdatingId === p.id;
                  const saving =
                    p.comparePrice && p.comparePrice > p.price
                      ? p.comparePrice - p.price
                      : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80";
                            }}
                            className="w-11 h-11 object-contain bg-gray-50 rounded-xl border border-gray-200 p-1 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-gray-900 truncate" title={p.name}>
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                              <span className="font-bold text-brand-navy uppercase">{p.brand}</span>
                              <span>•</span>
                              <span className="font-mono">ID: #{p.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-700 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium">
                          {p.categorySlug.replace(/-/g, " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-black text-brand-navy text-sm">
                        £{p.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        {p.comparePrice ? (
                          <div>
                            <span className="text-[11px] text-gray-400">
                              {p.competitorName || "Amazon"}:{" "}
                            </span>
                            <del className="font-semibold text-gray-500">
                              £{p.comparePrice.toFixed(2)}
                            </del>
                            {saving && (
                              <div className="text-[10px] text-emerald-600 font-bold">
                                -£{saving.toFixed(2)} off
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {p.badge ? (
                          <span className="inline-block bg-brand-red/10 text-brand-red border border-brand-red/20 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${
                              p.stock > 15
                                ? "bg-emerald-100 text-emerald-800"
                                : p.stock > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            <span>{p.stock} in stock</span>
                          </span>

                          {/* Quick Adjust Buttons */}
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleQuickStockChange(p, -1)}
                              disabled={p.stock <= 0 || isUpdatingStock}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30"
                              title="Decrease stock by 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleQuickStockChange(p, 5)}
                              disabled={isUpdatingStock}
                              className="p-1 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded disabled:opacity-30"
                              title="Increase stock by 5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            {isUpdatingStock && (
                              <Loader2 className="w-3 h-3 animate-spin text-brand-navy" />
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Product */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* View on Storefront */}
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-500 hover:text-brand-navy rounded-lg hover:bg-gray-100 transition-colors"
                            title="View on Customer Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Delete Product */}
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Product from Turso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-slate-50 flex items-center justify-between text-xs text-gray-600">
            <div>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-medium hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-medium hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Delete Product?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently remove{" "}
                <strong className="text-gray-800">"{productToDelete.name}"</strong> from the Turso
                SQLite database? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
