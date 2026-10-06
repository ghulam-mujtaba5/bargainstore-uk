import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { AdminToastProvider } from "@/components/AdminToast";
import Link from "next/link";
import { ExternalLink, Store, Sparkles, Database } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const tursoUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
  const isCloud = tursoUrl.startsWith("libsql://") || tursoUrl.includes("turso.io");

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
        {/* Responsive Admin Sidebar */}
        <AdminSidebar />

        {/* Semantic Admin Navigation */}
        <nav className="sr-only" aria-label="Admin Navigation Links">
          <Link href="/admin">Dashboard Overview</Link>
          <Link href="/admin/products">Products Catalog</Link>
          <Link href="/admin/orders">Customer Orders</Link>
          <Link href="/admin/turso">Turso DB Manager</Link>
          <a href="https://app.turso.tech/ghulam--mujtaba">Turso Cloud Console</a>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Admin Bar */}
          <header className="hidden md:flex h-14 bg-white border-b border-gray-200 px-6 items-center justify-between sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="font-semibold text-gray-800">BargainStore Control Panel</span>
              <span className="text-gray-300">/</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isCloud ? "Turso Cloud Edge" : "Local SQLite Edge"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-brand-navy bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-brand-navy" />
                <span>Customer Storefront</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>

              <div className="w-px h-5 bg-gray-200" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-navy text-brand-yellow font-bold text-xs flex items-center justify-center border border-brand-yellow/30">
                  GM
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-gray-900 leading-tight">Ghulam Mujtaba</div>
                  <div className="text-[10px] text-gray-400 leading-tight">Store Administrator</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
