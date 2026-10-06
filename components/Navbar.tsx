"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  Search,
  Store,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Tag,
  ArrowRight,
  Phone,
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
      subcategories: JSON.stringify(["Garden Power Tools", "Garden Tools", "Growing & Planting", "Watering", "Lawnmowers"]),
    },
    {
      slug: "outdoor-living",
      name: "Outdoor Living",
      subcategories: JSON.stringify(["Garden Furniture", "Barbecues & BBQs", "Garden Lighting", "Bird Care"]),
    },
    {
      slug: "diy-decorating",
      name: "DIY & Decorating",
      subcategories: JSON.stringify(["Paint & Varnish", "Decorating Tools", "Hand Tools", "Power Tools", "Sealants & Adhesives"]),
    },
    {
      slug: "electricals",
      name: "Electricals",
      subcategories: JSON.stringify(["Small Kitchen Appliances", "Heating & Cooling", "Lighting & Bulbs", "Batteries"]),
    },
    {
      slug: "housewares",
      name: "Housewares",
      subcategories: JSON.stringify(["Cookware & Bakeware", "Kitchen Utensils", "Tableware & Dining", "Storage & Organisation"]),
    },
    {
      slug: "laundry-utility",
      name: "Laundry & Utility",
      subcategories: JSON.stringify(["Cleaning Products", "Airers & Washing Lines", "Irons & Boards", "Bins & Waste"]),
    },
  ];

  return (
    <header className="w-full sticky top-0 z-40 shadow-md">
      {/* Tier 1: Utility Top Bar matching Home Hardware Direct */}
      <div className="bg-[#001642] text-xs text-gray-300 py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left store badge & delivery */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Store className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Local Store: <strong className="text-brand-yellow">High Street Hub</strong> (175 High St • Click &amp; Collect)</span>
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:inline text-gray-300">
              🚚 <strong>FREE UK Delivery</strong> on orders over £50
            </span>
          </div>

          {/* Right utility links */}
          <div className="flex items-center gap-4 text-gray-300">
            <div className="hidden lg:flex items-center gap-1.5 text-gray-300">
              <Phone className="w-3 h-3 text-brand-yellow" />
              <span>Order Line: <strong className="text-white">0800 123 4567</strong></span>
            </div>
            <span className="hidden lg:inline text-gray-500">|</span>
            <Link href="/help" className="hover:text-brand-yellow flex items-center gap-1 transition-colors">
              <HelpCircle className="w-3 h-3" />
              <span>Help & FAQs</span>
            </Link>
            <Link href="/ideas-advice" className="hover:text-brand-yellow hidden sm:inline transition-colors">
              Ideas & Advice
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 2: Deep Navy Main Header (Matches #00205c of reference site) */}
      <div className="bg-brand-navy py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo - Authentic Home Hardware style */}
          <Link href="/" className="flex items-center group flex-shrink-0">
            <div className="flex items-center">
              <div className="mr-2 flex flex-col items-center">
                <svg className="w-7 h-7 text-brand-yellow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.5L2 11h3v10h14V11h3L12 2.5zm0 4.2l5 4.3v7.5H7V11l5-4.3z" />
                </svg>
              </div>
              <div className="flex items-baseline">
                <span className="font-black text-2xl md:text-3xl tracking-tight text-white leading-none">
                  bargain<span className="text-brand-yellow font-black">store</span>
                </span>
                <span className="ml-1.5 bg-[#e30613] text-white text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
                  Direct
                </span>
              </div>
            </div>
          </Link>

          {/* Centered Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl mx-4 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
                placeholder="Search for products..."
                className="w-full pl-11 pr-24 py-2.5 text-sm bg-white text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder-gray-500 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-brand-navy hover:bg-brand-navyLight text-white rounded-full text-xs font-bold transition-colors"
                aria-label="Search"
              >
                Search
              </button>
            </form>

            {/* Autocomplete Popup */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                <div className="p-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
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

          {/* Right: Gold Basket Icon & Cart Trigger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 text-white hover:text-brand-yellow transition-colors group cursor-pointer"
              aria-label="View basket"
            >
              <div className="relative">
                <svg className="w-8 h-8 text-brand-yellow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand-red text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-navy shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block leading-tight">
                <div className="text-[11px] font-black uppercase tracking-wider text-brand-yellow">BASKET</div>
                <div className="text-xs font-black text-white">£{subtotal.toFixed(2)}</div>
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-brand-yellow rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-10 py-2 text-sm bg-white rounded-full text-gray-800 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2 text-brand-navy font-bold text-xs">
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Tier 3: Category Navigation Bar (Clean White container with Navy Uppercase links) */}
      <nav className="bg-white border-b border-gray-200 text-xs font-bold uppercase tracking-wide hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className="py-3 px-3.5 text-brand-navy hover:text-[#e30613] hover:border-b-2 hover:border-[#e30613] transition-colors inline-block"
            >
              HOME
            </Link>
            <Link
              href="/shop"
              className="py-3 px-3.5 text-brand-navy hover:text-[#e30613] hover:border-b-2 hover:border-[#e30613] transition-colors inline-block"
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
                    className="py-3 px-3 flex items-center gap-1 text-brand-navy hover:text-[#e30613] transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {subcats.length > 0 && activeDropdown === cat.slug && (
                    <div className="absolute left-0 top-full w-64 bg-white text-gray-800 shadow-2xl rounded-b-lg border-t-2 border-[#e30613] py-3 z-50">
                      <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Categories
                      </div>
                      <div className="divide-y divide-gray-100">
                        {subcats.map((sub, i) => (
                          <Link
                            key={i}
                            href={`/category/${cat.slug}?sub=${encodeURIComponent(sub)}`}
                            className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-softBlue hover:text-brand-navy transition-colors flex items-center justify-between"
                          >
                            <span>{sub}</span>
                            <ArrowRight className="w-3 h-3 opacity-40" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 px-4 border-t border-gray-100 bg-gray-50 py-2">
                        <Link
                          href={`/category/${cat.slug}`}
                          className="text-xs font-bold text-brand-navy hover:text-[#e30613] flex items-center gap-1"
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
              className="py-1.5 px-3 ml-2 bg-[#e30613] hover:bg-[#b00202] text-white rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-colors shadow-xs"
            >
              <Tag className="w-3 h-3" />
              <span>CLEARANCE DEALS</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-brand-navy">
            <span className="flex items-center gap-1 text-[#e30613]">
              <Sparkles className="w-3.5 h-3.5" />
              Price Match Promise
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001845] text-white px-4 py-4 space-y-3 border-t border-white/10">
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
          <div className="py-2 border-t border-white/10">
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
            🔥 Clearance Deals & Savings
          </Link>
        </div>
      )}
    </header>
  );
}
