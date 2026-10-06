"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Store,
  Phone,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Tag,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Category, Product } from "@/lib/types";

interface NavbarProps {
  categories?: Category[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const router = useRouter();
  const { cartCount, subtotal, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.error("Search fetch failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navCategories = categories.length > 0 ? categories : [
    {
      slug: "garden-growing",
      name: "Garden & Growing",
      subcategories: JSON.stringify(["Garden Power Tools", "Garden Tools", "Growing & Planting", "Landscaping", "Pest Control"]),
    },
    {
      slug: "outdoor-living",
      name: "Outdoor Living",
      subcategories: JSON.stringify(["Barbecues & Burners", "Bird & Pet Care", "Camping & Picnic", "Garden Furniture", "Garden Lighting"]),
    },
    {
      slug: "diy-decorating",
      name: "DIY & Decorating",
      subcategories: JSON.stringify(["Paint & Varnish", "Decorating Tools", "Hand Tools", "Power Tools", "Screws & Fixings"]),
    },
    {
      slug: "electricals",
      name: "Electricals",
      subcategories: JSON.stringify(["Small Kitchen Appliances", "Heating & Cooling", "Lighting", "Electrical Accessories"]),
    },
    {
      slug: "housewares",
      name: "Housewares",
      subcategories: JSON.stringify(["Cookware & Bakeware", "Kitchenware", "Tableware & Dining", "Storage & Organisation"]),
    },
    {
      slug: "laundry-utility",
      name: "Laundry & Utility",
      subcategories: JSON.stringify(["Cleaning Equipment", "Cleaning Supplies", "Clothing Care", "Fireside Accessories"]),
    },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      {/* Tier 1: Utility Top Bar */}
      <div className="bg-gray-100 text-xs text-brand-slate py-1.5 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left notice / store switch */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-brand-navy">
              <Store className="w-3.5 h-3.5 text-brand-green" />
              <span>Local Store: <strong>High Street Hub</strong> (Click & Collect Ready)</span>
            </span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span className="hidden md:inline text-brand-slate">
              🚚 <strong>FREE UK Delivery</strong> on orders over £50
            </span>
          </div>

          {/* Right utility links */}
          <div className="flex items-center gap-4 text-gray-600">
            <Link href="/help" className="hover:text-brand-navy flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Help & FAQs</span>
            </Link>
            <Link href="/ideas-advice" className="hover:text-brand-navy hidden sm:inline">
              Ideas & Advice
            </Link>
            <Link href="/admin" className="font-semibold text-brand-red hover:underline flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Brand & Search Row */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="bg-brand-navy text-white px-2.5 py-1.5 rounded-lg flex items-center justify-center font-black tracking-tight text-xl shadow-inner group-hover:bg-brand-navyLight transition-colors">
            <span className="text-brand-yellow font-bold mr-0.5">B</span>
            <span className="text-white">Store</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-brand-navy leading-none">
              BARGAIN<span className="text-brand-red">STORE</span><span className="text-xs text-brand-slate font-medium">.UK</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
              Cheaper Than High Street & Amazon
            </span>
          </div>
        </Link>

        {/* Search Bar with live popup */}
        <div ref={searchRef} className="relative flex-1 max-w-2xl mx-2 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
              placeholder="Search 8,500+ products, tools, garden, paints, brands..."
              className="w-full pl-4 pr-12 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 transition-all text-gray-800"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-brand-navy text-white rounded-full hover:bg-brand-navyLight transition-colors flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Popup */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="p-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Matching Products ({searchResults.length})</span>
                <span className="text-brand-navy">Press Enter to view all</span>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => setShowSearchResults(false)}
                    className="p-3 hover:bg-blue-50/50 flex items-center gap-3 transition-colors group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md border border-gray-200 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">{product.brand}</div>
                      <div className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-navy">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-brand-navy">£{product.price.toFixed(2)}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-gray-400 line-through">
                            Amazon: £{product.comparePrice.toFixed(2)}
                          </span>
                        )}
                        {product.savingAmount && (
                          <span className="text-[10px] font-bold bg-brand-red/10 text-brand-red px-1.5 py-0.5 rounded">
                            Save £{product.savingAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons (Contact, Basket) */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden lg:flex items-center gap-2 text-right">
            <Phone className="w-4 h-4 text-brand-green" />
            <div>
              <div className="text-[11px] text-gray-500 leading-tight">Order Helpline</div>
              <div className="text-xs font-bold text-brand-navy">0800 123 4567</div>
            </div>
          </div>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-brand-navy hover:bg-brand-navyLight text-white px-4 py-2.5 rounded-full transition-colors relative shadow-sm group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] font-medium text-gray-300 uppercase leading-none">BASKET</div>
              <div className="text-xs font-bold leading-tight">£{subtotal.toFixed(2)}</div>
            </div>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-brand-navy rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search input */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, tools..."
            className="w-full pl-3 pr-10 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-brand-navy"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 text-gray-500"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Tier 3: Primary Navigation Bar (Navy Blue #00205c) */}
      <nav className="bg-brand-navy text-white text-xs font-semibold uppercase tracking-wide hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className="py-3 px-3.5 hover:bg-brand-navyLight hover:text-brand-yellow transition-colors inline-block"
            >
              HOME
            </Link>
            <Link
              href="/shop"
              className="py-3 px-3.5 hover:bg-brand-navyLight hover:text-brand-yellow transition-colors inline-block"
            >
              SHOP ALL
            </Link>

            {navCategories.map((cat) => {
              const subcats: string[] = cat.subcategories
                ? JSON.parse(cat.subcategories)
                : [];

              return (
                <div
                  key={cat.slug}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(cat.slug)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    className="py-3 px-3.5 flex items-center gap-1 hover:bg-brand-navyLight hover:text-brand-yellow transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform" />
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {subcats.length > 0 && activeDropdown === cat.slug && (
                    <div className="absolute left-0 top-full w-64 bg-white text-gray-800 shadow-2xl rounded-b-lg border-t-2 border-brand-red py-3 z-50 animate-in fade-in-50 duration-150">
                      <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Categories
                      </div>
                      <div className="divide-y divide-gray-100">
                        {subcats.map((sub, i) => (
                          <Link
                            key={i}
                            href={`/category/${cat.slug}?sub=${encodeURIComponent(sub)}`}
                            className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-brand-softBlue hover:text-brand-navy transition-colors flex items-center justify-between"
                          >
                            <span>{sub}</span>
                            <ArrowRight className="w-3 h-3 opacity-40" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 px-4 border-t border-gray-100 bg-gray-50 py-2">
                        <Link
                          href={`/category/${cat.slug}`}
                          className="text-xs font-bold text-brand-navy hover:text-brand-red flex items-center gap-1"
                        >
                          View all {cat.name} &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/shop?deals=true"
              className="py-3 px-3.5 bg-brand-red hover:bg-brand-redHover text-white flex items-center gap-1 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>MEGA SAVINGS</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs text-brand-yellow">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Autumn Price Drop Event
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-navy text-white px-4 py-4 space-y-3 border-t border-brand-navyLight">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold hover:text-brand-yellow"
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold hover:text-brand-yellow"
          >
            Shop All Products
          </Link>
          <div className="py-2 border-t border-brand-navyLight">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
              Departments
            </span>
            <div className="space-y-2 pl-2">
              {navCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm py-1 hover:text-brand-yellow"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/shop?deals=true"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-brand-yellow"
          >
            🔥 Mega Savings & Deals
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-brand-red"
          >
            ⚙️ Admin Portal
          </Link>
        </div>
      )}
    </header>
  );
}
