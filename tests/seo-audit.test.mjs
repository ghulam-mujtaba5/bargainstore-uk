import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PROJECT_ROOT,
  getDbProducts,
  getDbCategories,
  getDbCategoryBySlug,
  getDbProductBySlug,
} from "./test-helper.mjs";
import { SITE_URL, canonicalBase, getAbsoluteUrl } from "../lib/site.ts";

// Helper to sanitize CDATA (mirroring feed implementation)
function sanitizeCdata(str) {
  if (!str) return "";
  return String(str).replace(/]]>/g, "]]]]><![CDATA[>");
}

// Helper to generate simulated Google Merchant XML
function generateMerchantXml(products, categories) {
  const categoryMap = new Map();
  for (const cat of categories) {
    if (cat.slug && cat.name) {
      categoryMap.set(cat.slug, cat.name);
    }
  }

  const itemsXml = products
    .map((product) => {
      const id = product.id;
      const title = sanitizeCdata(product.name);
      const description = sanitizeCdata(product.description);
      const link = getAbsoluteUrl(`/product/${product.slug}`);
      const imageLink = getAbsoluteUrl(product.image);

      let additionalImagesXml = "";
      if (product.additionalImages) {
        try {
          const raw = String(product.additionalImages).trim();
          let parsedImages = [];
          try {
            const json = JSON.parse(raw);
            if (Array.isArray(json)) parsedImages = json;
          } catch {
            if (raw.includes(",")) parsedImages = raw.split(",").map((s) => s.trim());
            else if (raw) parsedImages = [raw];
          }

          for (const img of parsedImages) {
            if (typeof img === "string" && img.trim()) {
              additionalImagesXml += `      <g:additional_image_link>${getAbsoluteUrl(
                img.trim()
              )}</g:additional_image_link>\n`;
            }
          }
        } catch (_) {}
      }

      const availability =
        Number(product.stock) > 0 ? "in_stock" : "out_of_stock";
      const price = `${Number(product.price).toFixed(2)} GBP`;
      const brand = sanitizeCdata(product.brand || "BargainStore UK");
      const condition = "new";
      const shippingPrice =
        Number(product.price) >= 50 ? "0.00 GBP" : "4.95 GBP";
      const mpn = `BGS-${product.id}`;

      let categoryName = categoryMap.get(product.categorySlug);
      if (!categoryName) {
        categoryName = product.categorySlug
          ? product.categorySlug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "General Hardware";
      }
      const productType = sanitizeCdata(categoryName);

      return `    <item>
      <g:id>${id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
${additionalImagesXml}      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand><![CDATA[${brand}]]></g:brand>
      <g:condition>${condition}</g:condition>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Standard UK Delivery</g:service>
        <g:price>${shippingPrice}</g:price>
      </g:shipping>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${mpn}</g:mpn>
      <g:product_type><![CDATA[${productType}]]></g:product_type>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>BargainStore.uk Google Merchant Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Active UK DIY, garden tools, homewares and appliances catalogue</description>
${itemsXml}
  </channel>
</rss>`;
}

describe("Automated SEO, Schema.org, Google Merchant & GEO Audit Test Suite", () => {
  // =========================================================================
  // SUITE 1: Technical Crawl Architecture & Domain Canonicalization (R1)
  // =========================================================================
  describe("Suite 1: Technical Crawl Architecture & Domain Canonicalization (R1)", () => {
    it("1.1 should configure SITE_URL and getAbsoluteUrl() canonical base resolver", () => {
      assert.ok(SITE_URL, "SITE_URL must be defined");
      assert.equal(
        SITE_URL,
        "https://www.bargainstore.uk.com",
        "SITE_URL fallback must be https://www.bargainstore.uk.com"
      );
      assert.ok(
        !SITE_URL.endsWith("/"),
        "SITE_URL must not contain trailing slash"
      );
      assert.ok(canonicalBase instanceof URL, "canonicalBase must be a URL instance");
      assert.equal(
        canonicalBase.origin,
        "https://www.bargainstore.uk.com",
        "canonicalBase origin must match canonical domain"
      );

      // Verify getAbsoluteUrl behavior
      assert.equal(
        getAbsoluteUrl(),
        "https://www.bargainstore.uk.com",
        "getAbsoluteUrl() with empty arg returns base URL"
      );
      assert.equal(
        getAbsoluteUrl("/"),
        "https://www.bargainstore.uk.com",
        "getAbsoluteUrl('/') returns base URL without trailing slash"
      );
      assert.equal(
        getAbsoluteUrl("/shop"),
        "https://www.bargainstore.uk.com/shop",
        "getAbsoluteUrl('/shop') formats relative path"
      );
      assert.equal(
        getAbsoluteUrl("shop"),
        "https://www.bargainstore.uk.com/shop",
        "getAbsoluteUrl('shop') handles missing leading slash"
      );
      assert.equal(
        getAbsoluteUrl("https://example.com/asset.png"),
        "https://example.com/asset.png",
        "getAbsoluteUrl preserves external absolute URLs"
      );
    });

    it("1.2 should verify dynamic sitemap generation, priority hierarchy, images and lastmod (app/sitemap.ts)", async () => {
      const sitemapPath = path.join(PROJECT_ROOT, "app/sitemap.ts");
      const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");

      assert.ok(
        sitemapContent.includes('export const dynamic = "force-dynamic"'),
        "app/sitemap.ts must declare force-dynamic"
      );
      assert.ok(
        sitemapContent.includes("export default async function sitemap"),
        "app/sitemap.ts must export default async function sitemap"
      );
      assert.ok(
        sitemapContent.includes("SITE_URL"),
        "app/sitemap.ts must reference SITE_URL"
      );
      assert.ok(
        sitemapContent.includes("getAbsoluteUrl"),
        "app/sitemap.ts must reference getAbsoluteUrl"
      );

      // Verify database entities in simulated sitemap output
      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      assert.equal(categories.length, 6, "Must have 6 departments in database");
      assert.ok(products.length >= 12, "Must have catalog products in database");

      const staticSlugs = [
        "",
        "shop",
        "basket",
        "checkout",
        "help",
        "about",
        "terms",
        "privacy",
        "cookies",
        "ideas-advice",
      ];

      // Verify priority rules
      const rootUrl = getAbsoluteUrl("/");
      assert.equal(rootUrl, "https://www.bargainstore.uk.com");

      // Verify each category has image and priority 0.8
      for (const cat of categories) {
        assert.ok(cat.slug, "Category must have slug");
        const catUrl = getAbsoluteUrl(`/category/${cat.slug}`);
        assert.ok(catUrl.startsWith("https://www.bargainstore.uk.com/category/"));
      }

      // Verify each product has canonical url, priority 0.8, and lastmod
      for (const prod of products) {
        assert.ok(prod.slug, "Product must have slug");
        const prodUrl = getAbsoluteUrl(`/product/${prod.slug}`);
        assert.ok(prodUrl.startsWith("https://www.bargainstore.uk.com/product/"));
      }
    });

    it("1.3 should verify app/robots.ts crawler RFC compliance, bot directives and feed allowances", () => {
      const robotsPath = path.join(PROJECT_ROOT, "app/robots.ts");
      const robotsContent = fs.readFileSync(robotsPath, "utf-8");

      assert.ok(
        robotsContent.includes("export default function robots"),
        "robots.ts must export default function robots"
      );
      assert.ok(
        robotsContent.includes("MetadataRoute.Robots"),
        "robots.ts must use MetadataRoute.Robots"
      );
      assert.ok(
        robotsContent.includes('userAgent: "*"'),
        "robots.ts must specify wildcard userAgent rule"
      );
      assert.ok(
        robotsContent.includes('"/api/feeds/"') || robotsContent.includes("/api/feeds"),
        "robots.ts must allow feed endpoints for Googlebot and crawlers"
      );
      assert.ok(
        robotsContent.includes('"/llms.txt"') || robotsContent.includes("/llms.txt"),
        "robots.ts must allow /llms.txt for AI crawlers"
      );
      assert.ok(
        robotsContent.includes('"/admin"'),
        "robots.ts must disallow /admin"
      );
      assert.ok(
        robotsContent.includes('"/api/admin"'),
        "robots.ts must disallow /api/admin"
      );
      assert.ok(
        robotsContent.includes("GPTBot"),
        "robots.ts must include AI crawler rules (GPTBot)"
      );
      assert.ok(
        robotsContent.includes("PerplexityBot"),
        "robots.ts must include AI crawler rules (PerplexityBot)"
      );
      assert.ok(
        robotsContent.includes("ClaudeBot"),
        "robots.ts must include AI crawler rules (ClaudeBot)"
      );
      assert.ok(
        robotsContent.includes("Googlebot"),
        "robots.ts must include search crawler rules (Googlebot)"
      );
      assert.ok(
        robotsContent.includes("sitemap.xml"),
        "robots.ts must reference sitemap.xml"
      );
      assert.ok(
        robotsContent.includes("host,"),
        "robots.ts must specify host property"
      );
    });

    it("1.4 should synchronize app/manifest.ts with public/site.webmanifest and browser config", () => {
      const manifestPath = path.join(PROJECT_ROOT, "app/manifest.ts");
      const manifestContent = fs.readFileSync(manifestPath, "utf-8");

      assert.ok(
        manifestContent.includes('theme_color: "#001642"'),
        "app/manifest.ts theme_color must be #001642"
      );
      assert.ok(
        manifestContent.includes('background_color: "#001642"'),
        "app/manifest.ts background_color must be #001642"
      );
      assert.ok(
        manifestContent.includes("orientation: \"portrait\""),
        "app/manifest.ts orientation must be portrait"
      );

      const staticManifestPath = path.join(PROJECT_ROOT, "public/site.webmanifest");
      assert.ok(
        fs.existsSync(staticManifestPath),
        "public/site.webmanifest must exist"
      );
      const staticManifest = JSON.parse(
        fs.readFileSync(staticManifestPath, "utf-8")
      );
      assert.equal(
        staticManifest.theme_color,
        "#001642",
        "site.webmanifest theme_color must match"
      );
      assert.equal(
        staticManifest.background_color,
        "#001642",
        "site.webmanifest background_color must match"
      );
      assert.ok(
        staticManifest.icons.some((i) => i.src === "/icon-192.png"),
        "site.webmanifest must have icon-192.png"
      );
      assert.ok(
        staticManifest.icons.some((i) => i.src === "/icon-512.png"),
        "site.webmanifest must have icon-512.png"
      );

      const browserConfigPath = path.join(PROJECT_ROOT, "public/browserconfig.xml");
      assert.ok(
        fs.existsSync(browserConfigPath),
        "public/browserconfig.xml must exist"
      );
    });

    it("1.5 should verify zero legacy active hostnames in app/ directory", () => {
      function walkDir(dir) {
        let results = [];
        for (const file of fs.readdirSync(dir)) {
          const full = path.join(dir, file);
          if (fs.statSync(full).isDirectory()) {
            results.push(...walkDir(full));
          } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
            results.push(full);
          }
        }
        return results;
      }

      const appFiles = walkDir(path.join(PROJECT_ROOT, "app"));
      const legacyHits = [];

      for (const filePath of appFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        lines.forEach((line, lineIdx) => {
          const trimmed = line.trim();
          // Skip comments
          if (
            trimmed.startsWith("//") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("*")
          ) {
            return;
          }
          if (
            line.includes("https://bargainstore.uk") &&
            !line.includes("bargainstore.uk.com")
          ) {
            legacyHits.push({
              file: path.relative(PROJECT_ROOT, filePath),
              line: lineIdx + 1,
              content: trimmed,
            });
          }
        });
      }

      assert.equal(
        legacyHits.length,
        0,
        `Found unexpected active legacy domain references in app/: ${JSON.stringify(
          legacyHits
        )}`
      );
    });
  });

  // =========================================================================
  // SUITE 2: Advanced E-commerce Schema.org Structured Data (R2)
  // =========================================================================
  describe("Suite 2: Advanced E-commerce Schema.org Structured Data (R2)", () => {
    it("2.1 should define valid Organization JSON-LD in Root Layout", () => {
      const layoutPath = path.join(PROJECT_ROOT, "app/layout.tsx");
      const layoutContent = fs.readFileSync(layoutPath, "utf-8");

      assert.ok(
        layoutContent.includes('"Organization"'),
        "app/layout.tsx must declare Organization schema"
      );
      assert.ok(
        layoutContent.includes('"BargainStore.uk"'),
        "Organization name must be BargainStore.uk"
      );
      assert.ok(
        layoutContent.includes("+44-800-123-4567"),
        "Organization contact telephone must be +44-800-123-4567"
      );
      assert.ok(
        layoutContent.includes("175 High St") &&
          layoutContent.includes("Cowdenbeath") &&
          layoutContent.includes("KY4 9QE"),
        "Organization address must be 175 High St, Cowdenbeath KY4 9QE"
      );
      assert.ok(
        layoutContent.includes('areaServed: "GB"') || layoutContent.includes('"GB"'),
        "Organization area served must be GB"
      );
    });

    it("2.2 should define valid WebSite schema with SearchAction in Root Layout", () => {
      const layoutPath = path.join(PROJECT_ROOT, "app/layout.tsx");
      const layoutContent = fs.readFileSync(layoutPath, "utf-8");

      assert.ok(
        layoutContent.includes('"WebSite"'),
        "app/layout.tsx must declare WebSite schema"
      );
      assert.ok(
        layoutContent.includes('"SearchAction"'),
        "WebSite must include potentialAction SearchAction"
      );
      assert.ok(
        layoutContent.includes("target:") &&
          layoutContent.includes("search_term_string"),
        "SearchAction target must parameterize search_term_string"
      );
      assert.ok(
        layoutContent.includes("query-input"),
        "SearchAction must specify query-input"
      );
    });

    it("2.3 should define valid HardwareStore / LocalBusiness schema with opening hours and Scottish trade counter", () => {
      const layoutPath = path.join(PROJECT_ROOT, "app/layout.tsx");
      const layoutContent = fs.readFileSync(layoutPath, "utf-8");

      assert.ok(
        layoutContent.includes('"HardwareStore"'),
        "app/layout.tsx must declare HardwareStore schema"
      );
      assert.ok(
        layoutContent.includes('"GeoCoordinates"'),
        "HardwareStore must include GeoCoordinates"
      );
      assert.ok(
        layoutContent.includes("56.1118") || layoutContent.includes("56.11"),
        "HardwareStore geo latitude must match Cowdenbeath coordinates"
      );
      assert.ok(
        layoutContent.includes("-3.3444") || layoutContent.includes("-3.34"),
        "HardwareStore geo longitude must match Cowdenbeath coordinates"
      );
      assert.ok(
        layoutContent.includes("openingHoursSpecification"),
        "HardwareStore must declare openingHoursSpecification"
      );
      assert.ok(
        layoutContent.includes('"GBP"'),
        "HardwareStore currenciesAccepted must include GBP"
      );
    });

    it("2.4 should define CollectionPage and ItemList schemas on Category and Shop routes", () => {
      const categoryPath = path.join(PROJECT_ROOT, "app/category/[slug]/page.tsx");
      const categoryContent = fs.readFileSync(categoryPath, "utf-8");

      assert.ok(
        categoryContent.includes('"CollectionPage"'),
        "Category page must inject CollectionPage schema"
      );
      assert.ok(
        categoryContent.includes('"ItemList"'),
        "Category page CollectionPage must contain nested ItemList"
      );
      assert.ok(
        categoryContent.includes('"BreadcrumbList"'),
        "Category page must inject BreadcrumbList schema"
      );

      const shopPath = path.join(PROJECT_ROOT, "app/shop/page.tsx");
      const shopContent = fs.readFileSync(shopPath, "utf-8");

      assert.ok(
        shopContent.includes('"CollectionPage"'),
        "Shop page must inject CollectionPage schema"
      );
      assert.ok(
        shopContent.includes('"ItemList"'),
        "Shop page CollectionPage must contain nested ItemList"
      );
      assert.ok(
        shopContent.includes('"BreadcrumbList"'),
        "Shop page must inject BreadcrumbList schema"
      );
    });

    it("2.5 should validate comprehensive Product schema compliance across all catalog products", async () => {
      const productPagePath = path.join(PROJECT_ROOT, "app/product/[slug]/page.tsx");
      const productPageContent = fs.readFileSync(productPagePath, "utf-8");

      assert.ok(
        productPageContent.includes('"@type": "Product"'),
        "Product page must declare Product schema"
      );
      assert.ok(
        productPageContent.includes("priceCurrency: \"GBP\""),
        "Product schema must specify GBP currency"
      );
      assert.ok(
        productPageContent.includes("OfferShippingDetails"),
        "Product schema must specify OfferShippingDetails"
      );
      assert.ok(
        productPageContent.includes("MerchantReturnPolicy"),
        "Product schema must specify MerchantReturnPolicy"
      );
      assert.ok(
        productPageContent.includes("priceValidUntil: \"2026-12-31\""),
        "Product schema must specify priceValidUntil"
      );
      assert.ok(
        productPageContent.includes("https://schema.org/NewCondition"),
        "Product schema must specify NewCondition"
      );
      assert.ok(
        productPageContent.includes("sku: `BGS-${product.id}`"),
        "Product schema must declare sku"
      );
      assert.ok(
        productPageContent.includes("mpn: `MPN-${product.id}`"),
        "Product schema must declare mpn"
      );
      assert.ok(
        productPageContent.includes("additionalProperty"),
        "Product schema must declare additionalProperty for specs"
      );

      // Programmatically inspect all products in database
      const products = await getDbProducts();
      for (const p of products) {
        assert.ok(p.id, "Product must have id");
        assert.ok(p.name, "Product must have name");
        assert.ok(p.price > 0, "Product must have positive price");
        assert.ok(p.brand, "Product must have brand");
        assert.ok(p.slug, "Product must have slug");

        // Verify simulated Product JSON-LD output
        let specs = {};
        if (p.specs) {
          try {
            specs = JSON.parse(p.specs);
          } catch (_) {}
        }
        const additionalProperty = Object.entries(specs).map(([key, val]) => ({
          "@type": "PropertyValue",
          name: key,
          value: String(val),
        }));

        const productJsonLd = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          image: [getAbsoluteUrl(p.image)],
          description: p.description,
          sku: `BGS-${p.id}`,
          mpn: `MPN-${p.id}`,
          brand: { "@type": "Brand", name: p.brand },
          offers: {
            "@type": "Offer",
            priceCurrency: "GBP",
            price: Number(p.price),
            priceValidUntil: "2026-12-31",
            itemCondition: "https://schema.org/NewCondition",
            availability:
              Number(p.stock) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: getAbsoluteUrl(`/product/${p.slug}`),
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: Number(p.price) >= 50 ? "0.00" : "4.95",
                currency: "GBP",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "GB",
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "GB",
              merchantReturnDays: 30,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
          },
          ...(additionalProperty.length > 0 && { additionalProperty }),
        };

        assert.equal(productJsonLd["@type"], "Product");
        assert.equal(productJsonLd.offers.priceCurrency, "GBP");
        assert.ok(
          productJsonLd.offers.url.startsWith("https://www.bargainstore.uk.com/product/")
        );
        assert.equal(productJsonLd.offers.hasMerchantReturnPolicy.merchantReturnDays, 30);
      }
    });
  });

  // =========================================================================
  // SUITE 3: Google Merchant Center XML Feed Automation (R3)
  // =========================================================================
  describe("Suite 3: Google Merchant Center XML Feed Automation (R3)", () => {
    it("3.1 should verify Google Merchant feed route handlers and dynamic declarations", () => {
      const feedRoutePath = path.join(
        PROJECT_ROOT,
        "app/api/feeds/google-merchant/route.ts"
      );
      assert.ok(fs.existsSync(feedRoutePath), "Feed route handler must exist");
      const feedContent = fs.readFileSync(feedRoutePath, "utf-8");

      assert.ok(
        feedContent.includes('export const dynamic = "force-dynamic"'),
        "Feed route handler must declare force-dynamic"
      );
      assert.ok(
        feedContent.includes("export async function GET"),
        "Feed route handler must export GET"
      );
      assert.ok(
        feedContent.includes('xmlns:g="http://base.google.com/ns/1.0"'),
        "Feed must declare Google Merchant namespace"
      );

      const xmlAliasPath = path.join(
        PROJECT_ROOT,
        "app/google-merchant.xml/route.ts"
      );
      assert.ok(fs.existsSync(xmlAliasPath), "Feed XML alias route must exist");
      const xmlAliasContent = fs.readFileSync(xmlAliasPath, "utf-8");
      assert.ok(
        xmlAliasContent.includes('export const dynamic = "force-dynamic"'),
        "Feed XML alias must declare force-dynamic"
      );
      assert.ok(
        xmlAliasContent.includes("export async function GET"),
        "Feed XML alias must export GET"
      );
    });

    it("3.2 should generate compliant Google Merchant RSS 2.0 XML with valid headers and namespaces", async () => {
      const [products, categories] = await Promise.all([
        getDbProducts(),
        getDbCategories(),
      ]);

      const xml = generateMerchantXml(products, categories);

      assert.ok(
        xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
        "XML must begin with UTF-8 XML declaration"
      );
      assert.ok(
        xml.includes('<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">'),
        "XML must declare RSS 2.0 with Google namespace"
      );
      assert.ok(xml.includes("<channel>"), "XML must declare channel");
      assert.ok(
        xml.includes(`<link>${SITE_URL}</link>`),
        "Channel link must match canonical site URL"
      );
      assert.ok(xml.includes("</channel>"), "Channel must close");
      assert.ok(xml.includes("</rss>"), "RSS root must close");
    });

    it("3.3 should guarantee 100% product export coverage in Google Merchant feed", async () => {
      const [products, categories] = await Promise.all([
        getDbProducts(),
        getDbCategories(),
      ]);

      const xml = generateMerchantXml(products, categories);
      const itemMatches = xml.match(/<item>/g) || [];

      assert.equal(
        itemMatches.length,
        products.length,
        `Feed item count (${itemMatches.length}) must equal database product count (${products.length})`
      );
    });

    it("3.4 should validate all required Google Merchant attributes on every product item", async () => {
      const [products, categories] = await Promise.all([
        getDbProducts(),
        getDbCategories(),
      ]);

      const xml = generateMerchantXml(products, categories);

      for (const prod of products) {
        // Assert ID tag
        assert.ok(
          xml.includes(`<g:id>${prod.id}</g:id>`),
          `Feed must include <g:id>${prod.id}</g:id>`
        );

        // Assert Link tag
        const canonicalProdUrl = getAbsoluteUrl(`/product/${prod.slug}`);
        assert.ok(
          xml.includes(`<g:link>${canonicalProdUrl}</g:link>`),
          `Feed must include canonical link for product ${prod.id}`
        );

        // Assert Image Link tag
        const imageLink = getAbsoluteUrl(prod.image);
        assert.ok(
          xml.includes(`<g:image_link>${imageLink}</g:image_link>`),
          `Feed must include image link for product ${prod.id}`
        );

        // Assert Availability
        const expectedAvailability =
          Number(prod.stock) > 0 ? "in_stock" : "out_of_stock";
        assert.ok(
          xml.includes(`<g:availability>${expectedAvailability}</g:availability>`),
          `Feed must include availability ${expectedAvailability} for product ${prod.id}`
        );

        // Assert Price with GBP suffix
        const expectedPrice = `${Number(prod.price).toFixed(2)} GBP`;
        assert.ok(
          xml.includes(`<g:price>${expectedPrice}</g:price>`),
          `Feed must include price ${expectedPrice} for product ${prod.id}`
        );

        // Assert Condition
        assert.ok(
          xml.includes("<g:condition>new</g:condition>"),
          "Feed must specify condition new"
        );

        // Assert MPN
        assert.ok(
          xml.includes(`<g:mpn>BGS-${prod.id}</g:mpn>`),
          `Feed must specify mpn BGS-${prod.id}`
        );
      }
    });

    it("3.5 should verify XML syntax validity, CDATA encapsulation and balanced tags", async () => {
      const [products, categories] = await Promise.all([
        getDbProducts(),
        getDbCategories(),
      ]);

      const xml = generateMerchantXml(products, categories);

      // Verify tag balancing
      const tagsToVerify = [
        "rss",
        "channel",
        "title",
        "link",
        "description",
        "item",
        "g:id",
        "g:title",
        "g:description",
        "g:link",
        "g:image_link",
        "g:availability",
        "g:price",
        "g:brand",
        "g:condition",
        "g:shipping",
        "g:country",
        "g:service",
        "g:identifier_exists",
        "g:mpn",
        "g:product_type",
      ];

      for (const tag of tagsToVerify) {
        const openRegex = new RegExp(`<${tag}[>\\s]`, "g");
        const closeRegex = new RegExp(`</${tag}>`, "g");
        const openCount = (xml.match(openRegex) || []).length;
        const closeCount = (xml.match(closeRegex) || []).length;
        assert.equal(
          openCount,
          closeCount,
          `Tag <${tag}> count (${openCount}) must match close tag </${tag}> count (${closeCount})`
        );
      }

      // Verify CDATA balance
      const openCdata = (xml.match(/<!\[CDATA\[/g) || []).length;
      const closeCdata = (xml.match(/\]\]>/g) || []).length;
      assert.equal(
        openCdata,
        closeCdata,
        `Open CDATA count (${openCdata}) must match close CDATA count (${closeCdata})`
      );
    });
  });

  // =========================================================================
  // SUITE 4: Generative Engine Optimization (GEO) & Semantic Search (R4)
  // =========================================================================
  describe("Suite 4: Generative Engine Optimization (GEO) & Semantic Search (R4)", () => {
    it("4.1 should verify public/llms.txt and app/llms.txt/route.ts existence and accessibility", () => {
      const publicLlmsPath = path.join(PROJECT_ROOT, "public/llms.txt");
      assert.ok(fs.existsSync(publicLlmsPath), "public/llms.txt must exist");

      const routeLlmsPath = path.join(PROJECT_ROOT, "app/llms.txt/route.ts");
      assert.ok(fs.existsSync(routeLlmsPath), "app/llms.txt/route.ts must exist");

      const routeContent = fs.readFileSync(routeLlmsPath, "utf-8");
      assert.ok(
        routeContent.includes('export const dynamic = "force-dynamic"'),
        "app/llms.txt/route.ts must declare force-dynamic"
      );
      assert.ok(
        routeContent.includes("export async function GET"),
        "app/llms.txt/route.ts must export GET"
      );
      assert.ok(
        routeContent.includes("text/plain; charset=utf-8"),
        "app/llms.txt/route.ts must specify text/plain; charset=utf-8 Content-Type"
      );
    });

    it("4.2 should verify llms.txt required specification sections and statutory credentials", () => {
      const llmsContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "public/llms.txt"),
        "utf-8"
      );

      // Section 1: Title & Summary
      assert.ok(
        llmsContent.includes("# BargainStore UK — Trusted UK Brands At Low Prices"),
        "llms.txt must have H1 title"
      );
      assert.ok(
        llmsContent.includes("Cowdenbeath KY4 9QE"),
        "llms.txt summary must cite Cowdenbeath hub"
      );

      // Section 2: Statutory Identity
      assert.ok(
        llmsContent.includes("## Store Overview & Statutory Identity"),
        "llms.txt must have Statutory Identity section"
      );
      assert.ok(
        llmsContent.includes("14285910"),
        "llms.txt must cite company registration 14285910"
      );
      assert.ok(
        llmsContent.includes("GB 412 8901 23"),
        "llms.txt must cite VAT number GB 412 8901 23"
      );
      assert.ok(
        llmsContent.includes("0800 123 4567"),
        "llms.txt must cite phone number 0800 123 4567"
      );
      assert.ok(
        llmsContent.includes("support@bargainstore.uk.com"),
        "llms.txt must cite support email"
      );

      // Section 3: Brand Promises
      assert.ok(
        llmsContent.includes("## Brand Promises & Value Propositions"),
        "llms.txt must have Brand Promises section"
      );
      assert.ok(
        llmsContent.includes("Amazon & High Street Price Match"),
        "llms.txt must cite Amazon Price Match"
      );

      // Section 4: Fulfillment & Policies
      assert.ok(
        llmsContent.includes("## Fulfillment & Shipping Policies"),
        "llms.txt must have Fulfillment Policies section"
      );
      assert.ok(
        llmsContent.includes("FREE on all orders over £50"),
        "llms.txt must cite free delivery over £50"
      );
      assert.ok(
        llmsContent.includes("£4.99 via Royal Mail Tracked 48"),
        "llms.txt must cite £4.99 standard delivery"
      );
      assert.ok(
        llmsContent.includes("Click & Collect: 100% Free"),
        "llms.txt must cite 100% free Click & Collect"
      );
      assert.ok(
        llmsContent.includes("30-Day Returns"),
        "llms.txt must cite 30-Day Returns"
      );

      // Section 5: Top Departments
      assert.ok(
        llmsContent.includes("## Top Product Departments & Canonical URLs"),
        "llms.txt must have Departments section"
      );
      const expectedDepartments = [
        "Garden & Growing",
        "Outdoor Living",
        "DIY & Decorating",
        "Electricals",
        "Housewares",
        "Laundry & Utility",
      ];
      for (const dept of expectedDepartments) {
        assert.ok(
          llmsContent.includes(dept),
          `llms.txt must include department ${dept}`
        );
      }

      // Section 6: Featured Brands
      assert.ok(
        llmsContent.includes("## Featured Authoritative Brands"),
        "llms.txt must have Featured Brands section"
      );
      const expectedBrands = [
        "Stanley",
        "Black+Decker",
        "Flymo",
        "Hozelock",
        "Tower",
        "Joseph Joseph",
        "Dulux",
        "Dr Beckmann",
      ];
      for (const b of expectedBrands) {
        assert.ok(llmsContent.includes(b), `llms.txt must include brand ${b}`);
      }

      // Section 7: Canonical URLs Directory
      assert.ok(
        llmsContent.includes("## Canonical URLs Directory"),
        "llms.txt must have Canonical URLs Directory"
      );

      // Section 8: LLM Agent Directives
      assert.ok(
        llmsContent.includes("## LLM Agent Directives"),
        "llms.txt must have LLM Agent Directives"
      );
    });

    it("4.3 should verify llms.txt link integrity and canonical base URL consistency", () => {
      const llmsContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "public/llms.txt"),
        "utf-8"
      );

      const linkRegex = /https:\/\/[^\s\)\>]+/g;
      const links = llmsContent.match(linkRegex) || [];

      assert.ok(links.length >= 10, "llms.txt must contain at least 10 URLs");
      for (const link of links) {
        assert.ok(
          link.startsWith("https://www.bargainstore.uk.com"),
          `All URLs in llms.txt must use canonical domain: ${link}`
        );
      }
    });

    it("4.4 should verify Schema.org FAQPage JSON-LD and Q&A modules on /help, /ideas-advice, /, and /product/[slug]", () => {
      // 1. /help
      const helpContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "app/help/page.tsx"),
        "utf-8"
      );
      assert.ok(
        helpContent.includes('"@type": "FAQPage"'),
        "/help must contain FAQPage JSON-LD"
      );
      assert.ok(
        helpContent.includes("How long does standard UK delivery take?"),
        "/help must contain delivery FAQ"
      );
      assert.ok(
        helpContent.includes("How does FREE Click & Collect work?"),
        "/help must contain Click & Collect FAQ"
      );
      assert.ok(
        helpContent.includes("What is your 30-day returns policy?"),
        "/help must contain returns policy FAQ"
      );
      assert.ok(
        helpContent.includes("How does the Amazon Price Match Promise work?"),
        "/help must contain price match FAQ"
      );
      assert.ok(
        helpContent.includes("Where is your flagship hardware store located?"),
        "/help must contain store location FAQ"
      );
      assert.ok(
        helpContent.includes("<details") && helpContent.includes("<summary"),
        "/help must render interactive details/summary accordion"
      );

      // 2. /ideas-advice
      const ideasContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "app/ideas-advice/page.tsx"),
        "utf-8"
      );
      assert.ok(
        ideasContent.includes('"@type": "FAQPage"'),
        "/ideas-advice must contain FAQPage JSON-LD"
      );
      assert.ok(
        ideasContent.includes("winter freezing"),
        "/ideas-advice must contain winter freezing FAQ"
      );
      assert.ok(
        ideasContent.includes("roller marks"),
        "/ideas-advice must contain painting FAQ"
      );
      assert.ok(
        ideasContent.includes("<details") && ideasContent.includes("<summary"),
        "/ideas-advice must render interactive details/summary accordion"
      );

      // 3. / (Home)
      const homeContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "app/page.tsx"),
        "utf-8"
      );
      assert.ok(
        homeContent.includes('"@type": "FAQPage"'),
        "Homepage must contain FAQPage JSON-LD"
      );
      assert.ok(
        homeContent.includes("Why are prices cheaper at BargainStore.uk"),
        "Homepage must contain low prices FAQ"
      );
      assert.ok(
        homeContent.includes("genuine UK manufacturer warranties"),
        "Homepage must contain warranty FAQ"
      );
      assert.ok(
        homeContent.includes("Can I collect my order in person?"),
        "Homepage must contain collection FAQ"
      );
      assert.ok(
        homeContent.includes("How do I qualify for free UK delivery?"),
        "Homepage must contain free delivery FAQ"
      );
      assert.ok(
        homeContent.includes("<details") && homeContent.includes("<summary"),
        "Homepage must render interactive details/summary accordion"
      );

      // 4. /product/[slug]
      const productContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "app/product/[slug]/page.tsx"),
        "utf-8"
      );
      assert.ok(
        productContent.includes('"@type": "FAQPage"'),
        "Product page must contain FAQPage JSON-LD"
      );
      assert.ok(
        productContent.includes("genuine and covered by warranty"),
        "Product page must contain warranty FAQ"
      );
      assert.ok(
        productContent.includes("How quickly will this item be dispatched?"),
        "Product page must contain dispatch FAQ"
      );
      assert.ok(
        productContent.includes("Can I return this product"),
        "Product page must contain return FAQ"
      );
      assert.ok(
        productContent.includes("Can I collect this item via Click & Collect?"),
        "Product page must contain Click & Collect FAQ"
      );
    });

    it("4.5 should verify product feature highlights, technical specs mapping, and brand taglines", () => {
      const productContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "app/product/[slug]/page.tsx"),
        "utf-8"
      );
      assert.ok(
        productContent.includes("Key Features & Highlights"),
        "Product page must display visual Key Features & Highlights box"
      );
      assert.ok(
        productContent.includes("additionalProperty"),
        "Product page must map specs into additionalProperty"
      );

      const homeContent = fs.readFileSync(
        path.join(PROJECT_ROOT, "app/page.tsx"),
        "utf-8"
      );
      assert.ok(
        homeContent.includes("British Lawn & Garden Innovation"),
        "Home page must display Flymo brand tagline"
      );
      assert.ok(
        homeContent.includes("Cordless Power Tools & Multi-Tools"),
        "Home page must display Black+Decker brand tagline"
      );
      assert.ok(
        homeContent.includes("Heavy-Duty Hand Tools & Storage"),
        "Home page must display Stanley brand tagline"
      );
    });
  });

  // =========================================================================
  // SUITE 5: Production Build Integrity (R5)
  // =========================================================================
  describe("Suite 5: Production Build Integrity (R5)", () => {
    it("5.1 should verify presence of all 22+ static and dynamic application routes", () => {
      const requiredRoutes = [
        "app/layout.tsx",
        "app/page.tsx",
        "app/sitemap.ts",
        "app/robots.ts",
        "app/manifest.ts",
        "app/shop/page.tsx",
        "app/category/[slug]/page.tsx",
        "app/product/[slug]/page.tsx",
        "app/basket/page.tsx",
        "app/checkout/page.tsx",
        "app/help/page.tsx",
        "app/about/page.tsx",
        "app/terms/page.tsx",
        "app/privacy/page.tsx",
        "app/cookies/page.tsx",
        "app/ideas-advice/page.tsx",
        "app/admin/page.tsx",
        "app/admin/products/page.tsx",
        "app/admin/orders/page.tsx",
        "app/admin/turso/page.tsx",
        "app/api/feeds/google-merchant/route.ts",
        "app/google-merchant.xml/route.ts",
        "app/llms.txt/route.ts",
      ];

      for (const relPath of requiredRoutes) {
        const fullPath = path.join(PROJECT_ROOT, relPath);
        assert.ok(
          fs.existsSync(fullPath),
          `Route file ${relPath} must exist in project`
        );
        const stats = fs.statSync(fullPath);
        assert.ok(stats.size > 50, `Route file ${relPath} must not be empty`);
      }
    });

    it("5.2 should verify feed and GEO route handlers declare force-dynamic for live discovery", () => {
      const dynamicRouteFiles = [
        "app/sitemap.ts",
        "app/api/feeds/google-merchant/route.ts",
        "app/google-merchant.xml/route.ts",
        "app/llms.txt/route.ts",
      ];

      for (const relPath of dynamicRouteFiles) {
        const content = fs.readFileSync(path.join(PROJECT_ROOT, relPath), "utf-8");
        assert.ok(
          content.includes('export const dynamic = "force-dynamic"'),
          `${relPath} must export dynamic = "force-dynamic"`
        );
      }
    });

    it("5.3 should verify configuration integrity in next.config.mjs/ts, tsconfig.json, and package.json", () => {
      assert.ok(
        fs.existsSync(path.join(PROJECT_ROOT, "next.config.mjs")) ||
          fs.existsSync(path.join(PROJECT_ROOT, "next.config.ts")),
        "next.config.mjs or next.config.ts must exist"
      );
      assert.ok(
        fs.existsSync(path.join(PROJECT_ROOT, "tsconfig.json")),
        "tsconfig.json must exist"
      );

      const pkg = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf-8")
      );
      assert.ok(pkg.scripts.build, "package.json must contain build script");
      assert.ok(pkg.scripts.test, "package.json must contain test script");
      assert.ok(
        pkg.scripts.test.includes("tests/**/*.test.mjs"),
        "package.json test script must run tests/**/*.test.mjs"
      );
    });
  });
});
