import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Database,
  ExternalLink,
  Store,
  FolderTree,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-brand-navyDark text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-yellow text-brand-navy flex items-center justify-center font-black text-sm">
                B
              </div>
              <div>
                <div className="font-bold text-sm leading-tight text-white">BargainStore Admin</div>
                <div className="text-[10px] text-gray-400">Turso Edge Database</div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-yellow" />
              <span>Dashboard Overview</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Package className="w-4 h-4 text-blue-400" />
              <span>Products Catalog</span>
            </Link>

            <Link
              href="/admin/products/new"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-green-400" />
              <span>Add New Product</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span>Customer Orders</span>
            </Link>

            <Link
              href="/admin/turso"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Database className="w-4 h-4 text-purple-400" />
              <span>Turso DB Manager</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2 text-xs">
          <a
            href="https://app.turso.tech/ghulam--mujtaba"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <span>Turso Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>&larr; View Live Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
