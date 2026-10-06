import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, FileText, Truck, RotateCcw, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | BargainStore.uk",
  description: "UK retail terms and conditions of sale under the Consumer Rights Act 2015 and Consumer Contracts Regulations.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="border-b border-gray-200 pb-6 space-y-2">
        <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
          Legal &amp; Regulatory
        </span>
        <h1 className="text-3xl font-black text-brand-heading">
          Terms &amp; Conditions of Sale
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Last updated: October 2026. Governed by the laws of England and Wales.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-navy" />
            <span>1. Information About Us</span>
          </h2>
          <p>
            This website is operated by <strong>BargainStore.uk Ltd</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
            We are registered in England and Wales under Company Registration Number <strong>14285910</strong>.
            Our VAT Registration Number is <strong>GB 412 8901 23</strong>.
            Our registered office is situated at <strong>100 High Street, Birmingham, B1 1AA, United Kingdom</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-navy" />
            <span>2. Basis of the Contract</span>
          </h2>
          <p>
            When you place an order on BargainStore.uk, you will receive an automated confirmation email with your order reference (e.g. <code>BS-XXXXXX</code>).
            Contract formation occurs once your items are dispatched from our warehouse or transferred to your chosen local collection counter.
            These terms comply with the <strong>Consumer Rights Act 2015</strong> and the <strong>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013</strong>.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-navy" />
            <span>3. Pricing, VAT &amp; Promotional Codes</span>
          </h2>
          <p>
            All prices displayed on BargainStore.uk are in Pounds Sterling (£ GBP) and include UK Value Added Tax (VAT) at the prevailing standard rate of 20%.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Promotional Codes:</strong> Promotional vouchers, such as <code>BARGAIN10</code>, provide a 10% discount on the cart subtotal prior to delivery charges.
            </li>
            <li>
              Vouchers cannot be exchanged for cash and may not be combined with trade account volume allowances unless expressly authorized.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-navy" />
            <span>4. UK Delivery &amp; Click &amp; Collect</span>
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Standard UK Courier (Royal Mail / DPD):</strong> Orders with a merchandise subtotal of £50.00 or greater qualify for <strong>FREE Standard Delivery</strong>. Orders below £50.00 incur a standard delivery fee of £4.99.
            </p>
            <p>
              <strong>Next Day Express Delivery:</strong> £6.99 for orders placed before 2:00 PM Monday through Friday.
            </p>
            <p>
              <strong>Click &amp; Collect:</strong> Free collection at over 30 independent high street hardware partners. In-stock items are ready within 2 hours and held for 7 working days. Please present your order reference (<code>BS-XXXXXX</code>) and a valid photo ID upon collection.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-navy" />
            <span>5. 30-Day Returns &amp; Cancellation Rights</span>
          </h2>
          <p>
            Under UK consumer law, you have a statutory right to cancel within 14 days of delivery. As part of our customer commitment, BargainStore.uk extends this to a <strong>30-day return window</strong>.
          </p>
          <p>
            Items must be in unopened original packaging, clean, and in saleable condition. Returns can be handed in at any participating high street partner or returned by post using our tracked returns label. Full refunds are credited to the original payment method within 3–5 working days of inspection.
          </p>
        </section>

        {/* Section 6 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-navy" />
            <span>6. Governing Law &amp; Jurisdiction</span>
          </h2>
          <p>
            These terms and any dispute arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong>England and Wales</strong>. You agree that the courts of England and Wales will have non-exclusive jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
}
