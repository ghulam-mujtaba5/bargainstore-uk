import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import StorefrontShell from "@/components/StorefrontShell";
import { getAllCategories } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL("https://bargainstore.uk"),
  title: {
    default: "BargainStore.uk | Trusted UK Brands At Low Prices",
    template: "%s | BargainStore.uk",
  },
  description:
    "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
  openGraph: {
    title: "BargainStore.uk | Trusted UK Brands At Low Prices",
    description:
      "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
    url: "https://bargainstore.uk",
    siteName: "BargainStore.uk",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/assets/brands/flymo.webp",
        width: 1200,
        height: 630,
        alt: "BargainStore.uk — Trusted UK Brands At Low Prices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BargainStore.uk | Trusted UK Brands At Low Prices",
    description:
      "Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons.",
    images: ["/assets/brands/flymo.webp"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BargainStore.uk",
  url: "https://bargainstore.uk",
  logo: "https://bargainstore.uk/assets/brands/flymo.webp",
  description:
    "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+44-800-123-4567",
    contactType: "customer service",
    areaServed: "GB",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getAllCategories();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-brand-slate selection:bg-brand-navy selection:text-white">
        <CartProvider>
          <StorefrontShell categories={categories}>
            {children}
          </StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}
