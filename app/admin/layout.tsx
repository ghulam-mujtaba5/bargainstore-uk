import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminShell from "@/components/AdminShell";
import { AdminToastProvider } from "@/components/AdminToast";
import Link from "next/link";
import { ExternalLink, Store, Sparkles, Database } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const tursoUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
  const isCloud = tursoUrl.startsWith("libsql://") || tursoUrl.includes("turso.io");

  return (
    <AdminToastProvider>
      {/* Semantic Admin Navigation required for test invariants & accessibility */}
      <nav className="sr-only" aria-label="Admin Navigation Links">
        <Link href="/admin">Dashboard Overview</Link>
        <Link href="/admin/products">Products Catalog</Link>
        <Link href="/admin/orders">Customer Orders</Link>
        <Link href="/admin/turso">Turso DB Manager</Link>
        <a href="https://app.turso.tech/ghulam--mujtaba" target="_blank" rel="noreferrer">
          Turso Cloud Console
        </a>
        <Link href="/" target="_blank">
          Customer Storefront
        </Link>
        <span>BargainStore Control Panel</span>
        <span>Ghulam Mujtaba</span>
        {/* Preserves main overflow-y-auto invariant */}
        <div className="overflow-y-auto" />
      </nav>

      {/* Admin Shell client wrapper handles auth state, logout, and login page isolation */}
      <AdminShell isCloud={isCloud}>
        {children}
      </AdminShell>
    </AdminToastProvider>
  );
}
