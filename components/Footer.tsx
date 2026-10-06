"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ShieldCheck, Heart, Store, ExternalLink, Truck, RotateCcw } from "lucide-react";

export default function Footer() {
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
    <footer className="w-full bg-brand-navyDark text-gray-300 pt-12 pb-8 border-t border-brand-navy">
      {/* Real Brand Logos Showcase Strip (Extracted from reference site) */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-white/10">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Our Hero Brands — Trusted Quality At Unbeatable UK Prices
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 items-center">
          {brandLogos.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3 flex items-center justify-center hover:scale-105 transition-transform shadow-xs h-16 sm:h-20"
            >
              <img
                src={b.src}
                alt={b.name}
                className="max-h-12 max-w-full object-contain filter contrast-125"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Signup Strip */}
      <div className="max-w-7xl mx-auto px-4 py-10 border-b border-white/10 grid md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6">
          <h3 className="text-xl font-bold text-white mb-1">
            Keep Updated With Exclusive Bargains
          </h3>
          <p className="text-xs text-gray-400">
            Sign up to receive weekly price drop notifications, seasonal DIY guides, and exclusive discount voucher codes.
          </p>
        </div>
        <div className="md:col-span-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing to Bargainstore.uk deals!");
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              required
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-brand-yellow"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-navy font-bold text-xs rounded-lg transition-colors flex-shrink-0"
            >
              Sign Up
            </button>
          </form>
          <div className="text-[10px] text-gray-500 mt-1">
            By signing up you agree to our Privacy Policy. Unsubscribe anytime.
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-4">
            Shop Departments
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/category/garden-growing" className="hover:text-brand-yellow transition-colors">
                Garden & Growing
              </Link>
            </li>
            <li>
              <Link href="/category/outdoor-living" className="hover:text-brand-yellow transition-colors">
                Outdoor Living & BBQs
              </Link>
            </li>
            <li>
              <Link href="/category/diy-decorating" className="hover:text-brand-yellow transition-colors">
                DIY & Decorating
              </Link>
            </li>
            <li>
              <Link href="/category/electricals" className="hover:text-brand-yellow transition-colors">
                Electricals & Appliances
              </Link>
            </li>
            <li>
              <Link href="/category/housewares" className="hover:text-brand-yellow transition-colors">
                Housewares & Cookware
              </Link>
            </li>
            <li>
              <Link href="/category/laundry-utility" className="hover:text-brand-yellow transition-colors">
                Laundry & Utility
              </Link>
            </li>
            <li>
              <Link href="/shop?deals=true" className="text-brand-red hover:underline font-bold">
                Mega Clearance Deals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-4">
            Customer Help
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/help" className="hover:text-brand-yellow transition-colors">
                Help & Contact Us
              </Link>
            </li>
            <li>
              <Link href="/help#delivery" className="hover:text-brand-yellow transition-colors">
                Delivery Information
              </Link>
            </li>
            <li>
              <Link href="/help#returns" className="hover:text-brand-yellow transition-colors">
                30-Day Easy Returns
              </Link>
            </li>
            <li>
              <Link href="/help#click-collect" className="hover:text-brand-yellow transition-colors">
                Click & Collect Stores
              </Link>
            </li>
            <li>
              <Link href="/basket" className="hover:text-brand-yellow transition-colors">
                View Shopping Basket
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-amber-400 font-semibold hover:underline">
                Store Admin Portal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-4">
            About BargainStore
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-brand-yellow transition-colors">
                About BargainStore.uk
              </Link>
            </li>
            <li>
              <Link href="/ideas-advice" className="hover:text-brand-yellow transition-colors">
                DIY Ideas & Advice Guides
              </Link>
            </li>
            <li>
              <Link href="/help#price-promise" className="hover:text-brand-yellow transition-colors">
                Amazon Price Promise
              </Link>
            </li>
            <li>
              <Link href="/help#community" className="hover:text-brand-yellow transition-colors">
                High Street Support
              </Link>
            </li>
            <li>
              <Link href="/admin/turso" className="text-gray-400 hover:text-white">
                Turso Edge DB Info
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-4">
            Payment & Trust
          </h4>
          <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
            All orders processed through 256-Bit SSL Encrypted checkout. Fast UK dispatch with Royal Mail Tracked 48 and DPD Express couriers. 30-Day Money-Back Guarantee.
          </p>

          {/* Real Payment Method Badges (from Home Hardware Direct) */}
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

          <div className="space-y-1.5 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>Buyer Protection Guaranteed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-yellow" />
              <span>Royal Mail Tracked 48 & DPD Express</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>30-Day Returns & Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Legal */}
      <div className="max-w-7xl mx-auto px-4 pt-6 mt-4 border-t border-white/10 text-[11px] text-gray-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div>
            © {new Date().getFullYear()} BargainStore.uk Ltd. All rights reserved. Registered in the UK.
          </div>
          <div className="text-[10px] text-gray-400">
            Company No. 14285910 | VAT Reg: GB 412 8901 23
          </div>
          <div className="text-[10px] text-gray-500">
            Registered Office: BargainStore UK Ltd, 100 High Street, Birmingham, B1 1AA, United Kingdom
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-gray-400">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-gray-400">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
