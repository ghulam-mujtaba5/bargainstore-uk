import React from "react";
import { Truck, Store, Tag, ShieldCheck } from "lucide-react";

export default function USPBanner() {
  const usps = [
    {
      icon: Truck,
      title: "FREE UK Delivery",
      subtitle: "On orders over £50 nationwide",
    },
    {
      icon: Store,
      title: "FREE Click & Collect",
      subtitle: "Collect at 30+ regional shops",
    },
    {
      icon: Tag,
      title: "Cheaper Than Amazon",
      subtitle: "Transparent price match guarantee",
    },
    {
      icon: ShieldCheck,
      title: "30-Day Returns",
      subtitle: "Hassle-free refunds & support",
    },
  ];

  return (
    <div className="bg-brand-softBlue/60 border-y border-blue-100/80 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {usps.map((usp, index) => {
            const IconComponent = usp.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-brand-navy flex items-center justify-center flex-shrink-0 shadow-xs border border-blue-100">
                  <IconComponent className="w-5 h-5 text-brand-navy" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-brand-navy leading-tight">
                    {usp.title}
                  </h4>
                  <p className="text-[11px] text-brand-slate leading-tight mt-0.5">
                    {usp.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
