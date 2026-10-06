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
  ChevronRight,
} from "lucide-react";

export const revalidate = 0; // Ensure fresh data from Turso

export default async function HomePage() {
  const [categories, featuredProducts, staffPicks] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(),
    getStaffPicks(),
  ]);

  const brandLogos = [
    { name: "Black+Decker", src: "/assets/brands/black-decker.webp" },
    { name: "Stanley", src: "/assets/brands/stanley.webp" },
    { name: "Hozelock", src: "/assets/brands/hozelock.webp" },
    { name: "Flymo", src: "/assets/brands/flymo.webp" },
    { name: "Tower", src: "/assets/brands/tower.webp" },
    { name: "Joseph Joseph", src: "/assets/brands/joseph-joseph.webp" },
  ];

  return (
    <div className="space-y-10 md:space-y-12 pb-16">
      {/* 1. Hero Banner with real graphic and orange department buttons */}
      <HeroBanner />

      {/* 2. Value Proposition Trust Banner */}
      <USPBanner />

      {/* 3. Shop by Category (Shop by Department) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
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
            className="text-xs font-bold text-brand-navy hover:text-[#e30613] flex items-center gap-1 group"
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
              <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                <img
                  src={cat.image || `/assets/categories/${cat.slug}.webp`}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-white">
                <h3 className="text-xs sm:text-sm font-bold text-brand-heading group-hover:text-brand-navy transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-gray-500 font-medium">
                  {cat.itemCount} Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Real Promotional Banners (Exact Home Hardware Direct assets) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-12 gap-5 items-stretch">
          {/* Main Banner: Strata Heavy Duty 5-Tier Shelving Unit */}
          <div className="md:col-span-8 flex flex-col">
            <Link
              href="/product/heavy-duty-5-tier-garage-shelving-unit"
              className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 bg-white h-full relative"
            >
              <img
                src="/assets/banners/strata-shelving.webp"
                alt="Strata Heavy Duty Shelving Unit Was £34.99 Now £29.99"
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Side Banners: Clearance + Special Offers */}
          <div className="md:col-span-4 flex flex-col gap-5 justify-between">
            {/* Real Clearance Banner */}
            <Link
              href="/shop?deals=true"
              className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 bg-white relative flex-1"
            >
              <img
                src="/assets/banners/clearance.webp"
                alt="Clearance, when it's gone it's gone"
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
              />
            </Link>

            {/* Special Offers Trade Deal Card */}
            <Link
              href="/shop?deals=true"
              className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 bg-gradient-to-br from-[#00205c] to-[#003882] text-white p-5 sm:p-6 relative flex-1 flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#ffd100] text-[#00205c] text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block mb-2">
                  Special Offers
                </span>
                <h3 className="text-xl font-black text-white leading-tight">
                  Autumn Savings Event
                </h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  Huge discounts on power tools, garden machinery, heating & home essentials.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#ffd100]">
                <span>Shop Special Offers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. "Big Brands, Big Savings" (Signature Home Hardware Direct feature) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#f2f6fa] border border-blue-100 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#e30613] mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Price Match Guaranteed</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-brand-heading">
                Big Brands, Big Savings
              </h2>
              <p className="text-xs text-brand-slate max-w-2xl mt-1 leading-relaxed">
                We check our prices daily against Amazon UK, B&Q, Argos and Screwfix. Where we are cheaper, we show you exactly how much you save. No inflated RRPs, just honest British hardware prices.
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

      {/* 6. "Our Hero Brands" Grid (Real Logos extracted from reference site) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
            Official UK Stockist
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-brand-heading">
            Our Hero Brands
          </h2>
          <p className="text-xs text-gray-500 max-w-xl mx-auto mt-1">
            We stock leading British and global hardware brands including Flymo, Black+Decker, Stanley, Hozelock, Tower, and Joseph Joseph.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {brandLogos.map((brand, i) => (
            <Link
              key={i}
              href={`/shop?brand=${encodeURIComponent(brand.name)}`}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center hover:border-brand-navy hover:shadow-md transition-all group h-24"
            >
              <img
                src={brand.src}
                alt={brand.name}
                className="max-h-12 max-w-full object-contain filter group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Staff Picks & Bestsellers */}
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
            className="text-xs font-bold text-brand-navy hover:text-[#e30613] flex items-center gap-1 group"
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

      {/* 8. Editorial Guides ("Ideas & Advice") */}
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
            className="text-xs font-bold text-brand-navy hover:text-[#e30613] flex items-center gap-1 group"
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
              <span className="text-[10px] font-bold text-[#e30613] uppercase tracking-wider">
                DIY & Decorating
              </span>
              <h3 className="text-base font-bold text-brand-heading group-hover:text-brand-navy">
                25 DIY Jobs to Do in October: The Ultimate Autumn Home Maintenance Checklist
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                Prepare your roof, gutters, radiators and garden for colder temperatures before winter freezes hit.
              </p>
              <Link
                href="/ideas-advice"
                className="text-xs font-bold text-brand-navy hover:text-[#e30613] inline-flex items-center gap-1 pt-1"
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
              <span className="text-[10px] font-bold text-[#e30613] uppercase tracking-wider">
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
                className="text-xs font-bold text-brand-navy hover:text-[#e30613] inline-flex items-center gap-1 pt-1"
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
              <span className="text-[10px] font-bold text-[#e30613] uppercase tracking-wider">
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
                className="text-xs font-bold text-brand-navy hover:text-[#e30613] inline-flex items-center gap-1 pt-1"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Support The High Street Narrative */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-brand-navy text-white rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-3">
              <span className="bg-[#ffd100] text-brand-navy text-xs font-black uppercase px-2.5 py-1 rounded-full inline-block">
                Support The High Street
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                The UK&apos;s Online Hardware Store — Backed by Independent Local Shops
              </h2>
              <p className="text-sm text-gray-200 leading-relaxed">
                When you order with BargainStore.uk, your purchases support a network of independent local hardware merchants. We combine the low prices and massive selection of an online giant with the friendly community ethos and reliable advice of your local high street shop.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-gray-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ffd100]" />
                  Free Local Click & Collect from 300+ Stores
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ffd100]" />
                  Fast UK Doorstep Dispatch (Royal Mail & DPD)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ffd100]" />
                  Friendly British Customer Service
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <Store className="w-12 h-12 text-[#ffd100] mb-2" />
              <div className="text-lg font-bold">Find Your Nearest Store</div>
              <p className="text-xs text-gray-300 mb-4 mt-1">
                Collect your orders in person for free with zero minimum spend.
              </p>
              <Link
                href="/shop"
                className="w-full py-2.5 bg-[#ffd100] hover:bg-[#e6bd00] text-brand-navy font-black text-xs rounded-lg transition-colors text-center"
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
