import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  Store,
  Tag,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  MapPin,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Customer Help, Delivery & Click & Collect Stores",
  description:
    "Find answers on UK deliveries, 30-day returns, price match guarantee, and 2-hour Click & Collect at our 175 High St, Cowdenbeath KY4 9QE flagship hub.",
  alternates: {
    canonical: getAbsoluteUrl("/help"),
  },
  openGraph: {
    title: "Customer Help & Click & Collect Stores | BargainStore.uk",
    description:
      "Find answers on UK deliveries, 30-day returns, price match guarantee, and 2-hour Click & Collect at Cowdenbeath.",
    url: getAbsoluteUrl("/help"),
    siteName: "BargainStore.uk",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Customer Help — BargainStore.uk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Help, Delivery & Click & Collect Stores | BargainStore.uk",
    description:
      "Find answers on UK deliveries, 30-day returns, and 2-hour Click & Collect.",
    images: ["/opengraph-image.png"],
  },
};

export default function HelpPage() {
  const sections = [
    {
      id: "delivery",
      icon: Truck,
      title: "UK Delivery Information",
      desc: "We dispatch orders 6 days a week via Royal Mail Tracked 24/48 and DPD Couriers.",
      details: [
        "Standard Delivery (2-3 working days): £4.99, or FREE on orders over £50.",
        "Express Next Day Delivery: £6.99 (Order by 2pm Monday to Friday).",
        "Full parcel tracking link sent via email & SMS upon courier handover.",
        "Scottish Highlands, Islands and Northern Ireland may require 1 additional transit day."
      ]
    },
    {
      id: "click-collect",
      icon: Store,
      title: "FREE Click & Collect",
      desc: "Collect your goods from over 30 participating high street hardware shops nationwide.",
      details: [
        "100% Free collection on all items with zero minimum spend threshold.",
        "Items in local stock are ready for collection in as little as 2 hours.",
        "Bring your order confirmation reference (BS-XXXXXX) and a valid photo ID.",
        "We'll hold your items safely in-store for up to 7 business days."
      ]
    },
    {
      id: "returns",
      icon: RotateCcw,
      title: "30-Day Hassle-Free Returns",
      desc: "Shop with total peace of mind. We accept returns within 30 days of receiving your order.",
      details: [
        "Products must be in their original unopened packaging and unused condition.",
        "Return in person to any participating local store free of charge.",
        "Or print a pre-paid tracked return shipping label online.",
        "Refunds processed to your original payment method within 3-5 working days of receipt."
      ]
    },
    {
      id: "price-promise",
      icon: Tag,
      title: "Our Amazon & High Street Price Match",
      desc: "Transparent UK retail pricing without inflated markups.",
      details: [
        "We monitor prices daily against Amazon UK, B&Q, Screwfix and Argos.",
        "We display genuine competitor comparison prices on our product cards.",
        "If you find an identical in-stock product cheaper, contact our team to match it!",
        "Backing honest local trade since 1983."
      ]
    },
    {
      id: "community",
      icon: Store,
      title: "High Street & Community Support",
      desc: "Supporting independent UK high street merchants and local trade counters.",
      details: [
        "Partnered with over 30 independent family-owned UK hardware merchants nationwide.",
        "Click & Collect keeps footfall and economic vitality in local UK high streets.",
        "In-store trade counter services: key cutting, paint mixing, and timber cutting.",
        "Every online purchase helps sustain local trade counters and village hardware stores."
      ]
    }
  ];

  const helpFaqs = [
    {
      question: "How long does standard UK delivery take?",
      answer:
        "Standard UK delivery takes 2-3 working days via Royal Mail Tracked 48. Standard delivery is £4.99, or completely FREE on all orders over £50. Express Next Day Delivery is also available via DPD Couriers for £6.99 when ordered before 2pm Monday to Friday.",
    },
    {
      question: "How does FREE Click & Collect work?",
      answer:
        "Our Click & Collect service is 100% free with no minimum spend threshold. Items in local stock are ready for collection in as little as 2 hours at our flagship hub (175 High St, Cowdenbeath KY4 9QE) and across 30+ participating independent high street hardware shops nationwide. Simply bring your order reference and a valid photo ID.",
    },
    {
      question: "What is your 30-day returns policy?",
      answer:
        "We offer a hassle-free 30-day money-back guarantee. You can return any unused item in its original, unopened packaging within 30 days of receipt. Returns can be made in person to our Cowdenbeath store free of charge, or posted back using our tracked return service. Refunds are issued to your original payment method within 3-5 business days.",
    },
    {
      question: "How does the Amazon Price Match Promise work?",
      answer:
        "We monitor prices daily against Amazon UK, B&Q, Screwfix, and Argos to ensure honest trade pricing. If you find an identical in-stock product sold cheaper by an authorized UK retailer, contact our support team and we will match the price before or at purchase.",
    },
    {
      question: "Where is your flagship hardware store located?",
      answer:
        "Our flagship hardware trade counter and retail showroom is located at 175 High St, Cowdenbeath KY4 9QE, Fife. Open Monday–Saturday 8:00am–6:00pm and Sunday 10:00am–4:00pm. In addition to order collection, we provide trade counter advice, key cutting, paint mixing, and timber cutting.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: helpFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Schema.org FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="border-b border-gray-200 pb-6">
        <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
          Support Centre
        </span>
        <h1 className="text-3xl font-black text-brand-heading">
          Help, Delivery & Customer Services
        </h1>
        <p className="text-sm text-brand-slate max-w-2xl mt-1">
          Everything you need to know about deliveries, returns, free Click & Collect, and our price match policy.
        </p>
      </div>

      {/* Grid of info cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <div key={sec.id} id={sec.id} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-softBlue text-brand-navy flex items-center justify-center flex-shrink-0">
                  <IconComp className="w-5 h-5 text-brand-navy" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-brand-heading">{sec.title}</h2>
                  <p className="text-xs text-gray-500">{sec.desc}</p>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl">
                {sec.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-green font-bold">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Semantic Human-Readable FAQ Module */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-brand-navy" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-brand-heading">
            Got Questions? We&apos;ve Got Answers
          </h2>
          <p className="text-xs text-gray-500 max-w-xl">
            Clear answers to our most common delivery, returns, collection, and price-matching queries.
          </p>
        </div>

        <div className="space-y-3">
          {helpFaqs.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-gray-200 rounded-xl bg-gray-50/50 open:bg-white open:border-brand-navy/30 transition-all duration-200"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-bold text-sm text-brand-heading hover:text-brand-navy">
                <span>{faq.question}</span>
                <ChevronDown className="w-4 h-4 text-brand-navy transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-2" />
              </summary>
              <div className="px-4 pb-4 pt-1 text-xs text-gray-700 leading-relaxed border-t border-gray-100">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact box */}
      <div className="bg-brand-navy text-white rounded-2xl p-8 grid md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="space-y-1">
          <Phone className="w-6 h-6 text-brand-yellow mx-auto md:mx-0 mb-2" />
          <h3 className="font-bold text-sm">Call Our UK Helpline</h3>
          <div className="text-xl font-black text-brand-yellow">0800 123 4567</div>
          <div className="text-xs text-gray-300">Mon-Fri 8am-6pm, Sat 9am-4pm</div>
        </div>

        <div className="space-y-1">
          <Mail className="w-6 h-6 text-brand-yellow mx-auto md:mx-0 mb-2" />
          <h3 className="font-bold text-sm">Email Support Team</h3>
          <div className="text-sm font-semibold text-white">support@bargainstore.uk</div>
          <div className="text-xs text-gray-300">We respond within 2-4 business hours</div>
        </div>

        <div className="space-y-1">
          <MapPin className="w-6 h-6 text-brand-yellow mx-auto md:mx-0 mb-2" />
          <h3 className="font-bold text-sm">Visit Our Flagship Store</h3>
          <div className="text-sm font-bold text-white">175 High St, Cowdenbeath KY4 9QE</div>
          <div className="text-xs text-gray-300">Mon–Sat 8am–6pm, Sun 10am–4pm • Click &amp; Collect Ready</div>
          <div className="pt-1.5">
            <a
              href="https://www.google.com/maps/search/?api=1&query=175+High+St%2C+Cowdenbeath+KY4+9QE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-yellow hover:underline font-semibold"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
