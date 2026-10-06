import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, Database, CheckCircle, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | BargainStore.uk",
  description: "UK GDPR & Data Protection Act 2018 privacy policy for BargainStore.uk customers.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="border-b border-gray-200 pb-6 space-y-2">
        <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
          Data Protection &amp; UK GDPR
        </span>
        <h1 className="text-3xl font-black text-brand-heading">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Compliant with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-navy" />
            <span>1. Who We Are (Data Controller)</span>
          </h2>
          <p>
            The data controller responsible for your personal data is <strong>BargainStore.uk Ltd</strong> (Company Registration No. <strong>14285910</strong>, registered in England &amp; Wales).
          </p>
          <p>
            Registered Office: <strong>100 High Street, Birmingham, B1 1AA, United Kingdom</strong>.
            For any data protection inquiries, you may reach our Data Protection Officer at <strong>privacy@bargainstore.uk</strong> or telephone <strong>0800 123 4567</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-navy" />
            <span>2. What Personal Data We Collect</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Identity &amp; Contact:</strong> Full name, email address, mobile phone number for delivery dispatch updates.</li>
            <li><strong>Delivery Information:</strong> Street address, city, and verified UK postcode (e.g. SW1A 1AA) for accurate Royal Mail or DPD routing.</li>
            <li><strong>Order History:</strong> Purchased items, applied promotional vouchers (such as <code>BARGAIN10</code>), and order references.</li>
            <li><strong>Payment Data:</strong> Encrypted transaction identifiers via our PCI-DSS compliant payment gateways (Visa, Mastercard, PayPal, Apple Pay, Google Pay). We never store raw card numbers.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-navy" />
            <span>3. Lawful Basis for Processing</span>
          </h2>
          <p>
            Under UK GDPR Article 6, we process your information under the following legal bases:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Contractual Necessity:</strong> To process, fulfill, and deliver your orders and notify you of dispatch.</li>
            <li><strong>Legal Obligation:</strong> Maintaining accounting and VAT audit records for 6 years as required by HM Revenue &amp; Customs (HMRC).</li>
            <li><strong>Legitimate Interests:</strong> Preventing retail fraud, ensuring platform security, and monitoring server latency (&lt;300ms SLA).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-navy" />
            <span>4. Data Sub-processors &amp; Couriers</span>
          </h2>
          <p>
            We share only essential fulfillment details with verified third-party partners under strict data processing agreements:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Logistics:</strong> Royal Mail Group plc and DPDgroup UK for parcel tracking and delivery.</li>
            <li><strong>Infrastructure:</strong> Turso libSQL Edge Cloud for encrypted database record retention.</li>
            <li><strong>Payment Gateways:</strong> Authorized UK payment service providers.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-navy" />
            <span>5. Your Legal Rights Under UK GDPR</span>
          </h2>
          <p>
            You have the right to request access to your data, rectification of inaccurate details, erasure (&quot;right to be forgotten&quot;), data portability, and restriction of processing.
          </p>
          <p>
            You also have the right to lodge a complaint with the UK supervisory authority: the <strong>Information Commissioner&apos;s Office (ICO)</strong> at <code>www.ico.org.uk</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
