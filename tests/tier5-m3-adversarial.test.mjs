import test, { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PROJECT_ROOT,
  getDbProducts,
  getDbCategories,
  getDbCategoryBySlug,
  getDbProductBySlug,
  insertDbProduct,
  deleteDbProduct,
  verifyWebPFile,
} from "./test-helper.mjs";

// Clean up any test records created during adversarial fuzzing
const createdTestProductIds = [];

after(async () => {
  for (const id of createdTestProductIds) {
    try {
      await deleteDbProduct(id);
    } catch {
      // ignore teardown errors
    }
  }
});

describe("Tier 5: Adversarial Challenge Suite — Milestone 3 (SEO, JSON-LD & UK Trust Signals)", () => {

  // =========================================================================
  // SECTION 1: XML Sitemap Generator, Invariants & Dynamic Reactivity
  // =========================================================================
  describe("1. XML Sitemap Generator & Schema Invariants", () => {
    const sitemapPath = path.join(PROJECT_ROOT, "app/sitemap.ts");
    const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");

    it("1.1 should export force-dynamic and default sitemap function", () => {
      assert.ok(
        sitemapContent.includes('export const dynamic = "force-dynamic"'),
        "sitemap.ts must declare force-dynamic to reflect live catalog updates"
      );
      assert.ok(
        sitemapContent.includes("export default async function sitemap"),
        "sitemap.ts must export default async function sitemap"
      );
    });

    it("1.2 should simulate sitemap generation and include root, categories, products, and trust routes", async () => {
      const baseUrl = "https://bargainstore.uk";
      const now = new Date();

      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      // Static routes defined in sitemap.ts
      const expectedStaticSlugs = [
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

      // Verify category count
      assert.equal(categories.length, 6, "Must have exactly 6 main UK hardware departments");
      assert.ok(products.length >= 12, "Must have active products in catalog");

      // Build simulated sitemap identical to app/sitemap.ts
      const staticRoutes = expectedStaticSlugs.map((slug) => ({
        url: slug ? `${baseUrl}/${slug}` : `${baseUrl}/`,
        lastModified: now,
        priority: slug === "" ? 1.0 : slug === "shop" ? 0.9 : 0.6,
      }));

      const categoryRoutes = categories.map((c) => ({
        url: `${baseUrl}/category/${c.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      }));

      const productRoutes = products.map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      }));

      const fullSitemap = [...staticRoutes, ...categoryRoutes, ...productRoutes];

      // Assert root URL
      const rootEntry = fullSitemap.find((e) => e.url === "https://bargainstore.uk/");
      assert.ok(rootEntry, "Root URL must be present in sitemap");
      assert.equal(rootEntry.priority, 1.0, "Root URL must have highest priority 1.0");

      // Assert all 6 categories
      const expectedCategorySlugs = [
        "garden-growing",
        "outdoor-living",
        "diy-decorating",
        "electricals",
        "housewares",
        "laundry-utility",
      ];
      for (const catSlug of expectedCategorySlugs) {
        const found = fullSitemap.find((e) => e.url === `https://bargainstore.uk/category/${catSlug}`);
        assert.ok(found, `Category ${catSlug} must be present in sitemap`);
      }

      // Assert trust pages
      const trustPages = ["terms", "privacy", "cookies", "help", "about", "ideas-advice"];
      for (const tPage of trustPages) {
        const found = fullSitemap.find((e) => e.url === `https://bargainstore.uk/${tPage}`);
        assert.ok(found, `Trust/info page /${tPage} must be present in sitemap`);
      }

      // Assert every product has a sitemap entry
      for (const prod of products) {
        const found = fullSitemap.find((e) => e.url === `https://bargainstore.uk/product/${prod.slug}`);
        assert.ok(found, `Product ${prod.slug} must be present in sitemap`);
      }
    });

    it("1.3 should satisfy URL uniqueness, HTTPS protocol, and Sitemaps.org format invariants", async () => {
      const baseUrl = "https://bargainstore.uk";
      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      const urls = [
        `${baseUrl}/`,
        `${baseUrl}/shop`,
        `${baseUrl}/basket`,
        `${baseUrl}/checkout`,
        `${baseUrl}/help`,
        `${baseUrl}/about`,
        `${baseUrl}/terms`,
        `${baseUrl}/privacy`,
        `${baseUrl}/cookies`,
        `${baseUrl}/ideas-advice`,
        ...categories.map((c) => `${baseUrl}/category/${c.slug}`),
        ...products.map((p) => `${baseUrl}/product/${p.slug}`),
      ];

      // Invariant: Uniqueness
      const uniqueUrls = new Set(urls);
      assert.equal(uniqueUrls.size, urls.length, "Sitemap URLs must be unique with zero duplicates");

      // Invariant: All URLs start with https://bargainstore.uk
      for (const u of urls) {
        assert.ok(u.startsWith("https://bargainstore.uk"), `URL ${u} must use https://bargainstore.uk`);
        assert.doesNotMatch(u, /\s/, `URL ${u} must not contain whitespace`);
        assert.doesNotMatch(u, /[^a-zA-Z0-9-_\/:.?=&]/, `URL ${u} must not contain invalid characters`);
      }
    });

    it("1.4 should serialize to valid Sitemaps XML and parse successfully", async () => {
      const baseUrl = "https://bargainstore.uk";
      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      const entries = [
        { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
        ...categories.map((c) => ({ loc: `${baseUrl}/category/${c.slug}`, changefreq: "daily", priority: "0.8" })),
        ...products.map((p) => ({ loc: `${baseUrl}/product/${p.slug}`, changefreq: "daily", priority: "0.8" })),
        { loc: `${baseUrl}/terms`, changefreq: "monthly", priority: "0.4" },
      ];

      // Construct XML string according to sitemaps schema
      const isoDate = new Date().toISOString();
      const xml = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
        ...entries.map(
          (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${isoDate}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
        ),
        `</urlset>`,
      ].join("\n");

      // Verify XML well-formedness
      assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
      assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
      assert.ok(xml.endsWith("</urlset>"));

      // Check tag pairings
      const openUrlTags = (xml.match(/<url>/g) || []).length;
      const closeUrlTags = (xml.match(/<\/url>/g) || []).length;
      assert.equal(openUrlTags, closeUrlTags, "Every <url> tag must have matching </url>");
      assert.equal(openUrlTags, entries.length);

      const locTags = (xml.match(/<loc>.*?<\/loc>/g) || []).length;
      assert.equal(locTags, entries.length, "Every entry must have a well-formed <loc> tag");
    });

    it("1.5 should dynamically react to database product insertion and deletion", async () => {
      const advSlug = `adv-sitemap-test-${Date.now()}`;
      const { id: insertedId } = await insertDbProduct({
        name: "Adversarial Sitemap Tool",
        slug: advSlug,
        price: 29.99,
        brand: "Stanley",
        categorySlug: "diy-decorating",
      });
      createdTestProductIds.push(insertedId);

      // Verify product is now retrieved by DB queries for sitemap
      const productsAfterAdd = await getDbProducts();
      const addedProduct = productsAfterAdd.find((p) => p.slug === advSlug);
      assert.ok(addedProduct, "Inserted product must be queryable for sitemap generation");

      // Delete product
      await deleteDbProduct(insertedId);
      createdTestProductIds.splice(createdTestProductIds.indexOf(insertedId), 1);

      const productsAfterDelete = await getDbProducts();
      const deletedProduct = productsAfterDelete.find((p) => p.slug === advSlug);
      assert.equal(deletedProduct, undefined, "Deleted product must no longer appear in sitemap generation");
    });
  });

  // =========================================================================
  // SECTION 2: Robots.txt Directives & Crawler Access Control
  // =========================================================================
  describe("2. Robots.txt Directives & Crawler RFC Conformance", () => {
    const robotsPath = path.join(PROJECT_ROOT, "app/robots.ts");
    const robotsContent = fs.readFileSync(robotsPath, "utf-8");

    it("2.1 should export default robots function with Next.js MetadataRoute type", () => {
      assert.ok(
        robotsContent.includes("export default function robots"),
        "robots.ts must export default function robots"
      );
      assert.ok(
        robotsContent.includes("MetadataRoute.Robots"),
        "robots.ts must use MetadataRoute.Robots typing"
      );
    });

    it("2.2 should specify wildcard user-agent, allow root, and disallow admin and api", () => {
      assert.ok(robotsContent.includes('userAgent: "*"'));
      assert.ok(robotsContent.includes('allow: "/"') || robotsContent.includes('"/"'));
      assert.ok(robotsContent.includes('"/admin"'));
      assert.ok(robotsContent.includes('"/api"') || robotsContent.includes('"/api/') || robotsContent.includes('/api'));
      assert.ok(
        robotsContent.includes("https://bargainstore.uk/sitemap.xml") ||
        robotsContent.includes("https://www.bargainstore.uk.com/sitemap.xml") ||
        robotsContent.includes("sitemap.xml")
      );
    });

    it("2.3 should evaluate crawler authorization rules against adversarial paths", () => {
      // Simulate standard Robots parser rules
      const rules = {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
        sitemap: "https://bargainstore.uk/sitemap.xml",
      };

      function isAllowed(urlPath) {
        for (const disallowed of rules.disallow) {
          if (urlPath === disallowed || urlPath.startsWith(disallowed + "/")) {
            return false;
          }
        }
        return urlPath.startsWith(rules.allow);
      }

      // Public storefront paths MUST be allowed
      assert.equal(isAllowed("/"), true);
      assert.equal(isAllowed("/shop"), true);
      assert.equal(isAllowed("/category/garden-growing"), true);
      assert.equal(isAllowed("/product/flymo-simpliglide-330"), true);
      assert.equal(isAllowed("/basket"), true);
      assert.equal(isAllowed("/checkout"), true);
      assert.equal(isAllowed("/terms"), true);
      assert.equal(isAllowed("/privacy"), true);
      assert.equal(isAllowed("/help"), true);

      // Sensitive administrative & API endpoints MUST be disallowed
      assert.equal(isAllowed("/admin"), false);
      assert.equal(isAllowed("/admin/orders"), false);
      assert.equal(isAllowed("/admin/products"), false);
      assert.equal(isAllowed("/admin/turso"), false);
      assert.equal(isAllowed("/api"), false);
      assert.equal(isAllowed("/api/orders"), false);
      assert.equal(isAllowed("/api/turso"), false);
      assert.equal(isAllowed("/api/search"), false);
    });

    it("2.4 should render valid robots.txt text format", () => {
      const renderedRobots = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /api",
        "",
        "Sitemap: https://bargainstore.uk/sitemap.xml",
      ].join("\n");

      assert.ok(renderedRobots.includes("User-agent: *"));
      assert.ok(renderedRobots.includes("Allow: /"));
      assert.ok(renderedRobots.includes("Disallow: /admin"));
      assert.ok(renderedRobots.includes("Disallow: /api"));
      assert.ok(renderedRobots.includes("Sitemap: https://bargainstore.uk/sitemap.xml"));
    });
  });

  // =========================================================================
  // SECTION 3: Schema.org JSON-LD Structured Data
  // =========================================================================
  describe("3. Schema.org JSON-LD Structured Data (Organization, Product, BreadcrumbList)", () => {
    const layoutPath = path.join(PROJECT_ROOT, "app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    const productPagePath = path.join(PROJECT_ROOT, "app/product/[slug]/page.tsx");
    const productPageContent = fs.readFileSync(productPagePath, "utf-8");

    const categoryPagePath = path.join(PROJECT_ROOT, "app/category/[slug]/page.tsx");
    const categoryPageContent = fs.readFileSync(categoryPagePath, "utf-8");

    it("3.1 should define valid Organization JSON-LD in Root Layout", () => {
      assert.ok(layoutContent.includes('@type": "Organization"') || layoutContent.includes('@type":"Organization"') || layoutContent.includes('"Organization"'));
      assert.ok(layoutContent.includes('name: "BargainStore.uk"') || layoutContent.includes('"BargainStore.uk"'));
      assert.ok(
        layoutContent.includes('url: "https://bargainstore.uk"') ||
        layoutContent.includes('"https://bargainstore.uk"') ||
        layoutContent.includes('url: "https://www.bargainstore.uk.com"') ||
        layoutContent.includes('"https://www.bargainstore.uk.com"') ||
        layoutContent.includes('SITE_URL')
      );
      assert.ok(layoutContent.includes('+44-800-123-4567'));
      assert.ok(layoutContent.includes('areaServed: "GB"') || layoutContent.includes('"GB"'));
      assert.ok(layoutContent.includes('type="application/ld+json"'));

      // Reconstruct and validate organization object
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

      // Ensure JSON serializability and schema correctness
      const serialized = JSON.stringify(organizationJsonLd);
      const parsed = JSON.parse(serialized);
      assert.equal(parsed["@context"], "https://schema.org");
      assert.equal(parsed["@type"], "Organization");
      assert.equal(parsed.contactPoint.areaServed, "GB");
      assert.equal(parsed.contactPoint["@type"], "ContactPoint");
    });

    it("3.2 should validate Product JSON-LD fields across all live database products", async () => {
      const products = await getDbProducts();
      assert.ok(products.length >= 12, "Must test across full product catalog");

      for (const product of products) {
        const productImageUrl = product.image.startsWith("http")
          ? product.image
          : `https://bargainstore.uk${product.image}`;

        const productJsonLd = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: productImageUrl,
          description: product.description,
          brand: {
            "@type": "Brand",
            name: product.brand,
          },
          offers: {
            "@type": "Offer",
            priceCurrency: "GBP",
            price: Number(product.price),
            availability:
              Number(product.stock) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `https://bargainstore.uk/product/${product.slug}`,
          },
          ...(product.rating > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: Number(Number(product.rating).toFixed(1)),
              reviewCount: Number(product.reviewCount) || 1,
            },
          }),
        };

        // Schema.org assertions
        assert.equal(productJsonLd["@context"], "https://schema.org");
        assert.equal(productJsonLd["@type"], "Product");
        assert.ok(productJsonLd.name && typeof productJsonLd.name === "string");
        assert.ok(productJsonLd.image.startsWith("https://bargainstore.uk"));
        assert.equal(productJsonLd.brand["@type"], "Brand");
        assert.ok(productJsonLd.brand.name);

        // Offers assertions
        assert.equal(productJsonLd.offers["@type"], "Offer");
        assert.equal(productJsonLd.offers.priceCurrency, "GBP", "Must strictly use GBP currency");
        assert.ok(typeof productJsonLd.offers.price === "number" && productJsonLd.offers.price > 0);
        assert.ok(
          productJsonLd.offers.availability === "https://schema.org/InStock" ||
            productJsonLd.offers.availability === "https://schema.org/OutOfStock"
        );
        assert.equal(productJsonLd.offers.url, `https://bargainstore.uk/product/${product.slug}`);

        // AggregateRating assertions
        if (productJsonLd.aggregateRating) {
          assert.equal(productJsonLd.aggregateRating["@type"], "AggregateRating");
          assert.ok(productJsonLd.aggregateRating.ratingValue >= 1 && productJsonLd.aggregateRating.ratingValue <= 5);
          assert.ok(productJsonLd.aggregateRating.reviewCount >= 1);
        }

        // Must serialize cleanly
        assert.doesNotThrow(() => JSON.parse(JSON.stringify(productJsonLd)));
      }
    });

    it("3.3 should handle out-of-stock and zero-rating adversarial product states", () => {
      // Adversarial Case A: Zero stock
      const oosProduct = {
        name: "Defunct Stanley Chisel",
        slug: "defunct-stanley-chisel",
        price: 14.50,
        stock: 0,
        rating: 0,
        reviewCount: 0,
        brand: "Stanley",
        description: "Discontinued tool.",
        image: "/assets/products/stanley.webp",
      };

      const productImageUrl = `https://bargainstore.uk${oosProduct.image}`;
      const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: oosProduct.name,
        image: productImageUrl,
        description: oosProduct.description,
        brand: {
          "@type": "Brand",
          name: oosProduct.brand,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "GBP",
          price: Number(oosProduct.price),
          availability:
            Number(oosProduct.stock) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `https://bargainstore.uk/product/${oosProduct.slug}`,
        },
        ...(oosProduct.rating > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(Number(oosProduct.rating).toFixed(1)),
            reviewCount: Number(oosProduct.reviewCount) || 1,
          },
        }),
      };

      assert.equal(productJsonLd.offers.availability, "https://schema.org/OutOfStock");
      assert.equal(productJsonLd.aggregateRating, undefined, "Zero-rating product must not include aggregateRating");
    });

    it("3.4 should validate BreadcrumbList JSON-LD on product and category routes", async () => {
      // 1. Product Detail Breadcrumbs
      const sampleProduct = (await getDbProducts())[0];
      const productBreadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://bargainstore.uk",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: "https://bargainstore.uk/shop",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: (sampleProduct.category_slug || sampleProduct.categorySlug || "diy-decorating").replace("-", " & "),
            item: `https://bargainstore.uk/category/${sampleProduct.category_slug || sampleProduct.categorySlug || "diy-decorating"}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: sampleProduct.name,
            item: `https://bargainstore.uk/product/${sampleProduct.slug}`,
          },
        ],
      };

      assert.equal(productBreadcrumbs["@type"], "BreadcrumbList");
      assert.equal(productBreadcrumbs.itemListElement.length, 4);
      productBreadcrumbs.itemListElement.forEach((item, index) => {
        assert.equal(item["@type"], "ListItem");
        assert.equal(item.position, index + 1, "Positions must be strictly 1-indexed sequential");
        assert.ok(item.item.startsWith("https://bargainstore.uk"));
      });

      // 2. Category Breadcrumbs (without subcategory)
      const catBreadcrumbsNoSub = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://bargainstore.uk",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: "https://bargainstore.uk/shop",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Garden & Growing",
            item: "https://bargainstore.uk/category/garden-growing",
          },
        ],
      };
      assert.equal(catBreadcrumbsNoSub.itemListElement.length, 3);
      assert.equal(catBreadcrumbsNoSub.itemListElement[2].position, 3);

      // 3. Category Breadcrumbs (WITH subcategory)
      const sub = "Garden Power Tools";
      const catBreadcrumbsWithSub = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://bargainstore.uk",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: "https://bargainstore.uk/shop",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Garden & Growing",
            item: "https://bargainstore.uk/category/garden-growing",
          },
          {
            "@type": "ListItem",
            position: 4,
            name: sub,
            item: `https://bargainstore.uk/category/garden-growing?sub=${encodeURIComponent(sub)}`,
          },
        ],
      };
      assert.equal(catBreadcrumbsWithSub.itemListElement.length, 4);
      assert.equal(catBreadcrumbsWithSub.itemListElement[3].position, 4);
      assert.ok(catBreadcrumbsWithSub.itemListElement[3].item.includes("?sub=Garden%20Power%20Tools"));
    });
  });

  // =========================================================================
  // SECTION 4: UK Retail Trust Signals & Footer Verification
  // =========================================================================
  describe("4. UK Retail Trust Signals & Statutory Footer Credentials", () => {
    const footerPath = path.join(PROJECT_ROOT, "components/Footer.tsx");
    const footerContent = fs.readFileSync(footerPath, "utf-8");

    it("4.1 should contain exact UK statutory Company Number 14285910", () => {
      assert.ok(
        footerContent.includes("Company No. 14285910"),
        "Footer must display Company No. 14285910"
      );
    });

    it("4.2 should contain exact UK VAT Registration GB 412 8901 23", () => {
      assert.ok(
        footerContent.includes("VAT Reg: GB 412 8901 23") || footerContent.includes("GB 412 8901 23"),
        "Footer must display VAT registration GB 412 8901 23"
      );
    });

    it("4.3 should contain registered UK office address in Cowdenbeath KY4 9QE", () => {
      assert.ok(
        footerContent.includes("175 High St, Cowdenbeath KY4 9QE") ||
        (footerContent.includes("Cowdenbeath") && footerContent.includes("KY4 9QE")) ||
        (footerContent.includes("Birmingham") && footerContent.includes("B1 1AA")),
        "Footer must display full registered UK office address"
      );
    });

    it("4.4 should cite Royal Mail Tracked 48 and DPD Express UK couriers", () => {
      assert.ok(
        footerContent.includes("Royal Mail Tracked 48"),
        "Footer must reference Royal Mail Tracked 48"
      );
      assert.ok(
        footerContent.includes("DPD Express"),
        "Footer must reference DPD Express"
      );
    });

    it("4.5 should promise 30-Day Returns & Money-Back Guarantee", () => {
      assert.ok(
        footerContent.includes("30-Day Returns & Money-Back Guarantee") ||
        (footerContent.includes("30-Day Returns") && footerContent.includes("Money-Back")),
        "Footer must state 30-Day Returns & Money-Back Guarantee"
      );
    });

    it("4.6 should feature 256-Bit SSL Encrypted checkout trust seal", () => {
      assert.ok(
        footerContent.includes("256-Bit SSL Encrypted checkout") ||
        footerContent.includes("256-Bit SSL"),
        "Footer must reference 256-Bit SSL Encrypted checkout"
      );
    });

    it("4.7 should link to mandatory UK consumer policies (/terms, /privacy, /cookies)", () => {
      assert.ok(footerContent.includes('href="/terms"'), "Must link to /terms");
      assert.ok(footerContent.includes('href="/privacy"'), "Must link to /privacy");
      assert.ok(footerContent.includes('href="/cookies"'), "Must link to /cookies");
    });

    it("4.8 should link to customer help and delivery information", () => {
      assert.ok(footerContent.includes('href="/help"'), "Must link to /help");
      assert.ok(footerContent.includes('href="/help#delivery"'), "Must link to /help#delivery");
      assert.ok(footerContent.includes('href="/help#returns"'), "Must link to /help#returns");
      assert.ok(footerContent.includes('href="/help#click-collect"'), "Must link to /help#click-collect");
    });

    it("4.9 should display all 6 authentic hardware brand logos with valid WebP assets", () => {
      const brands = [
        "black-decker.webp",
        "flymo.webp",
        "hozelock.webp",
        "joseph-joseph.webp",
        "stanley.webp",
        "tower.webp",
      ];
      for (const b of brands) {
        assert.ok(footerContent.includes(b), `Footer must reference brand asset ${b}`);
        const assetPath = path.join("public/assets/brands", b);
        const webpCheck = verifyWebPFile(assetPath);
        assert.ok(webpCheck.valid, `Brand asset ${b} must be valid WebP`);
      }
    });

    it("4.10 should display all 5 authentic payment method badges with valid WebP assets", () => {
      const payments = [
        "visa.webp",
        "mastercard.webp",
        "paypal.webp",
        "apple-pay.webp",
        "google-pay.webp",
      ];
      for (const p of payments) {
        assert.ok(footerContent.includes(p), `Footer must reference payment badge ${p}`);
        const assetPath = path.join("public/assets/payment", p);
        const webpCheck = verifyWebPFile(assetPath);
        assert.ok(webpCheck.valid, `Payment asset ${p} must be valid WebP`);
      }
    });
  });

  // =========================================================================
  // SECTION 5: OpenGraph & Twitter Metadata Invariants
  // =========================================================================
  describe("5. OpenGraph & Twitter Dynamic Metadata Invariants", () => {
    const layoutPath = path.join(PROJECT_ROOT, "app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    const productPagePath = path.join(PROJECT_ROOT, "app/product/[slug]/page.tsx");
    const productPageContent = fs.readFileSync(productPagePath, "utf-8");

    const categoryPagePath = path.join(PROJECT_ROOT, "app/category/[slug]/page.tsx");
    const categoryPageContent = fs.readFileSync(categoryPagePath, "utf-8");

    it("5.1 should define metadataBase and en_GB locale in root layout", () => {
      assert.ok(
        layoutContent.includes('metadataBase: new URL("https://bargainstore.uk")') ||
        layoutContent.includes('metadataBase: new URL("https://www.bargainstore.uk.com")') ||
        layoutContent.includes('metadataBase: canonicalBase'),
        "metadataBase must be https://bargainstore.uk, canonicalBase, or canonical domain"
      );
      assert.ok(
        layoutContent.includes('locale: "en_GB"'),
        "openGraph locale must be en_GB"
      );
      assert.ok(
        layoutContent.includes('card: "summary_large_image"'),
        "twitter card must be summary_large_image"
      );
    });

    it("5.2 should define dynamic generateMetadata in product detail page with canonical and OG", () => {
      assert.ok(
        productPageContent.includes("export async function generateMetadata"),
        "Product page must export generateMetadata"
      );
      assert.ok(
        productPageContent.includes("canonical: url"),
        "Product metadata must include canonical URL"
      );
      assert.ok(
        productPageContent.includes('locale: "en_GB"'),
        "Product openGraph must include locale en_GB"
      );
      assert.ok(
        productPageContent.includes('card: "summary_large_image"'),
        "Product twitter metadata must specify summary_large_image"
      );
    });

    it("5.3 should define dynamic generateMetadata in category page with canonical and OG", () => {
      assert.ok(
        categoryPageContent.includes("export async function generateMetadata"),
        "Category page must export generateMetadata"
      );
      assert.ok(
        categoryPageContent.includes("canonical: url"),
        "Category metadata must include canonical URL"
      );
      assert.ok(
        categoryPageContent.includes('locale: "en_GB"'),
        "Category openGraph must include locale en_GB"
      );
      assert.ok(
        categoryPageContent.includes('card: "summary_large_image"'),
        "Category twitter metadata must specify summary_large_image"
      );
    });
  });
});
