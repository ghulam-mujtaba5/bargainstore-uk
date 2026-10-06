"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Database,
  ExternalLink,
  Store,
  FolderTree,
  Menu,
  X,
  Shield,
  Layers,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  onLogout?: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    {
      name: "Dashboard Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
      color: "text-amber-400",
    },
    {
      name: "Products Catalog",
      href: "/admin/products",
      icon: Package,
      exact: true,
      color: "text-blue-400",
    },
    {
      name: "Add New Product",
      href: "/admin/products/new",
      icon: PlusCircle,
      exact: false,
      color: "text-emerald-400",
    },
    {
      name: "Customer Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      exact: false,
      color: "text-orange-400",
    },
    {
      name: "Departments & Categories",
      href: "/admin/categories",
      icon: FolderTree,
      exact: false,
      color: "text-indigo-400",
    },
    {
      name: "Turso DB Manager",
      href: "/admin/turso",
      icon: Database,
      exact: false,
      color: "text-purple-400",
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <div className="md:hidden bg-brand-navyDark border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-yellow text-brand-navy flex items-center justify-center font-black text-sm shadow-xs">
            B
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
              <span>BargainStore</span>
              <span className="text-[10px] bg-brand-yellow/20 text-brand-yellow px-1.5 py-0.2 rounded font-semibold uppercase">
                Admin
              </span>
            </div>
            <div className="text-[10px] text-gray-400">Turso Edge Database</div>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
          className="p-2 text-gray-300 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Main Sidebar (Desktop fixed, Mobile overlay drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-64 bg-brand-navyDark text-white flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-white/10 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Admin Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-yellow text-brand-navy flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform">
                B
              </div>
              <div>
                <div className="font-black text-sm leading-tight text-white flex items-center gap-1.5">
                  <span>BargainStore</span>
                  <span className="text-[9px] bg-brand-yellow text-brand-navy px-1.5 py-0.5 rounded-full font-black uppercase">
                    Admin
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Shield className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Turso Edge Live</span>
                </div>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Management Portal
            </div>

            {navLinks.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                    active
                      ? "bg-white/15 text-white font-bold shadow-xs border-l-4 border-brand-yellow pl-2.5"
                      : "text-gray-300 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? "text-brand-yellow" : item.color
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-2 text-xs">
          <a
            href="https://app.turso.tech/ghulam--mujtaba"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/5"
          >
            <div className="flex items-center gap-2 truncate">
              <Database className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="truncate">Turso Cloud Console</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          </a>

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
          >
            <Store className="w-4 h-4 text-brand-yellow flex-shrink-0" />
            <span>&larr; View Live Storefront</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              if (onLogout) {
                onLogout();
              } else {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium text-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
