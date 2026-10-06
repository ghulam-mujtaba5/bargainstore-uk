import React from "react";
import Link from "next/link";
import { getAllProducts } from "@/lib/data";
import { PlusCircle, Search, Trash2, Edit, ExternalLink, Tag } from "lucide-react";
import AdminProductTable from "@/components/AdminProductTable";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products Catalog</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage product titles, prices, competitor comparison prices, stock levels, and badges stored in Turso.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      <AdminProductTable initialProducts={products} />
    </div>
  );
}
