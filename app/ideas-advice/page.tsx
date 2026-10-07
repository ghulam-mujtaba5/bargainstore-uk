import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "DIY Ideas & Home Improvement Advice Guides",
  description:
    "Expert DIY guides and home improvement advice. Learn how to paint rooms properly, maintain seasonal gardens, prepare for winter, and choose trade-quality power tools.",
  alternates: {
    canonical: getAbsoluteUrl("/ideas-advice"),
  },
  openGraph: {
    title: "DIY Ideas & Home Improvement Advice Guides | BargainStore.uk",
    description:
      "Expert DIY guides and home improvement advice. Learn how to paint rooms properly, maintain seasonal gardens, and choose trade-quality power tools.",
    url: getAbsoluteUrl("/ideas-advice"),
    siteName: "BargainStore.uk",
    locale: "en_GB",
    type: "article",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "DIY Ideas & Advice Guides — BargainStore.uk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DIY Ideas & Home Improvement Advice Guides | BargainStore.uk",
    description:
      "Expert DIY guides and home improvement advice from UK hardware merchants.",
    images: ["/opengraph-image.png"],
  },
};

export default function IdeasAdvicePage() {
  const articles = [
    {
      id: 1,
      title: "25 DIY Jobs to Do in Autumn: The Ultimate Home Maintenance Checklist",
      category: "Home Maintenance",
      readTime: "7 min read",
      date: "October 2026",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
      excerpt: "Get your property prepared for winter winds, rain and frost with our complete October checklist. Learn how to bleed radiators, clear gutters, insulate exterior water pipes and protect decking.",
      tips: [
        "Inspect roof flashings and seal any loose tiles using roofing mastic.",
        "Clear leaves from guttering and install leaf guards to prevent blockages.",
        "Turn off external outdoor garden taps and drain pipes to prevent burst pipes during cold spells.",
        "Apply weatherproofing silicone sealant around external window frames and doors.",
        "Service garden power tools before packing away for winter storage."
      ]
    },
    {
      id: 2,
      title: "DIY Decorating Guide: Everything You Need to Paint a Room Properly",
      category: "Decorating & Painting",
      readTime: "5 min read",
      date: "September 2026",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
      excerpt: "Painting a room isn't just opening a tin of emulsion and rolling away. Our step-by-step masterclass reveals preparation techniques, sanding grit advice, masking tips, and roller techniques.",
      tips: [
        "Wash walls with sugar soap to remove grease and allow fresh paint to bond properly.",
        "Use high quality low-tack painter's tape on skirting boards and door frames.",
        "Cut in with a 2-inch angled synthetic brush around switches and cornices first.",
        "Use a medium pile microfibre roller in a 'W' motion across walls to eliminate roller marks."
      ]
    },
    {
      id: 3,
      title: "How to Fill, Fix & Seal Your Home Before Winter: Cracks, Gaps and Draughts",
      category: "Repairs & Insulation",
      readTime: "6 min read",
      date: "October 2026",
      image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80",
      excerpt: "A cold draught under a doorway or around a floorboard can drain heat and hike up your energy bills. Discover cheap DIY solutions including expanding foams, flexible caulk and draught excluders.",
      tips: [
        "Use flexible acrylic caulk for interior gaps between skirting boards and walls.",
        "Apply expanding polyurethane foam for deeper cavity gaps around service pipes.",
        "Install self-adhesive rubber draught strips along drafty wooden window sash frames.",
        "Fit brush-strip excluders to the bottom of external letterboxes and doors."
      ]
    }
  ];

  const diyFaqs = [
    {
      question: "How do I prepare my home and exterior pipes for winter freezing?",
      answer:
        "To prevent burst pipes and water damage during cold UK spells, turn off the isolation valves to external outdoor garden taps and drain remaining water. Insulate exposed pipework in unheated lofts, garages, and basements with polyethylene foam lagging. Clear autumn leaves from gutters and fit leaf guards, service garden power tools before storage, and ensure exterior brickwork and window frames are sealed with weatherproof silicone sealant.",
    },
    {
      question: "What is the secret to painting a room without roller marks?",
      answer:
        "Achieving a professional streak-free finish starts with proper wall preparation: wash walls thoroughly with sugar soap to remove grease and dust. Mask skirting boards with low-tack painter's tape and cut in along edges using an angled synthetic brush. When rolling, use a medium pile microfibre roller, apply paint in an overlapping 'W' or 'M' pattern, maintain a wet edge without pressing too hard, and lightly roll off in a single uniform downward direction.",
    },
    {
      question: "How can I stop cold draughts around doors and skirting boards?",
      answer:
        "Eliminate heat loss and cut energy bills by applying flexible acrylic decorators caulk along gaps between skirting boards and plasterboard walls. For larger cavity gaps around pipe entries and under floorboards, use expanding polyurethane foam. Install self-adhesive rubber weather-strips along wooden window frames and fit heavy-duty brush-strip draught excluders to the bottom of external doors and letterboxes.",
    },
    {
      question: "What safety precautions should I take when using oscillating multi-tools?",
      answer:
        "Always wear safety goggles (EN166 rated) and hearing protection when operating high-speed oscillating multi-tools. Securely clamp workpieces to prevent vibration movement, ensure accessories are locked into the Starlock or quick-release collar, check for hidden electric cables and pipework behind plasterboard with a digital multi-detector before plunge-cutting, and disconnect power or remove the lithium battery before changing blades.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: diyFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Schema.org FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <Link href="/" className="text-xs text-brand-navy hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-bold text-brand-red uppercase tracking-wider">
          Expert DIY Knowledge
        </span>
        <h1 className="text-3xl font-black text-brand-heading">
          Ideas, Advice & How-To Guides
        </h1>
        <p className="text-sm text-brand-slate max-w-2xl mt-1">
          Practical advice from British trade professionals and hardware veterans to help you tackle seasonal DIY projects with confidence.
        </p>
      </div>

      {/* Articles */}
      <div className="space-y-8">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden grid md:grid-cols-12 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="md:col-span-5 bg-gray-100 relative min-h-[220px]">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-brand-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                {article.category}
              </span>
            </div>

            <div className="md:col-span-7 p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-brand-heading leading-tight mb-2">
                  {article.title}
                </h2>

                <p className="text-xs sm:text-sm text-brand-slate leading-relaxed mb-4">
                  {article.excerpt}
                </p>

                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider block">
                    Quick Key Takeaways:
                  </span>
                  {article.tips.slice(0, 3).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                <Link
                  href="/shop"
                  className="text-xs font-bold text-brand-navy hover:text-brand-red flex items-center gap-1"
                >
                  <span>Shop Hardware Supplies For This Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Frequently Asked DIY Questions Module */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-brand-red" />
            <span>Practical Advice Q&A</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-brand-heading">
            Frequently Asked DIY Questions
          </h2>
          <p className="text-xs text-brand-slate max-w-xl">
            Expert answers from experienced UK trade professionals to ensure your home improvement projects run smoothly and safely.
          </p>
        </div>

        <div className="space-y-3">
          {diyFaqs.map((faq, idx) => (
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
    </div>
  );
}
