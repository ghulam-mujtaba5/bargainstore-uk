import React from "react";
import Link from "next/link";
import HeroBanner from "@/components/HeroBanner";
import USPBanner from "@/components/USPBanner";
import ProductCard from "@/components/ProductCard";
import {
  getAllCategories,
  getFeaturedProducts,
  getStaffPicks,
} from "@/lib/data";
import {
  ArrowRight,
  TrendingDown,
  Sparkles,
  Award,
  BookOpen,
  Store,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0; // Ensure fresh data from Turso

export default async function HomePage() {
  const [categories, featuredProducts, staffPicks] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(),
    getStaffPicks(),
  ]);

  // Featured deal for hero promo card
  const dealOfTheWeek = featuredProducts.find((p) => p.isDealOfTheDay === 1) || featuredProducts[0];

  return (
    <div className="space-y-10 md:space-y-14 pb-16">
      {/* 1. Hero Banner + Quick Filters */}
      <HeroBanner />

      {/* 2. Value Proposition Trust Banner */}
      <USPBanner />

      {/* 3. Shop by Category Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Explore Our Range
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-brand-heading">
              Shop by Department
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-brand-navy hover:text-brand-red flex items-center gap-1 group"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand-navy hover:shadow-md transition-all flex flex-col text-center"
            >
              <div className="aspect-square bg-gray-50 overflow-hidden relative">
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="p-3">
                <h3 className="text-xs sm:text-sm font-bold text-brand-heading group-hover:text-brand-navy transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-gray-500">
                  {cat.itemCount} Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Three-Card Promo Showcase (Matches Home Hardware Direct layout) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Product of the Week */}
          <div className="bg-gradient-to-br from-brand-navy to-brand-navyDark text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md">
            <div className="space-y-2">
              <span className="bg-brand-yellow text-brand-navy text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
                Product of the Week
              </span>
              <h3 className="text-xl font-black leading-snug">
                Heavy Duty Garage Shelving
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Holds 875kg total. Snaps together without bolts. Amazon sells similar for £34.99+!
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 line-through block">Amazon: £34.99</span>
                <span className="text-2xl font-black text-brand-yellow">£27.99</span>
              </div>
              <Link
                href="/product/heavy-duty-5-tier-garage-shelving-unit"
                className="px-4 py-2 bg-white text-brand-navy font-bold text-xs rounded-lg hover:bg-brand-yellow transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Card 2: Autumn Home Fixes */}
          <div className="bg-gradient-to-br from-amber-700 to-amber-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md">
            <div className="space-y-2">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
                Seasonal Advice
              </span>
              <h3 className="text-xl font-black leading-snug">
                Autumn Weatherproofing
              </h3>
              <p className="text-xs text-amber-100 leading-relaxed">
                Seal cracks, draught-proof doors, and protect exterior woodwork before winter sets in.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/ideas-advice"
                className="px-4 py-2 bg-white text-amber-950 font-bold text-xs rounded-lg hover:bg-brand-yellow transition-colors inline-block"
              >
                Read 25 DIY Autumn Tips &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Big Brand Clearance */}
          <div className="bg-gradient-to-br from-brand-red to-red-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md">
            <div className="space-y-2">
              <span className="bg-white text-brand-red text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
                When It&apos;s Gone, It&apos;s Gone
              </span>
              <h3 className="text-xl font-black leading-snug">
                Power Tools & Paint Clearance
              </h3>
              <p className="text-xs text-red-100 leading-relaxed">
                Up to 40% off Dulux, Black+Decker, and Kärcher end-of-line stock.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/shop?deals=true"
                className="px-4 py-2 bg-white text-brand-red font-bold text-xs rounded-lg hover:bg-brand-yellow hover:text-brand-navy transition-colors inline-block"
              >
                View Clearance Range &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "Big Brands, Big Savings" Section (Signature feature) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-brand-softBlue/40 border border-blue-100 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-red mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Price Match Guaranteed</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-brand-heading">
                Big Brands, Big Savings
              </h2>
              <p className="text-xs text-brand-slate max-w-2xl mt-1 leading-relaxed">
                We genuinely check our prices against Amazon, B&Q, and Screwfix. Where we are cheaper, we show you exactly how much you save. No fake markups, just honest British hardware prices.
              </p>
            </div>

            <Link
              href="/shop?deals=true"
              className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>See All Bargain Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-6 text-center text-[11px] text-gray-500">
            * Competitor prices checked regularly against Amazon UK and national trade counters. Prices correct at time of publish.
          </div>
        </div>
      </section>

      {/* 6. Staff Picks & Bestsellers */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Recommended by British Tradespeople
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-brand-heading">
              Staff Picks & Customer Favourites
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-brand-navy hover:text-brand-red flex items-center gap-1 group"
          >
            <span>Browse More</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {staffPicks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Editorial Guides ("Ideas & Advice") */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Guides, Inspiration & How-To
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-brand-heading">
              Ideas & Advice
            </h2>
          </div>
          <Link
            href="/ideas-advice"
            className="text-xs font-bold text-brand-navy hover:text-brand-red flex items-center gap-1 group"
          >
            <span>View All Guides</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80"
                alt="Autumn DIY Checklist"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">
                Home Maintenance
              </span>
              <h3 className="text-base font-bold text-brand-heading group-hover:text-brand-navy">
                25 DIY Jobs to Do in Autumn: The Ultimate Home Maintenance Checklist
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                Prepare your roof, gutters, radiators and garden for colder temperatures before winter freezes hit.
              </p>
              <Link
                href="/ideas-advice"
                className="text-xs font-bold text-brand-navy hover:text-brand-red inline-flex items-center gap-1 pt-1"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80"
                alt="Painting a Room Properly"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">
                Painting & Decorating
              </span>
              <h3 className="text-base font-bold text-brand-heading group-hover:text-brand-navy">
                DIY Decorating Guide: Everything You Need to Paint a Room Properly
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                From masking tape and sugar soap to roller nap selection and cutting in like a professional painter.
              </p>
              <Link
                href="/ideas-advice"
                className="text-xs font-bold text-brand-navy hover:text-brand-red inline-flex items-center gap-1 pt-1"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80"
                alt="Fill Fix and Seal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">
                Repairs & Insulation
              </span>
              <h3 className="text-base font-bold text-brand-heading group-hover:text-brand-navy">
                How to Fill, Fix & Seal Your Home Before Winter: Cracks, Gaps and Draughts
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                Stop draughts, eliminate heat leaks and lower energy bills with simple silicone sealants and expanding foam.
              </p>
              <Link
                href="/ideas-advice"
                className="text-xs font-bold text-brand-navy hover:text-brand-red inline-flex items-center gap-1 pt-1"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. High Street Support & Heritage Narrative */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-brand-navy text-white rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-3">
              <span className="bg-brand-yellow text-brand-navy text-xs font-black uppercase px-2.5 py-1 rounded-full inline-block">
                Support The High Street
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                The UK&apos;s Online Hardware Store — Backed by Independent Local Shops
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                When you order with BargainStore.uk, your purchases support a network of independent local hardware merchants. We combine the low prices and massive selection of an online giant with the friendly community ethos and reliable advice of your local high street shop.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-gray-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow" />
                  Free Local Click & Collect
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow" />
                  Fast UK Doorstep Dispatch
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow" />
                  Friendly British Customer Service
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <Store className="w-12 h-12 text-brand-yellow mb-2" />
              <div className="text-lg font-bold">Find Your Nearest Store</div>
              <p className="text-xs text-gray-300 mb-4 mt-1">
                Collect your orders in person for free with zero minimum spend.
              </p>
              <Link
                href="/shop"
                className="w-full py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-navy font-bold text-xs rounded-lg transition-colors text-center"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
