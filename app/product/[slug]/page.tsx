import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByCategory, getCategoryBySlug } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ProductDetailActions from "@/components/ProductDetailActions";
import { SITE_URL, getAbsoluteUrl } from "@/lib/site";
import {
  ChevronRight,
  Truck,
  Store,
  ShieldCheck,
  Star,
  CheckCircle,
  Tag,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | BargainStore.uk",
      description: "The requested product could not be found.",
    };
  }

  const title = `${product.name} | BargainStore.uk`;
  const description =
    product.description ||
    `Buy ${product.name} at BargainStore.uk. Genuine UK hardware with fast delivery and price comparison.`;
  const url = getAbsoluteUrl(`/product/${product.slug}`);
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : getAbsoluteUrl(product.image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "BargainStore.uk",
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [category, categoryProducts] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getProductsByCategory(product.categorySlug),
  ]);

  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const categoryName = category
    ? category.name
    : product.categorySlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" & ");

  let specs: Record<string, string> = {};
  if (product.specs) {
    try {
      specs = JSON.parse(product.specs);
    } catch {
      specs = {};
    }
  }

  const additionalProperty = Object.entries(specs).map(([key, val]) => ({
    "@type": "PropertyValue",
    name: key,
    value: String(val),
  }));

  const saving =
    product.savingAmount ||
    (product.comparePrice ? product.comparePrice - product.price : 0);

  const productImageUrl = product.image.startsWith("http")
    ? product.image
    : getAbsoluteUrl(product.image);

  const images = [productImageUrl];
  if (product.additionalImages) {
    try {
      const extra = JSON.parse(product.additionalImages);
      if (Array.isArray(extra)) {
        for (const img of extra) {
          if (typeof img === "string" && img.length > 0) {
            images.push(img.startsWith("http") ? img : getAbsoluteUrl(img));
          }
        }
      }
    } catch {
      // ignore
    }
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description,
    sku: `BGS-${product.id}`,
    mpn: `MPN-${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: categoryName,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: Number(product.price),
      priceValidUntil: "2026-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        Number(product.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: getAbsoluteUrl(`/product/${product.slug}`),
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: Number(product.price) >= 50 ? "0.00" : "4.95",
          currency: "GBP",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "GB",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GB",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(additionalProperty.length > 0 && { additionalProperty }),
    ...(Number(product.rating) > 0 &&
      Number(product.reviewCount) > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(product.rating.toFixed(1)),
          reviewCount: Number(product.reviewCount),
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: getAbsoluteUrl("/shop"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: getAbsoluteUrl(`/category/${product.categorySlug}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: getAbsoluteUrl(`/product/${product.slug}`),
      },
    ],
  };

  const highlights = [
    `100% Genuine ${product.brand} UK stock with official manufacturer guarantee`,
    `Fast UK courier dispatch via Royal Mail Tracked 48 & DPD (Free on orders over £50)`,
    `Eligible for FREE 2-Hour High Street Click & Collect across 30+ UK stores`,
    ...Object.entries(specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
  ].slice(0, 4);

  const productFaqs = [
    {
      question: `Is this ${product.brand} product genuine and covered by warranty?`,
      answer: `Yes, all ${product.brand} products sold on BargainStore UK are 100% genuine and sourced directly through authorized UK distribution channels. This item includes full British manufacturer warranty coverage against defects.`,
    },
    {
      question: "How quickly will this item be dispatched?",
      answer:
        "Orders placed before 2:00 PM Monday through Friday are processed for same-day dispatch via Royal Mail Tracked 48 or DPD Express. Typical delivery across mainland UK takes 1-3 business days. Orders over £50 qualify for free standard UK delivery.",
    },
    {
      question: "Can I return this product if it does not fit my project?",
      answer:
        "Yes. We provide a hassle-free 30-day return policy for unused items in original packaging. You can return this product free of charge to our Cowdenbeath trade counter or post it back via our tracked return service for a prompt refund.",
    },
    {
      question: "Can I collect this item via Click & Collect?",
      answer: `Yes. Free Click & Collect is available with zero minimum spend threshold. If this ${product.name} is in local stock, it can be ready for collection in as little as 2 hours from our flagship store at 175 High St, Cowdenbeath KY4 9QE or partner hardware stores.`,
    },
  ];

  const productFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: productFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productFaqJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-navy">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/category/${product.categorySlug}`} className="hover:text-brand-navy">
          {categoryName}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-brand-navy truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
        {/* Left: Product Image */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {saving > 0 && (
              <span className="absolute top-4 left-4 bg-brand-red text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">
                You save £{saving.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details & Add to Basket */}
        <div className="md:col-span-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-navy bg-brand-softBlue px-2.5 py-1 rounded">
                Brand: {product.brand}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-[11px]">({product.reviewCount} customer reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-brand-heading leading-tight">
              {product.name}
            </h1>

            {/* Price Match Comparison Box (Home Hardware Direct style) */}
            <div className="bg-brand-softBlue/60 border border-blue-100 rounded-xl p-4 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-brand-navy">
                  £{product.price.toFixed(2)}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-gray-500">
                    {product.competitorName || "Amazon"}:{" "}
                    <del className="font-semibold text-gray-400">
                      £{product.comparePrice.toFixed(2)}
                    </del>
                  </span>
                )}
              </div>

              {saving > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-red">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    You save £{saving.toFixed(2)} compared to {product.competitorName || "Amazon"}!
                  </span>
                </div>
              )}

              <p className="text-[10px] text-gray-500 pt-1 border-t border-blue-200/50">
                * Prices verified against UK market rates. Authentic item backed by manufacturer warranty.
              </p>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-green">
              <CheckCircle className="w-4 h-4" />
              <span>In Stock — Ready for immediate UK courier dispatch</span>
            </div>

            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
              {product.description}
            </p>

            {/* Key Features & Highlights (AI & Customer Extraction) */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider block">
                Key Features &amp; Highlights:
              </span>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Add to Basket Component */}
          <ProductDetailActions product={product} />

          {/* Trust Value Badges */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-[11px] text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Truck className="w-4 h-4 mx-auto text-brand-navy mb-1" />
              <span className="font-medium block leading-tight">Free Delivery</span>
              <span className="text-[10px] text-gray-400">Over £50</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Store className="w-4 h-4 mx-auto text-brand-navy mb-1" />
              <span className="font-medium block leading-tight">Click & Collect</span>
              <span className="text-[10px] text-gray-400">30+ UK Stores</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 mx-auto text-brand-navy mb-1" />
              <span className="font-medium block leading-tight">30-Day Returns</span>
              <span className="text-[10px] text-gray-400">Money Back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {Object.keys(specs).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-brand-heading">
            Technical Specifications & Details
          </h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-xs divide-y divide-gray-100">
            {Object.entries(specs).map(([key, val], idx) => (
              <div key={idx} className="flex justify-between py-2">
                <span className="text-gray-500 font-medium">{key}</span>
                <span className="text-gray-900 font-bold text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product-Level Q&A Module */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-brand-navy" />
            <span>Product &amp; Purchase FAQs</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-brand-heading">
            Frequently Asked Questions About {product.name}
          </h2>
          <p className="text-xs text-gray-500">
            Essential information regarding authenticity, warranty protection, delivery timelines, and returns for this product.
          </p>
        </div>

        <div className="space-y-3">
          {productFaqs.map((faq, idx) => (
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
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-heading">
              More In This Department
            </h2>
            <Link
              href={`/category/${product.categorySlug}`}
              className="text-xs font-bold text-brand-navy hover:text-brand-red flex items-center gap-1"
            >
              <span>View Department</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
