"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ShieldCheck,
  Heart,
  Store,
  ExternalLink,
  Truck,
  RotateCcw,
  MapPin,
  Clock,
  Phone,
  Navigation,
} from "lucide-react";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const brandLogos = [
    { name: "Black+Decker", src: "/assets/brands/black-decker.webp" },
    { name: "Stanley", src: "/assets/brands/stanley.webp" },
    { name: "Hozelock", src: "/assets/brands/hozelock.webp" },
    { name: "Flymo", src: "/assets/brands/flymo.webp" },
    { name: "Tower", src: "/assets/brands/tower.webp" },
    { name: "Joseph Joseph", src: "/assets/brands/joseph-joseph.webp" },
  ];

  const paymentMethods = [
    { name: "Visa", src: "/assets/payment/visa.webp" },
    { name: "Mastercard", src: "/assets/payment/mastercard.webp" },
    { name: "PayPal", src: "/assets/payment/paypal.webp" },
    { name: "Apple Pay", src: "/assets/payment/apple-pay.webp" },
    { name: "Google Pay", src: "/assets/payment/google-pay.webp" },
  ];

  return (
    <footer className="w-full bg-brand-navyDark text-gray-300 pt-10 sm:pt-12 pb-8 border-t border-brand-navy">
      {/* Real Brand Logos Showcase Strip */}
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:pb-10 border-b border-white/10">
        <div className="text-center mb-5 sm:mb-6">
          <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
            Our Hero Brands — Trusted Quality At Unbeatable UK Prices
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4 items-center">
          {brandLogos.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-2.5 sm:p-3 flex items-center justify-center hover:scale-105 transition-transform shadow-xs h-16 sm:h-20"
            >
              <img
                src={b.src}
                alt={b.name}
                className="max-h-10 sm:max-h-12 max-w-full object-contain filter contrast-125"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prominent High Street Flagship Store & Click & Collect Address Banner */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-white/10">
        <div className="bg-gradient-to-br from-brand-navy via-[#002266] to-[#001642] border-2 border-brand-yellow/40 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Address & Store Info */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wide">
                <Store className="w-3.5 h-3.5" />
                <span>Flagship UK Hardware Store &amp; High Street Hub</span>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-yellow text-brand-navy flex items-center justify-center shrink-0 shadow-md mt-0.5">
                  <MapPin className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-yellow uppercase tracking-wider">
                    Our Physical Address &amp; Trade Counter
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    175 High St, Cowdenbeath KY4 9QE
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                    Fife, Scotland • Free In-Store Click &amp; Collect in 2 Hours • Trade Counter &amp; DIY Showroom
                  </p>
                </div>
              </div>

              {/* Responsive Details Grid on Mobile/Tablet */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>
                    Mon–Sat: <strong className="text-white">8:00am – 6:00pm</strong> | Sun:{" "}
                    <strong className="text-white">10:00am – 4:00pm</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>
                    Call Store:{" "}
                    <a href="tel:08001234567" className="text-brand-yellow hover:underline font-bold">
                      0800 123 4567
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-Friendly Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
              <a
                href="https://www.google.com/maps/search/?api=1&query=175+High+St%2C+Cowdenbeath+KY4+9QE"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-brand-navy font-black text-sm transition-all shadow-md active:scale-95 text-center cursor-pointer"
              >
                <Navigation className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>Get Directions (Google Maps)</span>
              </a>
              <Link
                href="/help#click-collect"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all active:scale-95 text-center"
              >
                <Store className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>Click &amp; Collect Guide</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup Strip - Responsive for Mobile and Desktop */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 border-b border-white/10 grid md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Keep Updated With Exclusive Bargains
          </h3>
          <p className="text-xs text-gray-400">
            Sign up to receive weekly price drop notifications, seasonal DIY guides, and exclusive discount voucher codes.
          </p>
        </div>
        <div className="md:col-span-6">
          {subscribed ? (
            <div className="p-3 bg-brand-green/20 border border-brand-green/40 rounded-lg text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <span>✓ Thank you for subscribing! Check your inbox for weekly deal drops.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="email"
                placeholder="Enter your email address..."
                required
                className="flex-1 w-full px-4 py-3 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-brand-yellow"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-navy font-bold text-xs sm:text-sm rounded-lg transition-colors shrink-0"
              >
                Sign Up
              </button>
            </form>
          )}
          <div className="text-[10px] text-gray-500 mt-1.5">
            By signing up you agree to our Privacy Policy. Unsubscribe anytime.
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns - Mobile-Optimized Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-xs">
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
            Shop Departments
          </h4>
          <ul className="space-y-2.5 sm:space-y-2">
            <li>
              <Link href="/category/garden-growing" className="hover:text-brand-yellow transition-colors block py-0.5">
                Garden &amp; Growing
              </Link>
            </li>
            <li>
              <Link href="/category/outdoor-living" className="hover:text-brand-yellow transition-colors block py-0.5">
                Outdoor Living &amp; BBQs
              </Link>
            </li>
            <li>
              <Link href="/category/diy-decorating" className="hover:text-brand-yellow transition-colors block py-0.5">
                DIY &amp; Decorating
              </Link>
            </li>
            <li>
              <Link href="/category/electricals" className="hover:text-brand-yellow transition-colors block py-0.5">
                Electricals &amp; Appliances
              </Link>
            </li>
            <li>
              <Link href="/category/housewares" className="hover:text-brand-yellow transition-colors block py-0.5">
                Housewares &amp; Cookware
              </Link>
            </li>
            <li>
              <Link href="/category/laundry-utility" className="hover:text-brand-yellow transition-colors block py-0.5">
                Laundry &amp; Utility
              </Link>
            </li>
            <li>
              <Link href="/shop?deals=true" className="text-brand-red hover:underline font-bold block py-0.5">
                Mega Clearance Deals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
            Customer Help
          </h4>
          <ul className="space-y-2.5 sm:space-y-2">
            <li>
              <Link href="/help" className="hover:text-brand-yellow transition-colors block py-0.5">
                Help &amp; Contact Us
              </Link>
            </li>
            <li>
              <Link href="/help#delivery" className="hover:text-brand-yellow transition-colors block py-0.5">
                Delivery Information
              </Link>
            </li>
            <li>
              <Link href="/help#returns" className="hover:text-brand-yellow transition-colors block py-0.5">
                30-Day Easy Returns
              </Link>
            </li>
            <li>
              <Link href="/help#click-collect" className="hover:text-brand-yellow transition-colors block py-0.5 font-medium">
                Click &amp; Collect Stores
              </Link>
            </li>
            <li>
              <Link href="/basket" className="hover:text-brand-yellow transition-colors block py-0.5">
                View Shopping Basket
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-amber-400 font-semibold hover:underline block py-0.5">
                Store Admin Portal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
            About BargainStore
          </h4>
          <ul className="space-y-2.5 sm:space-y-2">
            <li>
              <Link href="/about" className="hover:text-brand-yellow transition-colors block py-0.5">
                About BargainStore.uk
              </Link>
            </li>
            <li>
              <Link href="/ideas-advice" className="hover:text-brand-yellow transition-colors block py-0.5">
                DIY Ideas &amp; Advice Guides
              </Link>
            </li>
            <li>
              <Link href="/help#price-promise" className="hover:text-brand-yellow transition-colors block py-0.5">
                Amazon Price Promise
              </Link>
            </li>
            <li>
              <Link href="/help#community" className="hover:text-brand-yellow transition-colors block py-0.5">
                High Street Support
              </Link>
            </li>
            <li>
              <a
                href="https://www.google.com/maps/search/?api=1&query=175+High+St%2C+Cowdenbeath+KY4+9QE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-yellow transition-colors block py-0.5"
              >
                Cowdenbeath Store Map ↗
              </a>
            </li>
            <li>
              <Link href="/admin/turso" className="text-gray-400 hover:text-white block py-0.5">
                Turso Edge DB Info
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
            Payment &amp; Trust
          </h4>
          <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
            All orders processed through 256-Bit SSL Encrypted checkout. Fast UK dispatch with Royal Mail Tracked 48 and DPD Express couriers. 30-Day Money-Back Guarantee.
          </p>

          {/* Real Payment Method Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {paymentMethods.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-md p-1 border border-gray-300 shadow-2xs flex items-center justify-center h-8 w-12"
              >
                <img
                  src={p.src}
                  alt={p.name}
                  className="max-h-6 max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
              <span>Buyer Protection Guaranteed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-yellow shrink-0" />
              <span>Royal Mail Tracked 48 &amp; DPD Express</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
              <span>30-Day Returns &amp; Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
              <MapPin className="w-4 h-4 text-brand-yellow shrink-0" />
              <span>Physical Store: Cowdenbeath KY4 9QE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Legal - Mobile Responsive Stack */}
      <div className="max-w-7xl mx-auto px-4 pt-6 mt-4 border-t border-white/10 text-xs text-gray-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="text-gray-300 font-medium">
            © {new Date().getFullYear()} BargainStore.uk Ltd. All rights reserved. Registered in the UK.
          </div>
          <div className="text-[11px] text-gray-400">
            Company No. 14285910 | VAT Reg: GB 412 8901 23
          </div>
          <div className="text-[11px] text-gray-300 font-medium flex flex-wrap items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-yellow shrink-0 inline" />
            <span>
              Registered Office: BargainStore UK Ltd,{" "}
              <strong>175 High St, Cowdenbeath KY4 9QE, United Kingdom</strong>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <Link href="/terms" className="hover:text-brand-yellow transition-colors py-1">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="hover:text-brand-yellow transition-colors py-1">
            Privacy Policy
          </Link>
          <Link href="/cookies" className="hover:text-brand-yellow transition-colors py-1">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
