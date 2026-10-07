import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import StorefrontShell from "@/components/StorefrontShell";
import { getAllCategories } from "@/lib/data";

export const viewport: Viewport = {
  themeColor: "#001642",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bargainstore.uk.com"),
  title: {
    default: "BargainStore.uk | Trusted UK Brands At Low Prices",
    template: "%s | BargainStore.uk",
  },
  description:
    "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
  applicationName: "BargainStore.uk",
  authors: [{ name: "BargainStore UK Ltd", url: "https://www.bargainstore.uk.com" }],
  creator: "BargainStore UK Ltd",
  publisher: "BargainStore UK Ltd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "BargainStore",
    "BargainStore.uk",
    "UK DIY supplies",
    "hardware shop UK",
    "garden power tools",
    "Flymo lawnmowers",
    "Stanley tools",
    "Black and Decker tools",
    "Hozelock hose reels",
    "Tower kitchen appliances",
    "Dulux trade paint",
    "Click and Collect Cowdenbeath",
    "Cowdenbeath hardware store",
    "175 High St Cowdenbeath KY4 9QE",
    "Fife DIY trade counter",
    "Amazon price match promise",
    "discount homewares UK",
  ],
  alternates: {
    canonical: "https://www.bargainstore.uk.com",
    languages: {
      "en-GB": "https://www.bargainstore.uk.com",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "BargainStore.uk | Trusted UK Brands At Low Prices",
    description:
      "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
    url: "https://www.bargainstore.uk.com",
    siteName: "BargainStore.uk",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "BargainStore.uk — Trusted UK Brands At Low Prices",
        type: "image/png",
      },
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
    images: ["/opengraph-image.png", "/assets/brands/flymo.webp"],
  },
  verification: {
    google: [
      "K7d_-DG8KlrQ1MExFyx-_wxXgBhRjSbRYXwkb9WPlv8",
      "p661Fo4H_NDBkhkvm-Uq-NiAzHu876I1ffAMdGVeeCA",
    ],
  },
  category: "shopping",
  classification: "Hardware, DIY, Garden Tools, Paints & Homewares Retail",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BargainStore.uk",
  url: "https://www.bargainstore.uk.com",
  logo: "https://www.bargainstore.uk.com/assets/brands/flymo.webp",
  description:
    "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+44-800-123-4567",
    contactType: "customer service",
    areaServed: "GB",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "175 High St",
    addressLocality: "Cowdenbeath",
    postalCode: "KY4 9QE",
    addressCountry: "GB",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BargainStore.uk",
  url: "https://www.bargainstore.uk.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.bargainstore.uk.com/shop?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: "BargainStore.uk Flagship Store & Trade Counter",
  image: "https://www.bargainstore.uk.com/opengraph-image.png",
  telephone: "+44-800-123-4567",
  url: "https://www.bargainstore.uk.com",
  priceRange: "£",
  address: {
    "@type": "PostalAddress",
    streetAddress: "175 High St",
    addressLocality: "Cowdenbeath",
    addressRegion: "Fife",
    postalCode: "KY4 9QE",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 56.1118,
    longitude: -3.3444,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
  paymentAccepted: "Cash, Credit Card, Debit Card, Apple Pay, Google Pay, PayPal",
  currenciesAccepted: "GBP",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="BargainStore.uk" />
        <meta name="application-name" content="BargainStore.uk" />
        <meta name="msapplication-TileColor" content="#001642" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-brand-slate selection:bg-brand-navy selection:text-white">
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NE66MGVSSL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NE66MGVSSL', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <CartProvider>
          <StorefrontShell categories={categories}>
            {children}
          </StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}
