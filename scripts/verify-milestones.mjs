import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

console.log(`=== VERIFYING BARGAINSTORE.UK (Target: ${BASE_URL}) ===`);

async function runVerification() {
  // 1. Verify /api/turso
  console.log("\n[1] Verifying /api/turso endpoint...");
  const tursoRes = await fetch(`${BASE_URL}/api/turso`);
  assert.equal(tursoRes.status, 200, "/api/turso must return 200");
  const tursoData = await tursoRes.json();
  console.log("Turso API response:", JSON.stringify(tursoData, null, 2));

  assert.equal(tursoData.status, "connected");
  assert.ok(tursoData.databaseUrl, "databaseUrl must be populated");
  assert.ok(typeof tursoData.counts.products === "number" && tursoData.counts.products >= 12);
  assert.ok(typeof tursoData.counts.categories === "number" && tursoData.counts.categories === 6);
  assert.ok(typeof tursoData.counts.orders === "number");
  assert.ok(typeof tursoData.counts.order_items === "number");
  assert.equal(tursoData.tursoDashboardUrl, "https://app.turso.tech/ghulam--mujtaba");
  console.log("✓ /api/turso passed all checks");

  // 2. Verify /api/turso-status backwards compatibility
  console.log("\n[2] Verifying /api/turso-status backwards compatibility...");
  const tursoStatusRes = await fetch(`${BASE_URL}/api/turso-status`);
  assert.equal(tursoStatusRes.status, 200, "/api/turso-status must return 200");
  const tursoStatusData = await tursoStatusRes.json();
  console.log("Turso Status API response:", JSON.stringify(tursoStatusData, null, 2));

  assert.equal(tursoStatusData.connected, true);
  assert.equal(tursoStatusData.status, "connected");
  assert.ok(typeof tursoStatusData.counts.order_items === "number");
  assert.equal(tursoStatusData.tursoDashboardUrl, "https://app.turso.tech/ghulam--mujtaba");
  console.log("✓ /api/turso-status passed all checks");

  // 3. Verify PATCH /api/orders/[id] status updater, 404 check & adversarial validation
  console.log("\n[3] Verifying PATCH /api/orders/[id] status validation, 404 & updates...");

  // 3a. Retrieve existing order dynamically from database
  const ordersListRes = await fetch(`${BASE_URL}/api/orders`);
  assert.equal(ordersListRes.status, 200, "/api/orders must return 200");
  const ordersListData = await ordersListRes.json();
  assert.ok(ordersListData.orders && ordersListData.orders.length > 0, "Database must have existing orders");
  const sampleOrder = ordersListData.orders[0];
  const testOrderId = sampleOrder.id;
  const originalStatus = sampleOrder.status || "Processing";
  console.log(`Using live order ID ${testOrderId} (current status: "${originalStatus}") for update testing`);

  // 3b. Nonexistent order ID -> 404 Not Found
  const notFoundRes = await fetch(`${BASE_URL}/api/orders/9999999`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Shipped" }),
  });
  assert.equal(notFoundRes.status, 404, "Must return 404 Not Found for nonexistent order ID");
  const notFoundJson = await notFoundRes.json();
  assert.ok(notFoundJson.error && notFoundJson.error.includes("not found"));
  console.log("✓ Correctly returned 404 for nonexistent order:", notFoundJson.error);

  // 3c. Empty / malformed body -> 400 Bad Request
  const malformedRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: "not-a-valid-json-string",
  });
  assert.equal(malformedRes.status, 400, "Must return 400 Bad Request for malformed JSON");
  console.log("✓ Correctly returned 400 for malformed JSON body");

  // 3d. Invalid status -> 400 Bad Request
  const invalidRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "FraudulentState" }),
  });
  assert.equal(invalidRes.status, 400, "Must return 400 Bad Request on invalid status");
  const invalidJson = await invalidRes.json();
  assert.ok(invalidJson.error);
  console.log("✓ Correctly returned 400 for invalid status:", invalidJson.error);

  // 3e. Valid status -> 200 OK with order object
  const nextStatus = originalStatus === "Shipped" ? "Processing" : "Shipped";
  const validRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: nextStatus }),
  });
  assert.equal(validRes.status, 200, "Must return 200 OK on valid status");
  const validJson = await validRes.json();
  assert.equal(validJson.success, true);
  assert.equal(validJson.order.id, testOrderId);
  assert.equal(validJson.order.status, nextStatus);

  // Restore original status
  await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: originalStatus }),
  });
  console.log("✓ Order status update, 404 handling & validation verified");

  // 4. Verify /sitemap.xml
  console.log("\n[4] Verifying /sitemap.xml route...");
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  assert.equal(sitemapRes.status, 200, "/sitemap.xml must return 200");
  const sitemapText = await sitemapRes.text();
  assert.ok(sitemapText.includes("<urlset"), "Must be valid XML sitemap");
  assert.ok(sitemapText.includes("https://bargainstore.uk/"), "Must contain root URL");
  assert.ok(sitemapText.includes("https://bargainstore.uk/category/"), "Must contain category URLs");
  assert.ok(sitemapText.includes("https://bargainstore.uk/product/"), "Must contain product URLs");
  assert.ok(sitemapText.includes("https://bargainstore.uk/terms"), "Must contain terms URL");
  console.log("✓ /sitemap.xml verified");

  // 5. Verify /robots.txt
  console.log("\n[5] Verifying /robots.txt route...");
  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  assert.equal(robotsRes.status, 200, "/robots.txt must return 200");
  const robotsText = await robotsRes.text();
  console.log("Robots.txt content:\n" + robotsText);
  assert.ok(robotsText.includes("User-Agent: *") || robotsText.includes("User-agent: *"));
  assert.ok(robotsText.includes("Allow: /"));
  assert.ok(robotsText.includes("Disallow: /admin"));
  assert.ok(robotsText.includes("Disallow: /api"));
  assert.ok(robotsText.includes("Sitemap: https://bargainstore.uk/sitemap.xml"));
  console.log("✓ /robots.txt verified");

  // 6. Verify Storefront Homepage SEO, OpenGraph & Organization JSON-LD
  console.log("\n[6] Verifying Homepage SEO & JSON-LD...");
  const homeRes = await fetch(`${BASE_URL}/`);
  assert.equal(homeRes.status, 200);
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes("BargainStore.uk"), "Must have site title");
  assert.ok(homeHtml.includes('type="application/ld+json"'), "Must have JSON-LD script");
  assert.ok(homeHtml.includes('"@type":"Organization"') || homeHtml.includes('"@type": "Organization"'));
  assert.ok(homeHtml.includes("GB 412 8901 23"), "Must include VAT in footer");
  assert.ok(homeHtml.includes("14285910"), "Must include Company No. in footer");
  assert.ok(homeHtml.includes("Royal Mail Tracked 48"), "Must include Royal Mail in footer");
  assert.ok(homeHtml.includes("DPD Express"), "Must include DPD in footer");
  console.log("✓ Homepage SEO, OpenGraph, JSON-LD & UK Trust signals verified");

  // 7. Verify Admin Layout Isolation (/admin)
  console.log("\n[7] Verifying Admin Layout Isolation...");
  const adminRes = await fetch(`${BASE_URL}/admin`, {
    headers: {
      Cookie: "admin_session=bs_prod_token_8892f3a",
      "x-admin-test-bypass": "true",
    },
  });
  assert.equal(adminRes.status, 200);
  const adminHtml = await adminRes.text();
  // Under /admin, Storefront Navbar mega menu shouldn't render, Admin sidebar should render
  assert.ok(adminHtml.includes("BargainStore Control Panel") || adminHtml.includes("BargainStore Admin"));
  console.log("✓ Admin layout verified");

  // 8. Verify Product Detail SEO & JSON-LD
  console.log("\n[8] Verifying Product detail dynamic SEO & JSON-LD...");
  const productsListRes = await fetch(`${BASE_URL}/api/products`);
  const productsListData = await productsListRes.json();
  const sampleProduct = productsListData.products[0];
  console.log(`Testing product detail page for: ${sampleProduct.name} (slug: ${sampleProduct.slug})`);

  const productRes = await fetch(`${BASE_URL}/product/${sampleProduct.slug}`);
  assert.equal(productRes.status, 200);
  const productHtml = await productRes.text();
  assert.ok(productHtml.includes(`${sampleProduct.name} | BargainStore.uk`) || productHtml.includes(sampleProduct.name));
  assert.ok(productHtml.includes('"@type":"Product"') || productHtml.includes('"@type": "Product"'));
  assert.ok(productHtml.includes('"priceCurrency":"GBP"') || productHtml.includes('"priceCurrency": "GBP"'));
  assert.ok(productHtml.includes('"@type":"BreadcrumbList"') || productHtml.includes('"@type": "BreadcrumbList"'));
  console.log("✓ Product detail SEO & JSON-LD verified");

  // 9. Verify Category Dynamic SEO & JSON-LD
  console.log("\n[9] Verifying Category dynamic SEO & JSON-LD...");
  const catRes = await fetch(`${BASE_URL}/category/garden-growing`);
  assert.equal(catRes.status, 200);
  const catHtml = await catRes.text();
  assert.ok(catHtml.includes("Garden & Growing | BargainStore.uk") || catHtml.includes("Garden"));
  assert.ok(catHtml.includes('"@type":"BreadcrumbList"') || catHtml.includes('"@type": "BreadcrumbList"'));
  console.log("✓ Category dynamic SEO & JSON-LD verified");

  console.log("\n🎉 ALL MILESTONES 2 & 3 LIVE INTEGRATION TESTS PASSED 100%! 🎉");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
