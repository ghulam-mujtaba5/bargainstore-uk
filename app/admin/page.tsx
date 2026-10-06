import React from "react";
import Link from "next/link";
import { getAllProducts, getAllOrders } from "@/lib/data";
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
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([
    getAllProducts(),
    getAllOrders(),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= 15);
  const recentOrders = orders.slice(0, 5);

  const tursoUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
  const isCloud = tursoUrl.startsWith("libsql://") || tursoUrl.includes("turso.io");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Store Administration & Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your product inventory, customer orders, and Turso database connection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <a
            href="https://app.turso.tech/ghulam--mujtaba"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Turso Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-2xl font-black text-brand-navy">
            £{totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-gray-400">From {orders.length} total orders</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Customer Orders</span>
            <ShoppingCart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-brand-navy">
            {orders.length}
          </div>
          <span className="text-[11px] text-green-600 font-semibold">Active processing</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Products in Catalog</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-brand-navy">
            {products.length}
          </div>
          <span className="text-[11px] text-gray-400">Across 6 departments</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Turso Edge DB</span>
            <Database className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-black text-brand-navy truncate">
            {isCloud ? "Turso Cloud" : "Local SQLite"}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-brand-green font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Connected & Healthy</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Low Stock */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Recent Customer Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1"
            >
              <span>View All Orders ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono font-bold text-brand-navy">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900">{o.customerName}</div>
                      <div className="text-[10px] text-gray-400">{o.city}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{o.deliveryMethod}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">
                      £{o.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : o.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Inventory Warnings</span>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-brand-navy hover:underline font-semibold"
            >
              Catalog &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">All inventory levels are healthy.</p>
            ) : (
              lowStock.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{p.name}</h4>
                      <span className="text-[10px] text-gray-400">£{p.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[11px] flex-shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/products/new"
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg block text-center transition-colors"
            >
              + Create New Product Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
