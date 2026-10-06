import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "DIY Ideas & Home Improvement Advice Guides",
  description:
    "Expert DIY guides and home improvement advice. Learn how to paint rooms properly, maintain seasonal gardens, prepare for winter, and choose trade-quality power tools.",
  alternates: {
    canonical: "https://bargainstore.uk/ideas-advice",
  },
  openGraph: {
    title: "DIY Ideas & Home Improvement Advice Guides | BargainStore.uk",
    description:
      "Expert DIY guides and home improvement advice. Learn how to paint rooms properly, maintain seasonal gardens, and choose trade-quality power tools.",
    url: "https://bargainstore.uk/ideas-advice",
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
    </div>
  );
}
