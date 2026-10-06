import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, SlidersHorizontal, Tag, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop UK Hardware, DIY Supplies & Power Tools",
  description:
    "Explore our full catalogue of DIY tools, garden machinery, homewares, and electricals. Trade-quality brands, Amazon price matching, and free Click & Collect at Cowdenbeath.",
  alternates: {
    canonical: "https://bargainstore.uk/shop",
  },
  openGraph: {
    title: "Shop UK Hardware, DIY Supplies & Power Tools | BargainStore.uk",
    description:
      "Explore our full catalogue of DIY tools, garden machinery, homewares, and electricals with transparent Amazon price comparisons.",
    url: "https://bargainstore.uk/shop",
    siteName: "BargainStore.uk",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "BargainStore.uk — Shop Hardware & DIY Deals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop UK Hardware, DIY Supplies & Power Tools | BargainStore.uk",
    description:
      "Explore our full catalogue of DIY tools, garden machinery, homewares, and electricals.",
    images: ["/opengraph-image.png"],
  },
};

interface ShopPageProps {
  searchParams: Promise<{ q?: string; deals?: string; sort?: string; category?: string }>;
}

export const revalidate = 0;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q, deals, sort, category } = await searchParams;

  const [allProducts, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  let filtered = [...allProducts];

  // Search filter
  if (q) {
    const term = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.categorySlug.toLowerCase().includes(term)
    );
  }

  // Deals only filter
  if (deals === "true") {
    filtered = filtered.filter(
      (p) => (p.savingAmount && p.savingAmount > 0) || p.isDealOfTheDay === 1
    );
  }

  // Category filter
  if (category) {
    filtered = filtered.filter((p) => p.categorySlug === category);
  }

  // Sort
  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "saving") {
    filtered.sort((a, b) => (b.savingAmount || 0) - (a.savingAmount || 0));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-brand-navy">Shop All Products</span>
        {deals === "true" && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-red font-bold">Mega Savings Deals</span>
          </>
        )}
        {q && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800">Results for &quot;{q}&quot;</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="bg-brand-softBlue/60 border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
            Online Hardware Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-heading">
            {deals === "true" ? "Mega Savings & Price Drops" : q ? `Search: "${q}"` : "All Hardware & Homeware Products"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-1 leading-relaxed">
            Every product is backed by authentic UK brand warranties and our direct price comparison promise.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs text-xs font-semibold text-gray-700">
          <Tag className="w-4 h-4 text-brand-red" />
          <span>{filtered.length} Items Found</span>
        </div>
      </div>

      {/* Category Fast Filters */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href="/shop"
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            !category && !deals
              ? "bg-brand-navy text-white border-brand-navy"
              : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy"
          }`}
        >
          All Items ({allProducts.length})
        </Link>
        <Link
          href="/shop?deals=true"
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            deals === "true"
              ? "bg-brand-red text-white border-brand-red"
              : "bg-white text-brand-red border-red-200 hover:bg-red-50"
          }`}
        >
          🔥 Top Deals Only
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              category === c.slug
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Filter / Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-200 text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Showing <strong>{filtered.length}</strong> items</span>
        </div>

        {/* Sort links */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Sort by:</span>
          <Link
            href={`/shop?${q ? `q=${q}&` : ""}${category ? `category=${category}&` : ""}${deals ? `deals=${deals}&` : ""}sort=saving`}
            className={`px-2.5 py-1 rounded font-medium ${
              sort === "saving" ? "bg-brand-navy text-white" : "hover:text-brand-navy"
            }`}
          >
            Biggest Savings
          </Link>
          <Link
            href={`/shop?${q ? `q=${q}&` : ""}${category ? `category=${category}&` : ""}${deals ? `deals=${deals}&` : ""}sort=price-asc`}
            className={`px-2.5 py-1 rounded font-medium ${
              sort === "price-asc" ? "bg-brand-navy text-white" : "hover:text-brand-navy"
            }`}
          >
            Price: Low to High
          </Link>
          <Link
            href={`/shop?${q ? `q=${q}&` : ""}${category ? `category=${category}&` : ""}${deals ? `deals=${deals}&` : ""}sort=price-desc`}
            className={`px-2.5 py-1 rounded font-medium ${
              sort === "price-desc" ? "bg-brand-navy text-white" : "hover:text-brand-navy"
            }`}
          >
            Price: High to Low
          </Link>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-base font-bold text-gray-800">No products match your criteria</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Try clearing filters or search for another keyword.</p>
          <Link
            href="/shop"
            className="px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-lg"
          >
            Reset Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
