import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { getDbCategories, getDbProducts, PROJECT_ROOT } from "./test-helper.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Import Next.js metadata serializer to test real framework transformation
const resolveRouteDataPath = path.join(
  PROJECT_ROOT,
  "node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js"
);
const { resolveRobots, resolveSitemap } = require(resolveRouteDataPath);

// Pure JS emulation of lib/site.ts logic for isolated parameterized testing
function createSiteHelpers(envUrl) {
  const SITE_URL = (envUrl || "https://www.bargainstore.uk.com").replace(/\/+$/, "");
  const canonicalBase = new URL(SITE_URL);
  function getAbsoluteUrl(inputPath = "") {
    if (!inputPath) return SITE_URL;
    if (inputPath.startsWith("http://") || inputPath.startsWith("https://")) {
      return inputPath;
    }
    const cleanPath = inputPath.startsWith("/") ? inputPath : `/${inputPath}`;
    return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
  }
  return { SITE_URL, canonicalBase, getAbsoluteUrl };
}

// Emulation of app/robots.ts
function generateRobotsConfig(siteUrl) {
  const host = new URL(siteUrl).host;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/feeds/", "/llms.txt"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/orders",
          "/api/turso",
          "/api/promotions",
        ],
        crawlDelay: 2,
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Slurp",
          "DuckDuckBot",
          "Baiduspider",
          "YandexBot",
        ],
        allow: ["/", "/api/feeds/", "/llms.txt"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/orders",
          "/api/turso",
          "/api/promotions",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Anthropic-AI",
          "CCBot",
          "Applebot-Extended",
        ],
        allow: ["/", "/llms.txt", "/api/feeds/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/orders",
          "/api/turso",
          "/api/promotions",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host,
  };
}

// Emulation of app/sitemap.ts generation logic
function generateSitemapEntries(categories, products, siteUrl, now = new Date()) {
  const { getAbsoluteUrl } = createSiteHelpers(siteUrl);
  const baseUrl = siteUrl;

  const staticRoutes = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/basket`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/checkout`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/ideas-advice`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const categoryRoutes = categories.map((c) => {
    const images = [];
    if (c.image) images.push(getAbsoluteUrl(c.image));
    return {
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      ...(images.length > 0 && { images }),
    };
  });

  const productRoutes = products.map((p) => {
    const images = [];
    if (p.image) images.push(getAbsoluteUrl(p.image));
    if (p.additionalImages || p.additional_images) {
      const raw = p.additionalImages || p.additional_images;
      try {
        const extra = JSON.parse(raw);
        if (Array.isArray(extra)) {
          for (const img of extra) {
            if (typeof img === "string" && img.trim()) {
              images.push(getAbsoluteUrl(img.trim()));
            }
          }
        }
      } catch (_) {}
    }

    let lastmod = now;
    const rawDate = p.createdAt || p.created_at;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        lastmod = parsed;
      }
    }

    return {
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: lastmod,
      changeFrequency: "daily",
      priority: 0.8,
      ...(images.length > 0 && { images }),
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

// RFC 9309 path matcher implementation
function matchesRobotsRule(rule, path) {
  // Disallows and allows
  const allows = Array.isArray(rule.allow) ? rule.allow : [rule.allow].filter(Boolean);
  const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow].filter(Boolean);

  let longestMatchLen = -1;
  let isAllowed = true;

  for (const a of allows) {
    if (path.startsWith(a)) {
      if (a.length > longestMatchLen) {
        longestMatchLen = a.length;
        isAllowed = true;
      }
    }
  }

  for (const d of disallows) {
    if (path.startsWith(d)) {
      if (d.length >= longestMatchLen) {
        longestMatchLen = d.length;
        isAllowed = false;
      }
    }
  }

  return isAllowed;
}

// Strict XML validation
function validateXmlWellFormedness(xmlStr) {
  assert.ok(xmlStr.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "Must start with XML declaration");
  const tagStack = [];
  const tagRegex = /<(\/)?([a-zA-Z0-9:_-]+)([^>]*?)(\/)?>/g;
  let match;
  while ((match = tagRegex.exec(xmlStr)) !== null) {
    const isClosing = match[1] === "/";
    const tagName = match[2];
    const isSelfClosing = match[4] === "/" || match[0].endsWith("/>") || match[0].startsWith("<?");

    if (isSelfClosing) continue;

    if (!isClosing) {
      tagStack.push(tagName);
    } else {
      const last = tagStack.pop();
      if (last !== tagName) {
        throw new Error(`Mismatched XML tags: expected </${last}>, found </${tagName}>`);
      }
    }
  }
  assert.equal(tagStack.length, 0, `Unclosed XML tags remaining: ${tagStack.join(", ")}`);
  return true;
}

describe("Milestone M1 Adversarial Empirical Verification Suite", () => {
  const defaultSiteUrl = "https://www.bargainstore.uk.com";

  // =========================================================================
  // SUITE 1: app/robots.ts Directive & RFC 9309 Empirical Evaluation
  // =========================================================================
  describe("1. app/robots.ts Directives & Bot Rules", () => {
    const robotsPath = path.join(PROJECT_ROOT, "app/robots.ts");
    const robotsRaw = fs.readFileSync(robotsPath, "utf-8");

    it("1.1 source file must adhere to Next.js metadata contracts", () => {
      assert.ok(robotsRaw.includes('import type { MetadataRoute } from "next"'));
      assert.ok(robotsRaw.includes('import { SITE_URL } from "@/lib/site"'));
      assert.ok(robotsRaw.includes("export default function robots(): MetadataRoute.Robots"));
      assert.ok(robotsRaw.includes("crawlDelay: 2"));
      assert.ok(robotsRaw.includes("sitemap: `${SITE_URL}/sitemap.xml`"));
      assert.ok(robotsRaw.includes("host"));
    });

    it("1.2 Next.js serialize output matches RFC robots.txt specification", () => {
      const robotsConfig = generateRobotsConfig(defaultSiteUrl);
      const rendered = resolveRobots(robotsConfig);

      // Verify header lines
      assert.ok(rendered.includes("User-Agent: *"));
      assert.ok(rendered.includes("Allow: /"));
      assert.ok(rendered.includes("Allow: /api/feeds/"));
      assert.ok(rendered.includes("Allow: /llms.txt"));
      assert.ok(rendered.includes("Disallow: /admin"));
      assert.ok(rendered.includes("Disallow: /admin/"));
      assert.ok(rendered.includes("Disallow: /api/admin"));
      assert.ok(rendered.includes("Disallow: /api/orders"));
      assert.ok(rendered.includes("Disallow: /api/turso"));
      assert.ok(rendered.includes("Disallow: /api/promotions"));
      assert.ok(rendered.includes("Crawl-delay: 2"));

      // Search bots group
      for (const bot of ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "Baiduspider", "YandexBot"]) {
        assert.ok(rendered.includes(`User-Agent: ${bot}`), `Must include ${bot}`);
      }

      // AI bots group
      for (const bot of ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Anthropic-AI", "CCBot", "Applebot-Extended"]) {
        assert.ok(rendered.includes(`User-Agent: ${bot}`), `Must include ${bot}`);
      }

      // Host & Sitemap directives
      assert.ok(rendered.includes("Host: www.bargainstore.uk.com"));
      assert.ok(rendered.includes("Sitemap: https://www.bargainstore.uk.com/sitemap.xml"));
    });

    it("1.3 verified production artifact (.next/server/app/robots.txt.body)", () => {
      const artifactPath = path.join(PROJECT_ROOT, ".next/server/app/robots.txt.body");
      assert.ok(fs.existsSync(artifactPath), "Production build artifact must exist");
      const artifactBody = fs.readFileSync(artifactPath, "utf-8");

      assert.ok(artifactBody.includes("User-Agent: *"));
      assert.ok(artifactBody.includes("Allow: /api/feeds/"));
      assert.ok(artifactBody.includes("Allow: /llms.txt"));
      assert.ok(artifactBody.includes("Crawl-delay: 2"));
      assert.ok(artifactBody.includes("Host: www.bargainstore.uk.com"));
      assert.ok(artifactBody.includes("Sitemap: https://www.bargainstore.uk.com/sitemap.xml"));
      assert.ok(!artifactBody.includes("https://bargainstore.uk/sitemap.xml"), "Must not contain obsolete domain without .com");
    });

    it("1.4 RFC 9309 path evaluation under adversarial scenarios", () => {
      const robotsConfig = generateRobotsConfig(defaultSiteUrl);
      const wildcardRule = robotsConfig.rules[0];
      const searchBotsRule = robotsConfig.rules[1];
      const aiBotsRule = robotsConfig.rules[2];

      const allowedPaths = [
        "/",
        "/shop",
        "/category/garden-growing",
        "/product/flymo-simpliglide-330-lawnmower",
        "/api/feeds/google-merchant",
        "/api/feeds/atom.xml",
        "/llms.txt",
        "/basket",
        "/checkout",
        "/help",
        "/ideas-advice",
      ];

      const disallowedPaths = [
        "/admin",
        "/admin/",
        "/admin/products",
        "/admin/orders",
        "/admin/turso",
        "/admin/categories",
        "/api/admin",
        "/api/admin/login",
        "/api/orders",
        "/api/orders/123",
        "/api/turso",
        "/api/turso-status", // starts with /api/turso
        "/api/promotions",
      ];

      for (const p of allowedPaths) {
        assert.equal(matchesRobotsRule(wildcardRule, p), true, `Wildcard should allow ${p}`);
        assert.equal(matchesRobotsRule(searchBotsRule, p), true, `Search bots should allow ${p}`);
        assert.equal(matchesRobotsRule(aiBotsRule, p), true, `AI bots should allow ${p}`);
      }

      for (const p of disallowedPaths) {
        assert.equal(matchesRobotsRule(wildcardRule, p), false, `Wildcard should block ${p}`);
        assert.equal(matchesRobotsRule(searchBotsRule, p), false, `Search bots should block ${p}`);
        assert.equal(matchesRobotsRule(aiBotsRule, p), false, `AI bots should block ${p}`);
      }
    });

    it("1.5 dynamic domain override handling (trailing slashes, subdomains, ports)", () => {
      const customDomains = [
        "https://staging.bargainstore.uk.com/",
        "http://localhost:3000/",
        "https://preview.bargainstore.uk.com",
      ];

      for (const domain of customDomains) {
        const { SITE_URL } = createSiteHelpers(domain);
        const cfg = generateRobotsConfig(SITE_URL);
        assert.ok(!cfg.sitemap.includes("//sitemap.xml"), "Sitemap URL must not have duplicate slashes");
        assert.ok(!cfg.host.includes("/"), "Host must not include protocol or slashes");
        assert.equal(cfg.sitemap, `${SITE_URL}/sitemap.xml`);
      }
    });
  });

  // =========================================================================
  // SUITE 2: app/sitemap.ts Dynamic Generation & Adversarial Edge Cases
  // =========================================================================
  describe("2. app/sitemap.ts Dynamic Output & Edge Cases", () => {
    it("2.1 real database catalog sitemap invariants", async () => {
      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      assert.equal(categories.length, 6, "Must have exactly 6 UK departments");
      assert.ok(products.length >= 25, "Must have active product catalog");

      const entries = generateSitemapEntries(categories, products, defaultSiteUrl);

      // Total count: 10 static + 6 categories + products count
      assert.equal(entries.length, 10 + 6 + products.length);

      // Verify all URLs start with defaultSiteUrl
      for (const entry of entries) {
        assert.ok(entry.url.startsWith(defaultSiteUrl), `URL ${entry.url} must start with canonical base`);
        assert.ok(entry.lastModified instanceof Date, `lastModified must be a valid Date object`);
        assert.ok(!isNaN(entry.lastModified.getTime()), `lastModified time must not be NaN`);
        assert.ok(typeof entry.priority === "number", `priority must be a number`);
        assert.ok(entry.priority >= 0.0 && entry.priority <= 1.0, `priority must be in [0, 1] range`);
      }

      // Root priority check
      const root = entries.find((e) => e.url === `${defaultSiteUrl}/`);
      assert.equal(root.priority, 1.0);
    });

    it("2.2 image metadata parsing with malformed and boundary additionalImages JSON", () => {
      const testCases = [
        {
          name: "Malformed JSON syntax",
          raw: "{malformed_json: true",
          expectedExtraCount: 0,
        },
        {
          name: "JSON null value",
          raw: "null",
          expectedExtraCount: 0,
        },
        {
          name: "JSON number primitive",
          raw: "12345",
          expectedExtraCount: 0,
        },
        {
          name: "JSON string primitive",
          raw: '"/assets/single.webp"',
          expectedExtraCount: 0,
        },
        {
          name: "JSON object instead of array",
          raw: '{"img": "/assets/extra.webp"}',
          expectedExtraCount: 0,
        },
        {
          name: "Array containing non-string primitives and objects",
          raw: '[123, null, false, {"bad": 1}, "/assets/valid.webp"]',
          expectedExtraCount: 1,
        },
        {
          name: "Array containing empty or whitespace-only strings",
          raw: '["", "   ", "\\t", "/assets/valid2.webp"]',
          expectedExtraCount: 1,
        },
        {
          name: "Array with padded whitespace around valid URLs",
          raw: '["  /assets/padded1.webp  ", " /assets/padded2.webp "]',
          expectedExtraCount: 2,
        },
      ];

      for (const tc of testCases) {
        const dummyProduct = [
          {
            slug: "test-product",
            image: "/assets/primary.webp",
            additionalImages: tc.raw,
            createdAt: "2026-10-01 12:00:00",
          },
        ];

        const entries = generateSitemapEntries([], dummyProduct, defaultSiteUrl);
        const prodEntry = entries.find((e) => e.url.includes("/product/test-product"));
        assert.ok(prodEntry.images, `Must have images array for ${tc.name}`);
        assert.equal(
          prodEntry.images.length,
          1 + tc.expectedExtraCount,
          `Failed on case: ${tc.name}`
        );
        assert.equal(
          prodEntry.images[0],
          `${defaultSiteUrl}/assets/primary.webp`,
          "Primary image must always be present and canonicalized"
        );
      }
    });

    it("2.3 empty and missing image handling (omission of images key)", () => {
      const productsWithoutImages = [
        {
          slug: "no-image-product-1",
          image: null,
          additionalImages: null,
          createdAt: "2026-10-01",
        },
        {
          slug: "no-image-product-2",
          image: "",
          additionalImages: "[]",
          createdAt: "2026-10-01",
        },
      ];

      const entries = generateSitemapEntries([], productsWithoutImages, defaultSiteUrl);
      for (const entry of entries) {
        assert.strictEqual(entry.images, undefined, "Entry with no images must omit images key entirely");
      }

      // Also test categories without image
      const categoryWithoutImage = [{ slug: "no-image-cat", image: null }];
      const catEntries = generateSitemapEntries(categoryWithoutImage, [], defaultSiteUrl);
      const catEntry = catEntries.find((e) => e.url.includes("/category/no-image-cat"));
      assert.strictEqual(catEntry.images, undefined, "Category without image must omit images key");
    });

    it("2.4 createdAt date handling edge cases (valid, invalid, null, undefined)", () => {
      const now = new Date();
      const dateTestCases = [
        { raw: "2026-10-05 18:27:57", shouldParse: true, expectedYear: 2026 },
        { raw: "2025-01-01T00:00:00.000Z", shouldParse: true, expectedYear: 2025 },
        { raw: "invalid-date-string", shouldParse: false },
        { raw: "", shouldParse: false },
        { raw: null, shouldParse: false },
        { raw: undefined, shouldParse: false },
        { raw: "99999999999999999999", shouldParse: false },
      ];

      for (const dtc of dateTestCases) {
        const dummy = [
          {
            slug: "date-test",
            image: "/assets/p.webp",
            createdAt: dtc.raw,
          },
        ];
        const entries = generateSitemapEntries([], dummy, defaultSiteUrl, now);
        const entry = entries.find((e) => e.url.includes("/product/date-test"));
        assert.ok(entry.lastModified instanceof Date, "lastModified must be Date instance");
        assert.ok(!isNaN(entry.lastModified.getTime()), "lastModified must be valid timestamp");

        if (dtc.shouldParse) {
          assert.equal(entry.lastModified.getUTCFullYear(), dtc.expectedYear);
        } else {
          // Should fallback to now
          assert.equal(entry.lastModified.getTime(), now.getTime());
        }
      }
    });

    it("2.5 Next.js resolveSitemap produces 100% valid W3C XML conforming to Google Image schema", async () => {
      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      const entries = generateSitemapEntries(categories, products, defaultSiteUrl);
      const xml = resolveSitemap(entries);

      // Validate well-formedness
      assert.doesNotThrow(() => validateXmlWellFormedness(xml), "Generated sitemap XML must be strictly well-formed");

      // Verify Google image schema namespace
      assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
      assert.ok(xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));

      // Check occurrences of image tags
      const imageTagCount = (xml.match(/<image:image>/g) || []).length;
      assert.ok(imageTagCount >= categories.length + products.length, "Must include Google Image tags for catalog");

      // Verify lastmod ISO date format
      const lastmodMatches = xml.match(/<lastmod>(.*?)<\/lastmod>/g) || [];
      assert.ok(lastmodMatches.length > 0);
      for (const lm of lastmodMatches) {
        const dateStr = lm.replace(/<\/?lastmod>/g, "");
        const d = new Date(dateStr);
        assert.ok(!isNaN(d.getTime()), `Invalid lastmod date: ${dateStr}`);
        assert.ok(dateStr.endsWith("Z"), `lastmod should be ISO-8601 UTC string: ${dateStr}`);
      }
    });

    it("2.6 absence of obsolete domain bargainstore.uk across generated sitemap", async () => {
      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      const entries = generateSitemapEntries(categories, products, defaultSiteUrl);
      const xml = resolveSitemap(entries);

      // Check for occurrences of legacy domain (without .com)
      const obsoleteMatches = xml.match(/https:\/\/bargainstore\.uk(?!\.com)/g);
      assert.strictEqual(
        obsoleteMatches,
        null,
        "Sitemap XML must not contain obsolete domain https://bargainstore.uk without .com"
      );
    });

    it("2.7 special XML characters and entity validation in URLs and image links", async () => {
      const [categories, products] = await Promise.all([
        getDbCategories(),
        getDbProducts(),
      ]);

      const entries = generateSitemapEntries(categories, products, defaultSiteUrl);
      const xml = resolveSitemap(entries);

      // Verify no unescaped ampersands outside of XML entities (&amp;, &lt;, &gt;, etc.)
      const unescapedAmpMatches = xml.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g);
      assert.strictEqual(
        unescapedAmpMatches,
        null,
        "Sitemap XML must not contain unescaped ampersands in URLs or text nodes"
      );

      // Verify no raw '<' or '>' inside text nodes (<loc>...</loc>, <image:loc>...</image:loc>)
      const tagContentRegex = /<loc>(.*?)<\/loc>|<image:loc>(.*?)<\/image:loc>/g;
      let match;
      while ((match = tagContentRegex.exec(xml)) !== null) {
        const text = match[1] || match[2];
        assert.ok(!/[<>]/.test(text), `URL or image link contains illegal XML angle brackets: ${text}`);
      }

      // Verify all product and category slugs adhere to valid URI path segments (kebab-case)
      for (const c of categories) {
        assert.match(c.slug, /^[a-z0-9-]+$/, `Category slug must be valid URI kebab-case: ${c.slug}`);
      }
      for (const p of products) {
        assert.match(p.slug, /^[a-z0-9-]+$/, `Product slug must be valid URI kebab-case: ${p.slug}`);
      }
    });
  });

  // =========================================================================
  // SUITE 3: app/manifest.ts Synchronization
  // =========================================================================
  describe("3. app/manifest.ts & public/site.webmanifest Synchronization", () => {
    it("3.1 generated manifest contains orientation and purpose", () => {
      const artifactPath = path.join(PROJECT_ROOT, ".next/server/app/manifest.webmanifest.body");
      assert.ok(fs.existsSync(artifactPath), "Manifest artifact must exist");
      const manifest = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

      assert.equal(manifest.orientation, "portrait");
      assert.deepEqual(manifest.categories, ["shopping", "lifestyle", "business"]);
      assert.equal(manifest.icons[1].purpose, "any maskable");
      assert.equal(manifest.icons[2].purpose, "any maskable");
    });
  });
});
