import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Tag, Clock } from "lucide-react";

export default function HeroBanner() {
  const quickLinks = [
    { name: "Paints & Emulsions", href: "/category/diy-decorating?sub=Paint+%26+Varnish" },
    { name: "Power Tools", href: "/category/diy-decorating?sub=Power+Tools" },
    { name: "Air Fryers", href: "/category/electricals?sub=Small+Kitchen+Appliances" },
    { name: "Pressure Washers", href: "/category/garden-growing?sub=Garden+Power+Tools" },
    { name: "Rotary Airers", href: "/category/laundry-utility?sub=Clothing+Care" },
    { name: "Cookware Sets", href: "/category/housewares?sub=Cookware+%26+Bakeware" },
  ];

  return (
    <div className="w-full">
      {/* Main Hero Section */}
      <div className="relative bg-gradient-to-r from-brand-navyDark via-brand-navy to-brand-navyLight text-white py-12 md:py-16 px-4 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-yellow text-xs font-bold border border-brand-yellow/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autumn 2026 Price Drop Event</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              DIY, Garden, Tools & Housewares at Real Bargain Prices
            </h1>

            <p className="text-gray-200 text-sm sm:text-base max-w-xl leading-relaxed">
              Shop trusted British brands like <strong>Dulux, Stanley, Kärcher, and Black+Decker</strong> with verified savings against Amazon and high street retailers. Fast UK dispatch with FREE local Click & Collect.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="px-6 py-3.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-navy font-black text-sm rounded-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <span>Shop Autumn Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?deals=true"
                className="px-6 py-3.5 bg-brand-red hover:bg-brand-redHover text-white font-bold text-sm rounded-lg transition-all shadow-md inline-flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                <span>See Price Comparison Deals</span>
              </Link>
            </div>
          </div>

          {/* Hero Feature Box / Deal Callout */}
          <div className="md:col-span-5 hidden md:block">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-brand-yellow">
                  Why Shop BargainStore?
                </span>
                <span className="bg-brand-red text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                  100% Genuine Brands
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-yellow text-brand-navy flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-xs leading-normal">
                    <strong>Real Price Comparison:</strong> We check prices daily against Amazon, B&Q and Argos.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-yellow text-brand-navy flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-xs leading-normal">
                    <strong>Fast UK Courier Dispatch:</strong> Tracked Royal Mail & DPD deliveries to your doorstep.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-yellow text-brand-navy flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-xs leading-normal">
                    <strong>Community Backed:</strong> Supported by local independent hardware stores across the UK.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Filter Bar (Direct replica of Home Hardware Direct) */}
      <div className="bg-gray-100 border-b border-gray-200 py-2.5 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 hidden sm:inline">
            Popular Right Now:
          </span>
          {quickLinks.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="px-3.5 py-1.5 bg-white hover:bg-brand-navy hover:text-white text-gray-700 text-xs font-semibold rounded-full border border-gray-200 transition-colors shadow-2xs"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
