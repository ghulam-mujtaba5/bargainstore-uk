import React from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Settings, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | BargainStore.uk",
  description: "How BargainStore.uk uses essential, functional, and performance cookies under UK PECR.",
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="border-b border-gray-200 pb-6 space-y-2">
        <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
          Privacy &amp; Electronic Communications (PECR)
        </span>
        <h1 className="text-3xl font-black text-brand-heading">
          Cookie Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Last reviewed: October 2026. BargainStore.uk Ltd operates full transparency regarding browser storage.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
        {/* Intro */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-brand-navy" />
            <span>1. What Are Cookies &amp; Local Storage?</span>
          </h2>
          <p>
            Cookies and browser local storage technologies are small data files placed on your computer, tablet, or smartphone when you visit BargainStore.uk.
            They allow our website to remember your shopping basket, active promotional vouchers, and delivery preferences between pages and visits.
          </p>
        </section>

        {/* Cookie Categories */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-navy" />
            <span>2. Categories of Storage We Use</span>
          </h2>

          <div className="space-y-4">
            <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50 space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Strictly Essential (Cannot Be Disabled)</span>
              </div>
              <p className="text-gray-600">
                These elements are necessary for the website to function securely:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><code>bargainstore_cart</code>: Persists your basket items and quantities so you don&apos;t lose selections while browsing.</li>
                <li><code>session_token</code>: Ensures secure 256-bit encrypted checkout and protects against CSRF vulnerabilities.</li>
              </ul>
            </div>

            <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50 space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Functional Storage</span>
              </div>
              <p className="text-gray-600">
                These enhance your shopping experience and remember your preferences:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><code>bargainstore_promo</code>: Remembers valid promotional discount vouchers (e.g. <code>BARGAIN10</code>) when moving from basket to checkout.</li>
                <li><code>delivery_method</code>: Retains your selected shipping option (Standard UK Delivery, Next Day Express, or Click &amp; Collect).</li>
              </ul>
            </div>

            <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50 space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Performance &amp; Latency Analytics</span>
              </div>
              <p className="text-gray-600">
                Anonymous telemetry allowing our engineering team to ensure autocomplete search responses stay under our strict &lt;300ms SLA and Turso edge database latency remains optimal.
              </p>
            </div>
          </div>
        </section>

        {/* How to manage */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-navy" />
            <span>3. Managing Your Browser Settings</span>
          </h2>
          <p>
            You can modify your browser settings to accept, decline, or delete cookies and local storage data at any time. Consult your browser&apos;s support guide:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li><strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
            <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions</li>
            <li><strong>Apple Safari:</strong> Preferences &gt; Privacy</li>
            <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
          </ul>
          <p className="text-xs text-gray-500 pt-1">
            Note: Disabling strictly essential cookies will prevent items from persisting in your shopping basket during checkout.
          </p>
        </section>
      </div>
    </div>
  );
}
