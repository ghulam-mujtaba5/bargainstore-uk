"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Category } from "@/lib/types";

interface StorefrontShellProps {
  children: React.ReactNode;
  categories: Category[];
}

export default function StorefrontShell({
  children,
  categories,
}: StorefrontShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar categories={categories} />
      <CartDrawer />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </>
  );
}
