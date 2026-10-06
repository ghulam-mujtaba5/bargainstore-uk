import React from "react";
import Link from "next/link";
import { ShieldCheck, Store, Truck, Tag, Award, Users, Phone, Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "About Us | BargainStore.uk",
  description: "Learn about BargainStore.uk — backing UK high street hardware shops with honest online prices since 1983.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-brand-navy uppercase tracking-wider bg-brand-softBlue px-3 py-1 rounded-full">
          About BargainStore.uk
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-heading">
          Honest UK Hardware Bargains Backing Our High Streets
        </h1>
        <p className="text-sm sm:text-base text-brand-slate leading-relaxed">
          Since 1983, we have connected British homeowners, gardeners, and trade craftspeople with trusted hardware essentials at prices that beat major supermarkets and online marketplaces.
        </p>
      </div>

      {/* Core Values Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-softBlue text-brand-navy flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Guaranteed Low Prices</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            We track daily prices across Amazon UK, B&amp;Q, Screwfix, and Argos to ensure our shoppers always get unbeatable value without paying inflated delivery surcharges.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-softBlue text-brand-navy flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-gray-900">30+ Local High Street Hubs</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every order supports independent family-run hardware merchants across England, Scotland, and Wales through our free local Click &amp; Collect network.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-softBlue text-brand-navy flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Tracked UK Courier Delivery</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Fast dispatch 6 days a week via Royal Mail Tracked 24/48 and DPD Couriers. Free standard delivery on all qualifying UK orders over £50.
          </p>
        </div>
      </div>

      {/* Story & Heritage */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 space-y-6">
        <h2 className="text-xl font-black text-brand-heading">Our Heritage &amp; Mission</h2>
        <div className="prose prose-sm text-gray-700 space-y-4 max-w-none text-xs sm:text-sm leading-relaxed">
          <p>
            BargainStore.uk began as an independent Midlands trade counter providing nuts, bolts, timber fittings, and paints to local builders and homeowners. Over four decades, while retail giants pushed prices up and high street footfall down, we partnered with trusted brand manufacturers — including Stanley, Flymo, Black+Decker, Tower, and Hozelock — to keep trade-quality tools accessible to every household.
          </p>
          <p>
            Today, our digital platform combines warehouse direct prices with genuine high street customer service. Customers can order online for home delivery or pick up items within 2 hours at their neighborhood hardware merchant.
          </p>
        </div>
      </div>

      {/* Official Company Registration Details */}
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <ShieldCheck className="w-5 h-5 text-brand-green" />
          <h2 className="text-base font-bold text-gray-900">UK Registered Company Information</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-700">
          <div>
            <span className="font-semibold text-gray-900 block">Registered Company Name:</span>
            <span>BargainStore.uk Ltd</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">Company Registration Number:</span>
            <span>14285910 (Registered in England &amp; Wales)</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">VAT Registration Number:</span>
            <span>GB 412 8901 23</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">Registered Office:</span>
            <span>100 High Street, Birmingham, B1 1AA, United Kingdom</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 grid sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-navy" />
            <span>UK Customer Helpline: <strong>0800 123 4567</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-navy" />
            <span>Email Support: <strong>support@bargainstore.uk</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
