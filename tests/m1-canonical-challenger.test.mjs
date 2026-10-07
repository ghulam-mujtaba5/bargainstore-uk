/**
 * Adversarial Empirical Verification Suite for Milestone M1
 * Challenger: o4_m1_challenger_2
 * Scope: Canonical URL Normalization, lib/site.ts edge cases, Storefront HTML Canonical Tag & Hostname Audit
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

// Direct imports for standard tests
import { SITE_URL, getAbsoluteUrl, canonicalBase } from "../lib/site.ts";

// Helper to evaluate scripts in isolated Node subprocesses with distinct env vars
function evalWithEnv(envVars, script) {
  const result = execFileSync(
    process.execPath,
    ["--experimental-strip-types", "--input-type=module"],
    {
      input: script,
      env: { ...process.env, ...envVars },
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }
  );
  // Split lines and get only the script's output (filter out any experimental warnings)
  const lines = result.trim().split(/\r?\n/).filter(line => !line.includes("ExperimentalWarning") && !line.includes("MODULE_TYPELESS_PACKAGE_JSON"));
  return lines.join("\n").trim();
}

describe("1. lib/site.ts Environment Variable Configuration & URL Normalization", () => {
  it("1.1 Default fallback when NEXT_PUBLIC_SITE_URL is unset", () => {
    const script = `
      import { SITE_URL, canonicalBase } from './lib/site.ts';
      console.log(JSON.stringify({ SITE_URL, origin: canonicalBase.origin, hostname: canonicalBase.hostname }));
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "" }, script);
    const data = JSON.parse(output);
    assert.strictEqual(data.SITE_URL, "https://www.bargainstore.uk.com");
    assert.strictEqual(data.origin, "https://www.bargainstore.uk.com");
    assert.strictEqual(data.hostname, "www.bargainstore.uk.com");
  });

  it("1.2 Fallback when NEXT_PUBLIC_SITE_URL is empty string", () => {
    const script = `
      import { SITE_URL } from './lib/site.ts';
      console.log(SITE_URL);
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "" }, script);
    assert.strictEqual(output, "https://www.bargainstore.uk.com");
  });

  it("1.3 Single trailing slash is stripped", () => {
    const script = `
      import { SITE_URL } from './lib/site.ts';
      console.log(SITE_URL);
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "https://www.bargainstore.uk.com/" }, script);
    assert.strictEqual(output, "https://www.bargainstore.uk.com");
  });

  it("1.4 Multiple trailing slashes are stripped", () => {
    const script = `
      import { SITE_URL } from './lib/site.ts';
      console.log(SITE_URL);
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "https://www.bargainstore.uk.com///" }, script);
    assert.strictEqual(output, "https://www.bargainstore.uk.com");
  });

  it("1.5 Localhost URL with port supported", () => {
    const script = `
      import { SITE_URL, canonicalBase } from './lib/site.ts';
      console.log(JSON.stringify({ SITE_URL, port: canonicalBase.port, hostname: canonicalBase.hostname }));
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }, script);
    const data = JSON.parse(output);
    assert.strictEqual(data.SITE_URL, "http://localhost:3000");
    assert.strictEqual(data.port, "3000");
    assert.strictEqual(data.hostname, "localhost");
  });

  it("1.6 Localhost URL with trailing slashes is stripped", () => {
    const script = `
      import { SITE_URL } from './lib/site.ts';
      console.log(SITE_URL);
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000///" }, script);
    assert.strictEqual(output, "http://localhost:3000");
  });

  it("1.7 Subpath / staging URL handled without trailing slash", () => {
    const script = `
      import { SITE_URL, getAbsoluteUrl } from './lib/site.ts';
      console.log(JSON.stringify({ SITE_URL, abs: getAbsoluteUrl('/deals') }));
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "https://www.bargainstore.uk.com/staging///" }, script);
    const data = JSON.parse(output);
    assert.strictEqual(data.SITE_URL, "https://www.bargainstore.uk.com/staging");
    assert.strictEqual(data.abs, "https://www.bargainstore.uk.com/staging/deals");
  });

  it("1.8 Stress-test: Whitespace-only NEXT_PUBLIC_SITE_URL throws ERR_INVALID_URL on module load", () => {
    const script = `
      try {
        await import('./lib/site.ts');
        console.log("LOAD_SUCCESS");
      } catch (err) {
        console.log("CAUGHT_ERROR:" + err.code);
      }
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "   " }, script);
    assert.ok(output.includes("CAUGHT_ERROR:ERR_INVALID_URL"), "Malformed whitespace URL must fail URL parser");
  });

  it("1.9 Stress-test: Protocol-less NEXT_PUBLIC_SITE_URL throws ERR_INVALID_URL on module load", () => {
    const script = `
      try {
        await import('./lib/site.ts');
        console.log("LOAD_SUCCESS");
      } catch (err) {
        console.log("CAUGHT_ERROR:" + err.code);
      }
    `;
    const output = evalWithEnv({ NEXT_PUBLIC_SITE_URL: "www.bargainstore.uk.com" }, script);
    assert.ok(output.includes("CAUGHT_ERROR:ERR_INVALID_URL"), "Missing protocol must fail URL parser");
  });
});

describe("2. getAbsoluteUrl() Path Normalization & Exhaustive Edge Cases", () => {
  it("2.1 Empty path string returns base SITE_URL", () => {
    assert.strictEqual(getAbsoluteUrl(""), SITE_URL);
  });

  it("2.2 Undefined / no arguments returns base SITE_URL", () => {
    assert.strictEqual(getAbsoluteUrl(), SITE_URL);
  });

  it("2.3 Null input returns base SITE_URL", () => {
    assert.strictEqual(getAbsoluteUrl(null), SITE_URL);
  });

  it("2.4 Root path '/' returns base SITE_URL without trailing slash", () => {
    assert.strictEqual(getAbsoluteUrl("/"), SITE_URL);
    assert.strictEqual(getAbsoluteUrl("/"), "https://www.bargainstore.uk.com");
  });

  it("2.5 Path with leading slash normalizes cleanly", () => {
    assert.strictEqual(getAbsoluteUrl("/shop"), "https://www.bargainstore.uk.com/shop");
    assert.strictEqual(getAbsoluteUrl("/category/garden-growing"), "https://www.bargainstore.uk.com/category/garden-growing");
    assert.strictEqual(getAbsoluteUrl("/product/flymo-simpliglide-300"), "https://www.bargainstore.uk.com/product/flymo-simpliglide-300");
  });

  it("2.6 Path without leading slash prepends single slash", () => {
    assert.strictEqual(getAbsoluteUrl("shop"), "https://www.bargainstore.uk.com/shop");
    assert.strictEqual(getAbsoluteUrl("category/garden-growing"), "https://www.bargainstore.uk.com/category/garden-growing");
    assert.strictEqual(getAbsoluteUrl("assets/brands/flymo.webp"), "https://www.bargainstore.uk.com/assets/brands/flymo.webp");
  });

  it("2.7 Path with query parameters (with and without leading slash)", () => {
    assert.strictEqual(getAbsoluteUrl("/shop?page=2&sort=price"), "https://www.bargainstore.uk.com/shop?page=2&sort=price");
    assert.strictEqual(getAbsoluteUrl("shop?page=2&sort=price"), "https://www.bargainstore.uk.com/shop?page=2&sort=price");
    assert.strictEqual(getAbsoluteUrl("?q=drill"), "https://www.bargainstore.uk.com/?q=drill");
    assert.strictEqual(getAbsoluteUrl("/?q=drill"), "https://www.bargainstore.uk.com/?q=drill");
  });

  it("2.8 Path with anchor fragments (with and without leading slash)", () => {
    assert.strictEqual(getAbsoluteUrl("/help#delivery"), "https://www.bargainstore.uk.com/help#delivery");
    assert.strictEqual(getAbsoluteUrl("help#delivery"), "https://www.bargainstore.uk.com/help#delivery");
    assert.strictEqual(getAbsoluteUrl("#faq"), "https://www.bargainstore.uk.com/#faq");
    assert.strictEqual(getAbsoluteUrl("/#faq"), "https://www.bargainstore.uk.com/#faq");
  });

  it("2.9 Path with combined query parameters and hash anchors", () => {
    assert.strictEqual(getAbsoluteUrl("/shop?q=paint#results"), "https://www.bargainstore.uk.com/shop?q=paint#results");
    assert.strictEqual(getAbsoluteUrl("shop?q=paint#results"), "https://www.bargainstore.uk.com/shop?q=paint#results");
  });

  it("2.10 Already absolute HTTPS URLs are preserved verbatim", () => {
    assert.strictEqual(getAbsoluteUrl("https://external.com/image.jpg"), "https://external.com/image.jpg");
    assert.strictEqual(getAbsoluteUrl("https://images.unsplash.com/photo-12345?w=800"), "https://images.unsplash.com/photo-12345?w=800");
  });

  it("2.11 Already absolute HTTP URLs are preserved verbatim", () => {
    assert.strictEqual(getAbsoluteUrl("http://insecure.example.com/asset.png"), "http://insecure.example.com/asset.png");
  });

  it("2.12 URL-encoded characters in path are preserved", () => {
    assert.strictEqual(getAbsoluteUrl("/product/black%2Bdecker-drill"), "https://www.bargainstore.uk.com/product/black%2Bdecker-drill");
    assert.strictEqual(getAbsoluteUrl("/search?q=100%25+cotton"), "https://www.bargainstore.uk.com/search?q=100%25+cotton");
  });

  it("2.13 Path with trailing slash retains trailing slash", () => {
    assert.strictEqual(getAbsoluteUrl("/shop/"), "https://www.bargainstore.uk.com/shop/");
    assert.strictEqual(getAbsoluteUrl("shop/"), "https://www.bargainstore.uk.com/shop/");
  });

  it("2.14 Protocol-relative URLs are converted to domain path (not treated as absolute scheme)", () => {
    // Protocol-relative //cdn.example.com does not start with http:// or https://
    const result = getAbsoluteUrl("//cdn.example.com/asset.js");
    assert.strictEqual(result, "https://www.bargainstore.uk.com//cdn.example.com/asset.js");
  });

  it("2.15 Path traversal characters are preserved in path component", () => {
    const result = getAbsoluteUrl("/../admin");
    assert.strictEqual(result, "https://www.bargainstore.uk.com/../admin");
  });
});

describe("3. Storefront Prerendered HTML Canonical Tag & Hostname Audit", () => {
  const serverAppDir = path.resolve(process.cwd(), ".next/server/app");

  function getPrerenderedHtmlFiles() {
    if (!fs.existsSync(serverAppDir)) return [];
    return fs.readdirSync(serverAppDir)
      .filter(f => f.endsWith(".html"))
      .map(f => path.join(serverAppDir, f));
  }

  const htmlFiles = getPrerenderedHtmlFiles();

  it("3.1 Prerendered HTML pages exist in .next/server/app", () => {
    assert.ok(htmlFiles.length >= 8, `Expected at least 8 html pages, found ${htmlFiles.length}`);
  });

  it("3.2 Every HTML page has AT MOST ONE <link rel='canonical'> tag (no duplicate canonicals)", () => {
    const duplicateViolations = [];
    for (const filePath of htmlFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const canonicalTags = content.match(/<link[^>]+rel=["']canonical["'][^>]*>/gi) || [];
      const relFirstMatches = content.match(/<link[^>]+href=["'][^"']+["'][^>]+rel=["']canonical["'][^>]*>/gi) || [];
      const count = Math.max(canonicalTags.length, relFirstMatches.length);
      if (count > 1) {
        duplicateViolations.push({ file: path.basename(filePath), count });
      }
    }
    assert.deepStrictEqual(duplicateViolations, [], "Duplicate canonical tags detected");
  });

  it("3.3 Zero occurrences of legacy domain 'https://bargainstore.uk' (without .com) in canonical links", () => {
    const legacyViolations = [];
    for (const filePath of htmlFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                             content.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
      if (canonicalMatch) {
        const href = canonicalMatch[1];
        if (href.includes("bargainstore.uk") && !href.includes("bargainstore.uk.com")) {
          legacyViolations.push({ file: path.basename(filePath), href });
        }
      }
    }
    assert.deepStrictEqual(legacyViolations, [], "Legacy domain found in canonical tags");
  });

  it("3.4 Zero occurrences of localhost in production canonical links", () => {
    const localhostViolations = [];
    for (const filePath of htmlFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                             content.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
      if (canonicalMatch) {
        const href = canonicalMatch[1];
        if (href.includes("localhost") || href.includes("127.0.0.1")) {
          localhostViolations.push({ file: path.basename(filePath), href });
        }
      }
    }
    assert.deepStrictEqual(localhostViolations, [], "Localhost URLs found in canonical tags");
  });

  it("3.5 Key informational routes have correct self-referencing canonical URLs", () => {
    const routeChecks = [
      { file: "help.html", expected: "https://www.bargainstore.uk.com/help" },
      { file: "ideas-advice.html", expected: "https://www.bargainstore.uk.com/ideas-advice" },
    ];

    for (const check of routeChecks) {
      const fullPath = path.join(serverAppDir, check.file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const match = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                      content.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
        assert.ok(match, `File ${check.file} missing canonical tag`);
        assert.strictEqual(match[1], check.expected, `File ${check.file} canonical href mismatch`);
      }
    }
  });

  it("3.6 Audit secondary static pages (about, privacy, terms, cookies) for inherited vs route canonical", () => {
    const secondaryPages = ["about.html", "privacy.html", "terms.html", "cookies.html"];
    for (const file of secondaryPages) {
      const fullPath = path.join(serverAppDir, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const match = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                      content.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
        assert.ok(match, `File ${file} missing canonical tag`);
        // Note: These secondary pages inherit the layout's canonical (https://www.bargainstore.uk.com)
        assert.ok(match[1].startsWith("https://www.bargainstore.uk.com"), `${file} canonical must be on canonical domain`);
      }
    }
  });
});

describe("4. Crawl Metadata Routes Consistency (robots.txt, sitemap.xml, manifest)", () => {
  it("4.1 robots.txt contains canonical Host and dynamic Sitemap URL with no legacy domain", () => {
    const robotsPath = path.resolve(process.cwd(), ".next/server/app/robots.txt.body");
    assert.ok(fs.existsSync(robotsPath), "robots.txt.body must exist");
    const robots = fs.readFileSync(robotsPath, "utf-8");

    assert.ok(robots.includes("Host: www.bargainstore.uk.com"), "Must specify Host: www.bargainstore.uk.com");
    assert.ok(robots.includes("Sitemap: https://www.bargainstore.uk.com/sitemap.xml"), "Must specify Sitemap with canonical domain");
    assert.ok(robots.includes("Allow: /api/feeds/"), "Must allow feed routes");
    assert.ok(robots.includes("Allow: /llms.txt"), "Must allow llms.txt");
    assert.ok(robots.includes("Disallow: /admin"), "Must disallow admin");
    assert.ok(!robots.includes("https://bargainstore.uk/"), "Must not contain legacy domain");
  });

  it("4.2 Web manifest contains matching name, orientation, theme_color, and maskable icons", () => {
    const manifestPath = path.resolve(process.cwd(), ".next/server/app/manifest.webmanifest.body");
    assert.ok(fs.existsSync(manifestPath), "manifest.webmanifest.body must exist");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    assert.strictEqual(manifest.name, "BargainStore.uk — Trusted UK Brands At Low Prices");
    assert.strictEqual(manifest.orientation, "portrait");
    assert.strictEqual(manifest.theme_color, "#001642");
    assert.deepStrictEqual(manifest.categories, ["shopping", "lifestyle", "business"]);

    // Find maskable icons
    const maskableIcons = manifest.icons.filter(i => i.purpose && i.purpose.includes("maskable"));
    assert.ok(maskableIcons.length >= 2, "Must contain at least 2 maskable icons");
  });
});
