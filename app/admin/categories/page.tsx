import React from "react";
import Link from "next/link";
import { getAllCategories, getAllProducts } from "@/lib/data";
import {
  FolderTree,
  Package,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Wrench,
  Flower2,
  Flame,
  Zap,
  Home,
  Shirt,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
  ]);

  // Count products by category
  const countsByCat = products.reduce((acc, p) => {
    acc[p.categorySlug] = (acc[p.categorySlug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "diy-decorating":
        return <Wrench className="w-5 h-5 text-blue-600" />;
      case "garden-growing":
        return <Flower2 className="w-5 h-5 text-emerald-600" />;
      case "outdoor-living":
        return <Flame className="w-5 h-5 text-amber-600" />;
      case "electricals":
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case "housewares":
        return <Home className="w-5 h-5 text-purple-600" />;
      case "laundry-utility":
        return <Shirt className="w-5 h-5 text-cyan-600" />;
      default:
        return <Layers className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-indigo-600" />
            <span>Store Departments & Categories</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Overview of the 6 UK retail departments configured in Turso SQLite and their live inventory density.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>+ Add Product to Department</span>
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const liveCount = countsByCat[cat.slug] || 0;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-brand-navy border border-blue-100 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-brand-navy" />
                    <span>{liveCount} {liveCount === 1 ? "Product" : "Products"}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900">{cat.name}</h3>
                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                    Slug: /{cat.slug}
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {cat.description || "Authentic British high street hardware and homeware essentials."}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                <Link
                  href={`/admin/products`}
                  className="font-bold text-brand-navy hover:underline flex items-center gap-1"
                >
                  <span>Filter Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/category/${cat.slug}`}
                  target="_blank"
                  className="text-gray-400 hover:text-brand-navy flex items-center gap-1 font-medium transition-colors"
                  title="View on Customer Storefront"
                >
                  <span>Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Overview Card */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navyLight text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-brand-yellow font-bold text-xs uppercase tracking-wider">
              Department Architecture
            </span>
            <h2 className="text-xl font-bold mt-1 text-white">
              6 Core High Street Departments
            </h2>
            <p className="text-xs text-gray-300 max-w-xl mt-1 leading-relaxed">
              Every department is optimized for SEO taxonomy, breadcrumb navigation, and filter hierarchies across the UK storefront.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="px-5 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-navy font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            <span>Manage All Catalog Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
