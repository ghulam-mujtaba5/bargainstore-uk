import React from "react";
import Link from "next/link";
import { getAllProducts, getAllOrdersWithItems } from "@/lib/data";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Database,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  FolderTree,
  Edit3,
  Clock,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([
    getAllProducts(),
    getAllOrdersWithItems(),
  ]);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status !== "Cancelled" ? o.total : 0),
    0
  );
  const lowStock = products.filter((p) => p.stock <= 15);
  const processingOrders = orders.filter((o) => o.status === "Processing");
  const recentOrders = orders.slice(0, 5);

  const tursoUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
  const isCloud = tursoUrl.startsWith("libsql://") || tursoUrl.includes("turso.io");

  // Department counts
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.categorySlug] = (acc[p.categorySlug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
              Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Store Administration & Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your hardware inventory, fulfill customer orders, and supervise Turso edge database operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-brand-yellow" />
            <span>Add New Product</span>
          </Link>
          <a
            href="https://app.turso.tech/ghulam--mujtaba"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Turso Console</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/products"
          className="p-3 bg-white rounded-xl border border-gray-200 hover:border-brand-navy/30 hover:bg-slate-50/80 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">Product Catalog</div>
            <div className="text-[10px] text-gray-400">{products.length} listed items</div>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="p-3 bg-white rounded-xl border border-gray-200 hover:border-brand-navy/30 hover:bg-slate-50/80 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">Customer Orders</div>
            <div className="text-[10px] text-amber-600 font-semibold">{processingOrders.length} pending dispatch</div>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="p-3 bg-white rounded-xl border border-gray-200 hover:border-brand-navy/30 hover:bg-slate-50/80 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">Departments</div>
            <div className="text-[10px] text-gray-400">6 retail departments</div>
          </div>
        </Link>

        <Link
          href="/admin/turso"
          className="p-3 bg-white rounded-xl border border-gray-200 hover:border-brand-navy/30 hover:bg-slate-50/80 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">Turso Edge DB</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Healthy & connected</div>
          </div>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/orders"
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2 hover:border-brand-navy/30 transition-all block"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-navy">
            £{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400">
            From {orders.length} total customer orders
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2 hover:border-brand-navy/30 transition-all block"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Customer Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-navy">
            {orders.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{processingOrders.length} awaiting dispatch</span>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2 hover:border-brand-navy/30 transition-all block"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Catalog Items</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-navy">
            {products.length}
          </div>
          <div className="text-[11px] text-gray-400">
            Across 6 UK departments
          </div>
        </Link>

        <Link
          href="/admin/turso"
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2 hover:border-brand-navy/30 transition-all block"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Turso Edge DB</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand-navy truncate">
            {isCloud ? "Turso Cloud" : "Local SQLite"}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Connected & Operational</span>
          </div>
        </Link>
      </div>

      {/* Two Column Grid: Recent Orders (8 cols) & Low Stock (4 cols) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Customer Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Latest orders received from customer checkouts
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => {
                    const itemCount = o.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-brand-navy">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-gray-900">{o.customerName}</div>
                          <div className="text-[10px] text-gray-400">{o.city}</div>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {itemCount > 0 ? `${itemCount} items` : "—"}
                        </td>
                        <td className="py-3 px-3 font-bold text-brand-navy">
                          £{o.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href="/admin/orders"
                            className="text-[11px] font-bold text-brand-navy hover:underline"
                          >
                            Manage &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Inventory Warnings ({lowStock.length})</span>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-brand-navy hover:underline font-semibold"
            >
              All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                All inventory levels are healthy (&gt;15 units).
              </p>
            ) : (
              lowStock.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-xl flex items-center justify-between text-xs border border-gray-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image || "/assets/brands/flymo.webp"}
                      alt={p.name}
                      className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-white p-0.5 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 truncate" title={p.name}>
                        {p.name}
                      </h4>
                      <div className="text-[10px] text-gray-400 font-medium">
                        £{p.price.toFixed(2)} • {p.brand}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`font-black px-2 py-0.5 rounded-md text-[10px] ${
                        p.stock === 0
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Edit / Restock"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/admin/products/new"
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl block text-center transition-colors"
            >
              + Create New Product Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
