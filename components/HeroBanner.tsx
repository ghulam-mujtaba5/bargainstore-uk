import React from "react";
import Link from "next/link";
import { ArrowRight, Tag, ShieldCheck, ChevronRight } from "lucide-react";

export default function HeroBanner() {
  const departmentButtons = [
    { name: "Food Preparation", href: "/category/electricals?sub=Small+Kitchen+Appliances" },
    { name: "Cookware", href: "/category/housewares?sub=Cookware+%26+Bakeware" },
    { name: "Dining", href: "/category/housewares?sub=Tableware+%26+Dining" },
    { name: "Storage & Organisation", href: "/category/housewares?sub=Storage+%26+Organisation" },
  ];

  const quickLinks = [
    { name: "Paints & Emulsions", href: "/category/diy-decorating?sub=Paint+%26+Varnish" },
    { name: "Power Tools", href: "/category/diy-decorating?sub=Power+Tools" },
    { name: "Air Fryers", href: "/category/electricals?sub=Small+Kitchen+Appliances" },
    { name: "Pressure Washers", href: "/category/garden-growing?sub=Garden+Power+Tools" },
    { name: "Rotary Airers", href: "/category/laundry-utility?sub=Clothing+Care" },
    { name: "Cookware Sets", href: "/category/housewares?sub=Cookware+%26+Bakeware" },
  ];

  return (
    <div className="w-full bg-[#f4f6f8] pt-4 pb-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 space-y-5">
        {/* Real Autumn Hardware Hero Graphic (Direct from Home Hardware Direct) */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
          <Link href="/shop" className="block relative group">
            <img
              src="/assets/banners/hero-banner.webp"
              alt="DIY, Garden, Tools & Housewares - Autumn Essentials at Bargain Prices"
              className="w-full h-auto object-cover max-h-[460px] group-hover:scale-[1.008] transition-transform duration-500"
              fetchPriority="high"
            />
          </Link>
        </div>

        {/* Managed Section Title & Category Buttons (Exact replica of Home Hardware Direct) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight">
                DIY, Garden, Tools & Housewares
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                DIY, small kitchen appliances and autumn essentials at verified trade & bargain prices.
              </p>
            </div>

            {/* 4 Solid Orange Category Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {departmentButtons.map((btn, i) => (
                <Link
                  key={i}
                  href={btn.href}
                  className="px-4 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>{btn.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 py-2.5 px-4 shadow-2xs overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider mr-2 hidden sm:inline">
              Popular Right Now:
            </span>
            {quickLinks.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="px-3 py-1 bg-gray-50 hover:bg-brand-navy hover:text-white text-gray-700 text-xs font-semibold rounded-full border border-gray-200 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
