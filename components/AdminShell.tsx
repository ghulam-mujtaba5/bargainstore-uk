"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import { ExternalLink, Store, LogOut } from "lucide-react";

export default function AdminShell({
  children,
  isCloud,
}: {
  children: React.ReactNode;
  isCloud: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {
      // ignore network errors on logout
    }
    router.push("/admin/login");
    router.refresh();
  };

  // If viewing the admin login page, don't show the dashboard layout chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Responsive Admin Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

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

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
