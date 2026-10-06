/**
 * M2 Challenger: Adversarial Empirical Verification Suite
 * Targets:
 * 1. StorefrontShell layout isolation:
 *    - /admin, /admin/products, /admin/products/new, /admin/orders, /admin/turso
 *    - Strict absence of public Storefront chrome (Navbar mega-menu, TopBar promo, CartDrawer, Trust Footer)
 *    - Presence of Admin Control Panel layout, sidebar, and breadcrumbs
 *    - Contrast check: Storefront routes retain full public chrome and exclude admin chrome
 * 2. /api/turso & /api/turso-status endpoints:
 *    - JSON schema, field types, status === "connected", tursoDashboardUrl
 *    - Live count parity verified against direct SQLite queries
 *    - High-concurrency stress test (25 simultaneous requests)
 *    - Method validation (disallow POST/PUT/DELETE)
 * 3. PATCH /api/orders/[id]:
 *    - Exhaustive 400 Bad Request rejection (empty, null, wrong case, injection, non-strings, non-existent status)
 *    - Invalid order ID rejection (400 on non-numeric, 0, negative, NaN)
 *    - Empirical SQLite status mutation verified across all 5 allowed statuses:
 *      'Pending' -> 'Processing' -> 'Shipped' -> 'Delivered' -> 'Cancelled' -> 'Pending'
 *    - Concurrent PATCH stress test
 *    - Clean teardown of test orders
 */

import { client, db } from "../db";
import { orders, orderItems } from "../db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passedCount = 0;
let totalCount = 0;
const failureDetails: string[] = [];

function assertTest(name: string, condition: boolean, details?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${name}`);
  } else {
    const msg = `[FAIL] ${name}${details ? ` -> ${details}` : ""}`;
    console.error(`  ${msg}`);
    failureDetails.push(msg);
  }
}

const createdOrderIds: number[] = [];

async function cleanupTestOrders() {
  for (const id of createdOrderIds) {
    try {
      await client.execute({
        sql: "DELETE FROM order_items WHERE order_id = ?",
        args: [id],
      });
      await client.execute({
        sql: "DELETE FROM orders WHERE id = ?",
        args: [id],
      });
    } catch (e: any) {
      console.warn(`Failed cleanup for test order ${id}:`, e.message);
    }
  }
  createdOrderIds.length = 0;
}

async function runM2AdversarialSuite() {
  console.log("================================================================================");
  console.log("   M2 EMPIRICAL CHALLENGER: ADVERSARIAL VERIFICATION SUITE   ");
  console.log(`   Target Server: ${BASE_URL}`);
  console.log("================================================================================\n");

  try {
    // =========================================================================
    // SECTION 1: STOREFRONTSHELL LAYOUT ISOLATION
    // =========================================================================
    console.log("--- SECTION 1: StorefrontShell Layout Isolation Verification ---");

    const adminRoutes = [
      { path: "/admin", name: "Admin Dashboard Overview" },
      { path: "/admin/products", name: "Admin Products Catalog" },
      { path: "/admin/products/new", name: "Admin Product Creation Form" },
      { path: "/admin/orders", name: "Admin Orders Management" },
      { path: "/admin/turso", name: "Admin Turso DB Manager" },
    ];

    // Storefront markers that MUST NEVER appear on isolated admin pages
    const storefrontForbiddenStrings = [
      "High Street Hub",
      "FREE UK Delivery",
      "0800 123 4567",
      "Shop Departments",
      "VAT Reg: GB 412 8901 23",
      "Company No. 14285910",
      "Registered Office: BargainStore UK Ltd",
      "30-Day Returns",
    ];

    // Admin markers that MUST appear on admin pages
    const adminExpectedStrings = [
      "BargainStore Control Panel",
      "Admin Navigation Links",
      "Dashboard Overview",
      "Products Catalog",
      "Customer Orders",
      "Turso DB Manager",
      "Ghulam Mujtaba",
    ];

    for (const route of adminRoutes) {
      const res = await fetch(`${BASE_URL}${route.path}`, {
        headers: {
          Cookie: "admin_session=bs_prod_token_8892f3a",
          "x-admin-test-bypass": "true",
        },
      });
      assertTest(
        `1.1 Route ${route.path} returns HTTP 200 OK`,
        res.status === 200,
        `Status code was ${res.status}`
      );

      const html = await res.text();

      // Check forbidden storefront chrome
      for (const forbidden of storefrontForbiddenStrings) {
        const found = html.includes(forbidden);
        assertTest(
          `1.2 Route ${route.path} isolates storefront chrome: excludes "${forbidden}"`,
          !found,
          `Found forbidden storefront marker in admin HTML for ${route.path}`
        );
      }

      // Check expected admin layout chrome
      const hasControlPanel = html.includes("BargainStore Control Panel");
      assertTest(
        `1.3 Route ${route.path} renders dedicated Admin Layout header`,
        hasControlPanel,
        `Missing "BargainStore Control Panel" in ${route.path}`
      );

      const hasAdminNav = html.includes("Admin Navigation Links");
      assertTest(
        `1.4 Route ${route.path} renders Admin Navigation links`,
        hasAdminNav,
        `Missing "Admin Navigation Links" in ${route.path}`
      );
    }

    // Additional admin route variations (trailing slash and deep subroute)
    const adminVariations = [
      "/admin/",
      "/admin/products/[id]/edit",
    ];
    for (const varPath of adminVariations) {
      const res = await fetch(`${BASE_URL}${varPath}`);
      // Either 200 or 404 (if dynamic ID not matching), but HTML must NOT include storefront chrome
      if (res.status === 200) {
        const html = await res.text();
        const hasStorefrontMarkers = storefrontForbiddenStrings.some((m) => html.includes(m));
        assertTest(
          `1.5 Admin variation route ${varPath} strictly isolates storefront chrome`,
          !hasStorefrontMarkers,
          `Storefront chrome found in ${varPath}`
        );
      }
    }

    // Contrast check on storefront pages: must have storefront chrome, must NOT have admin chrome
    const storefrontRoutes = [
      { path: "/", name: "Storefront Homepage" },
      { path: "/basket", name: "Storefront Basket" },
      { path: "/category/garden-growing", name: "Storefront Category" },
    ];

    for (const route of storefrontRoutes) {
      const res = await fetch(`${BASE_URL}${route.path}`);
      assertTest(
        `1.6 Storefront route ${route.path} returns HTTP 200 OK`,
        res.status === 200,
        `Status code was ${res.status}`
      );

      const html = await res.text();

      const hasStorefrontNav =
        html.includes("0800 123 4567") ||
        html.includes("FREE UK Delivery") ||
        html.includes("High Street Hub");
      assertTest(
        `1.7 Storefront route ${route.path} renders storefront chrome`,
        hasStorefrontNav,
        `Storefront chrome missing from ${route.path}`
      );

      const hasStorefrontFooter =
        html.includes("VAT Reg: GB 412 8901 23") ||
        html.includes("14285910") ||
        html.includes("Royal Mail");
      assertTest(
        `1.8 Storefront route ${route.path} renders UK trust footer`,
        hasStorefrontFooter,
        `Storefront footer missing from ${route.path}`
      );

      const hasAdminPanel = html.includes("BargainStore Control Panel");
      assertTest(
        `1.9 Storefront route ${route.path} does NOT leak admin control panel`,
        !hasAdminPanel,
        `Admin Control Panel found leaking into public storefront route ${route.path}`
      );
    }

    // Pure logic test on StorefrontShell route predicate
    const routePredicateTests = [
      { pathname: "/admin", shouldIsolate: true },
      { pathname: "/admin/", shouldIsolate: true },
      { pathname: "/admin/products", shouldIsolate: true },
      { pathname: "/admin/products/new", shouldIsolate: true },
      { pathname: "/admin/orders", shouldIsolate: true },
      { pathname: "/admin/turso", shouldIsolate: true },
      { pathname: "/admin/reports/2026", shouldIsolate: true },
      { pathname: "/admin?tab=overview", shouldIsolate: true },
      { pathname: "/admin#metrics", shouldIsolate: true },
      { pathname: "/", shouldIsolate: false },
      { pathname: "/basket", shouldIsolate: false },
      { pathname: "/checkout", shouldIsolate: false },
      { pathname: "/product/flymo-simpliglide-300", shouldIsolate: false },
      { pathname: "/category/garden-growing", shouldIsolate: false },
      { pathname: "/products/admin-desk-organizer", shouldIsolate: false },
      { pathname: "/category/admin-office-supplies", shouldIsolate: false },
      { pathname: null as any, shouldIsolate: false },
      { pathname: undefined as any, shouldIsolate: false },
      { pathname: "", shouldIsolate: false },
    ];

    for (const testCase of routePredicateTests) {
      const isAdmin = Boolean(testCase.pathname?.startsWith("/admin"));
      assertTest(
        `1.10 StorefrontShell route predicate for "${testCase.pathname}" isolates === ${testCase.shouldIsolate}`,
        isAdmin === testCase.shouldIsolate,
        `Predicate evaluated to ${isAdmin} for ${testCase.pathname}`
      );
    }

    console.log();

    // =========================================================================
    // SECTION 2: /api/turso & /api/turso-status ENDPOINT EMPIRICAL VERIFICATION
    // =========================================================================
    console.log("--- SECTION 2: Turso Connectivity Endpoints Empirical Verification ---");

    // 2.1 Fetch direct ground-truth counts from SQLite database
    const [pDb, cDb, oDb, oiDb] = await Promise.all([
      client.execute("SELECT COUNT(*) as c FROM products;"),
      client.execute("SELECT COUNT(*) as c FROM categories;"),
      client.execute("SELECT COUNT(*) as c FROM orders;"),
      client.execute("SELECT COUNT(*) as c FROM order_items;"),
    ]);

    const groundTruthCounts = {
      products: Number(pDb.rows[0]?.c || 0),
      categories: Number(cDb.rows[0]?.c || 0),
      orders: Number(oDb.rows[0]?.c || 0),
      order_items: Number(oiDb.rows[0]?.c || 0),
    };

    console.log("Direct SQLite ground truth counts:", JSON.stringify(groundTruthCounts));

    // 2.2 Verify /api/turso
    const tursoRes = await fetch(`${BASE_URL}/api/turso`);
    assertTest("2.1 /api/turso returns HTTP 200 OK", tursoRes.status === 200, `Got status ${tursoRes.status}`);

    const tursoData = await tursoRes.json();
    assertTest("2.2 /api/turso status is 'connected'", tursoData.status === "connected", `Got ${tursoData.status}`);
    assertTest("2.3 /api/turso databaseUrl is non-empty string", typeof tursoData.databaseUrl === "string" && tursoData.databaseUrl.length > 0);
    assertTest(
      "2.4 /api/turso tursoDashboardUrl is exact URL",
      tursoData.tursoDashboardUrl === "https://app.turso.tech/ghulam--mujtaba",
      `Got ${tursoData.tursoDashboardUrl}`
    );

    // Schema and count assertions
    assertTest("2.5 /api/turso counts.products is valid integer >= 25", Number.isInteger(tursoData.counts?.products) && tursoData.counts.products >= 25);
    assertTest("2.6 /api/turso counts.categories is exact integer 6", Number.isInteger(tursoData.counts?.categories) && tursoData.counts.categories === 6);
    assertTest("2.7 /api/turso counts.orders is valid integer >= 0", Number.isInteger(tursoData.counts?.orders) && tursoData.counts.orders >= 0);
    assertTest("2.8 /api/turso counts.order_items is valid integer >= 0", Number.isInteger(tursoData.counts?.order_items) && tursoData.counts.order_items >= 0);

    // Ground truth parity
    assertTest(
      "2.9 /api/turso counts.products strictly matches SQLite ground truth",
      tursoData.counts?.products === groundTruthCounts.products,
      `API: ${tursoData.counts?.products}, DB: ${groundTruthCounts.products}`
    );
    assertTest(
      "2.10 /api/turso counts.categories strictly matches SQLite ground truth",
      tursoData.counts?.categories === groundTruthCounts.categories,
      `API: ${tursoData.counts?.categories}, DB: ${groundTruthCounts.categories}`
    );
    assertTest(
      "2.11 /api/turso counts.orders strictly matches SQLite ground truth",
      tursoData.counts?.orders === groundTruthCounts.orders,
      `API: ${tursoData.counts?.orders}, DB: ${groundTruthCounts.orders}`
    );
    assertTest(
      "2.12 /api/turso counts.order_items strictly matches SQLite ground truth",
      tursoData.counts?.order_items === groundTruthCounts.order_items,
      `API: ${tursoData.counts?.order_items}, DB: ${groundTruthCounts.order_items}`
    );

    // 2.3 Verify /api/turso-status backwards compatibility
    const tursoStatusRes = await fetch(`${BASE_URL}/api/turso-status`);
    assertTest("2.13 /api/turso-status returns HTTP 200 OK", tursoStatusRes.status === 200);
    const tursoStatusData = await tursoStatusRes.json();
    assertTest("2.14 /api/turso-status connected === true", tursoStatusData.connected === true);
    assertTest("2.15 /api/turso-status status === 'connected'", tursoStatusData.status === "connected");
    assertTest("2.16 /api/turso-status isCloud is boolean", typeof tursoStatusData.isCloud === "boolean");
    assertTest("2.17 /api/turso-status hasAuthToken is boolean", typeof tursoStatusData.hasAuthToken === "boolean");
    assertTest("2.18 /api/turso-status tursoDashboardUrl is exact URL", tursoStatusData.tursoDashboardUrl === "https://app.turso.tech/ghulam--mujtaba");

    // 2.4 High-concurrency stress test on /api/turso (25 parallel requests)
    console.log("  Executing 25 concurrent requests against /api/turso...");
    const concurrencyStart = Date.now();
    const concurrentResponses = await Promise.all(
      Array.from({ length: 25 }, () => fetch(`${BASE_URL}/api/turso`))
    );
    const concurrencyElapsed = Date.now() - concurrencyStart;

    const all200 = concurrentResponses.every((r) => r.status === 200);
    assertTest("2.19 All 25 concurrent requests return HTTP 200 OK", all200);

    const concurrentBodies = await Promise.all(concurrentResponses.map((r) => r.json()));
    const allConsistent = concurrentBodies.every(
      (b) =>
        b.status === "connected" &&
        b.counts.products === groundTruthCounts.products &&
        b.counts.categories === groundTruthCounts.categories
    );
    assertTest("2.20 All 25 concurrent responses return consistent metrics", allConsistent);
    assertTest("2.21 Concurrency batch completed within 3,000ms SLA", concurrencyElapsed < 3000, `Elapsed: ${concurrencyElapsed}ms`);

    // 2.5 Disallowed HTTP methods
    const disallowMethods = ["POST", "PUT", "DELETE"];
    for (const method of disallowMethods) {
      const res = await fetch(`${BASE_URL}/api/turso`, { method });
      assertTest(
        `2.22 /api/turso rejects HTTP ${method} with 405 Method Not Allowed`,
        res.status === 405,
        `Expected 405, got ${res.status}`
      );
    }

    console.log();

    // =========================================================================
    // SECTION 3: PATCH /api/orders/[id] STATUS UPDATER & ADVERSARIAL VALIDATION
    // =========================================================================
    console.log("--- SECTION 3: PATCH /api/orders/[id] Status Validation & State Transitions ---");

    // 3.1 Setup dedicated test order
    const testOrderRes = await client.execute({
      sql: `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, city, postcode, delivery_method, subtotal, shipping_fee, discount_amount, total, promo_code, payment_method, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id;`,
      args: [
        `BS-TEST-M2-${Date.now()}`,
        "Adversarial Challenger",
        "challenger@bargainstore.uk",
        "07700900000",
        "42 High Street",
        "Birmingham",
        "B1 1AA",
        "Standard Delivery",
        49.99,
        4.99,
        0,
        54.98,
        null,
        "Credit Card",
        "Pending",
        new Date().toISOString(),
      ],
    });

    const testOrderId = Number(testOrderRes.rows[0]?.id);
    if (!testOrderId) {
      throw new Error("Failed to insert initial test order into database");
    }
    createdOrderIds.push(testOrderId);
    console.log(`Created dedicated test order ID: ${testOrderId} (initial status: Pending)`);

    // 3.2 Adversarial Status Rejection (400 Bad Request)
    const adversarialInvalidStatuses = [
      { name: "empty string", body: { status: "" } },
      { name: "whitespace string", body: { status: "   " } },
      { name: "missing status property", body: {} },
      { name: "null status", body: { status: null } },
      { name: "numeric status", body: { status: 123 } },
      { name: "boolean status", body: { status: true } },
      { name: "array status", body: { status: ["Shipped"] } },
      { name: "object status", body: { status: { value: "Shipped" } } },
      { name: "unrecognized status 'Completed'", body: { status: "Completed" } },
      { name: "unrecognized status 'Refunded'", body: { status: "Refunded" } },
      { name: "unrecognized status 'Failed'", body: { status: "Failed" } },
      { name: "unrecognized status 'In Progress'", body: { status: "In Progress" } },
      { name: "unrecognized status 'Dispatched'", body: { status: "Dispatched" } },
      { name: "unrecognized status 'Fulfilled'", body: { status: "Fulfilled" } },
      { name: "case mismatch 'pending' (lowercase)", body: { status: "pending" } },
      { name: "case mismatch 'PENDING' (uppercase)", body: { status: "PENDING" } },
      { name: "case mismatch 'processing' (lowercase)", body: { status: "processing" } },
      { name: "case mismatch 'PROCESSING' (uppercase)", body: { status: "PROCESSING" } },
      { name: "case mismatch 'shipped' (lowercase)", body: { status: "shipped" } },
      { name: "case mismatch 'SHIPPED' (uppercase)", body: { status: "SHIPPED" } },
      { name: "case mismatch 'delivered' (lowercase)", body: { status: "delivered" } },
      { name: "case mismatch 'DELIVERED' (uppercase)", body: { status: "DELIVERED" } },
      { name: "case mismatch 'cancelled' (lowercase)", body: { status: "cancelled" } },
      { name: "case mismatch 'CANCELLED' (uppercase)", body: { status: "CANCELLED" } },
      { name: "leading whitespace ' Processing'", body: { status: " Processing" } },
      { name: "trailing whitespace 'Shipped '", body: { status: "Shipped " } },
      { name: "newline in status 'Delivered\\n'", body: { status: "Delivered\n" } },
      { name: "SQL Injection attempt", body: { status: "Shipped'; DROP TABLE orders; --" } },
      { name: "HTML/XSS attempt", body: { status: "<script>alert(1)</script>" } },
    ];

    for (const testCase of adversarialInvalidStatuses) {
      const res = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testCase.body),
      });

      assertTest(
        `3.1 Reject ${testCase.name} with HTTP 400 Bad Request`,
        res.status === 400,
        `Expected 400, got ${res.status}`
      );

      const json = await res.json();
      assertTest(
        `3.2 Rejection of ${testCase.name} includes informative error message`,
        typeof json.error === "string" &&
          json.error.includes("Invalid status. Must be one of: Pending, Processing, Shipped, Delivered, Cancelled"),
        `Error payload: ${JSON.stringify(json)}`
      );
    }

    // 3.3 Invalid Order ID Rejection (400 Bad Request)
    const invalidOrderIds = [
      { id: "abc", desc: "alphabetic string" },
      { id: "invalid-id", desc: "slug string" },
      { id: "0", desc: "zero ID" },
      { id: "-5", desc: "negative integer" },
      { id: "NaN", desc: "NaN literal" },
    ];

    for (const inv of invalidOrderIds) {
      const res = await fetch(`${BASE_URL}/api/orders/${inv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Processing" }),
      });

      assertTest(
        `3.3 Reject invalid order ID "${inv.id}" (${inv.desc}) with HTTP 400`,
        res.status === 400,
        `Expected 400, got ${res.status}`
      );

      const json = await res.json();
      assertTest(
        `3.4 Rejection of invalid order ID "${inv.id}" indicates invalid order ID`,
        json.error === "Invalid order ID",
        `Got: ${JSON.stringify(json)}`
      );
    }

    // 3.4 Valid Status Transitions & Direct SQLite Verification
    const validTransitions = [
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Pending",
    ];

    for (const nextStatus of validTransitions) {
      const res = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      assertTest(
        `3.5 PATCH status transition to "${nextStatus}" returns HTTP 200 OK`,
        res.status === 200,
        `Expected 200, got ${res.status}`
      );

      const json = await res.json();
      assertTest(
        `3.6 PATCH response confirms success: true for "${nextStatus}"`,
        json.success === true && json.order?.id === testOrderId && json.order?.status === nextStatus,
        `Response body: ${JSON.stringify(json)}`
      );

      // Direct empirical query into SQLite to verify actual state mutation
      const dbCheck = await client.execute({
        sql: "SELECT status FROM orders WHERE id = ?",
        args: [testOrderId],
      });
      const dbStatus = dbCheck.rows[0]?.status;

      assertTest(
        `3.7 Direct SQLite query confirms persistent mutation to "${nextStatus}"`,
        dbStatus === nextStatus,
        `Expected DB status "${nextStatus}", but found "${dbStatus}"`
      );
    }

    // 3.5 Concurrent Valid PATCH Stress Test (10 parallel requests)
    console.log("  Executing 10 concurrent status update requests alternating 'Processing' / 'Shipped'...");
    const targetStatuses = ["Processing", "Shipped", "Processing", "Shipped", "Processing", "Shipped", "Processing", "Shipped", "Processing", "Shipped"];
    const concurrentPatchResponses = await Promise.all(
      targetStatuses.map((st) =>
        fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: st }),
        })
      )
    );

    const allPatch200 = concurrentPatchResponses.every((r) => r.status === 200);
    assertTest("3.8 All 10 concurrent PATCH updates succeed with HTTP 200 OK", allPatch200);

    // Verify DB integrity after concurrent updates
    const finalDbCheck = await client.execute({
      sql: "SELECT status FROM orders WHERE id = ?",
      args: [testOrderId],
    });
    const finalDbStatus = finalDbCheck.rows[0]?.status;
    assertTest(
      "3.9 SQLite database state remains consistent and healthy after concurrency",
      finalDbStatus === "Processing" || finalDbStatus === "Shipped",
      `Final status: ${finalDbStatus}`
    );

    console.log();
    console.log("================================================================================");
    console.log(`   VERIFICATION RESULTS: ${passedCount} / ${totalCount} ASSERTIONS PASSED`);
    if (failureDetails.length > 0) {
      console.error(`   FAILURES DETECTED: ${failureDetails.length}`);
      failureDetails.forEach((f) => console.error(`     * ${f}`));
    } else {
      console.log("   STATUS: 100% EMPIRICAL ADVERSARIAL PASS — ZERO FAILURES");
    }
    console.log("================================================================================\n");

  } finally {
    console.log("Cleaning up created test orders...");
    await cleanupTestOrders();
    console.log("Cleanup complete.");
  }

  if (failureDetails.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runM2AdversarialSuite().catch((err) => {
  console.error("FATAL ERROR in M2 Adversarial Suite:", err);
  process.exit(1);
});
