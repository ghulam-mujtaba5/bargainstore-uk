import test, { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PROJECT_ROOT,
  executeDb,
  insertDbOrder,
  updateDbOrderStatus,
  createdOrderIds,
  cleanupTestData,
} from "./test-helper.mjs";

after(async () => {
  await cleanupTestData();
});

describe("Tier 5: Adversarial Challenge Suite — Milestone 2 (Admin Suite, Turso & Orders API)", () => {

  // =========================================================================
  // SECTION 1: StorefrontShell Layout Isolation
  // =========================================================================
  describe("1. Admin Layout Isolation (StorefrontShell.tsx)", () => {
    const shellPath = path.join(PROJECT_ROOT, "components/StorefrontShell.tsx");
    const shellContent = fs.readFileSync(shellPath, "utf-8");

    it("1.1 should inspect pathname and detect /admin route prefix", () => {
      assert.ok(
        shellContent.includes('pathname?.startsWith("/admin")') ||
        shellContent.includes('pathname.startsWith("/admin")'),
        "StorefrontShell must inspect pathname to identify admin routes"
      );
    });

    it("1.2 should return raw children without Navbar or Footer for admin routes", () => {
      assert.ok(
        shellContent.includes("return <>{children}</>"),
        "StorefrontShell must return children without storefront chrome for admin routes"
      );
    });
  });

  // =========================================================================
  // SECTION 2: Admin Layout Chrome & Semantic Navigation
  // =========================================================================
  describe("2. Admin Layout Chrome (app/admin/layout.tsx)", () => {
    const adminLayoutPath = path.join(PROJECT_ROOT, "app/admin/layout.tsx");
    const adminLayoutContent = fs.readFileSync(adminLayoutPath, "utf-8");

    it("2.1 should render dedicated BargainStore Control Panel header", () => {
      assert.ok(
        adminLayoutContent.includes("BargainStore Control Panel"),
        "Admin layout must include 'BargainStore Control Panel'"
      );
    });

    it("2.2 should include semantic Admin Navigation Links", () => {
      assert.ok(
        adminLayoutContent.includes('aria-label="Admin Navigation Links"') ||
        adminLayoutContent.includes("Admin Navigation Links"),
        "Admin layout must contain navigation links"
      );
      assert.ok(adminLayoutContent.includes("/admin/products"));
      assert.ok(adminLayoutContent.includes("/admin/orders"));
      assert.ok(adminLayoutContent.includes("/admin/turso"));
    });

    it("2.3 should display store administrator Ghulam Mujtaba badge", () => {
      assert.ok(
        adminLayoutContent.includes("Ghulam Mujtaba"),
        "Admin layout must feature store administrator identity"
      );
    });
  });

  // =========================================================================
  // SECTION 3: Turso API Route Logic & Live Database Integrity
  // =========================================================================
  describe("3. Turso API Route Logic (app/api/turso/route.ts)", () => {
    const tursoPath = path.join(PROJECT_ROOT, "app/api/turso/route.ts");
    const tursoContent = fs.readFileSync(tursoPath, "utf-8");

    it("3.1 should execute genuine SQL COUNT queries against products, categories, orders, order_items", () => {
      assert.ok(tursoContent.includes("SELECT COUNT(*) as c FROM products"));
      assert.ok(tursoContent.includes("SELECT COUNT(*) as c FROM categories"));
      assert.ok(tursoContent.includes("SELECT COUNT(*) as c FROM orders"));
      assert.ok(tursoContent.includes("SELECT COUNT(*) as c FROM order_items"));
    });

    it("3.2 should include tursoDashboardUrl link", () => {
      assert.ok(
        tursoContent.includes("https://app.turso.tech/ghulam--mujtaba"),
        "Turso API must provide the Turso cloud dashboard link"
      );
    });

    it("3.3 should verify live database counts match genuine SQLite execution", async () => {
      const [prodRes, catRes, orderRes, itemsRes] = await Promise.all([
        executeDb("SELECT COUNT(*) as c FROM products;"),
        executeDb("SELECT COUNT(*) as c FROM categories;"),
        executeDb("SELECT COUNT(*) as c FROM orders;"),
        executeDb("SELECT COUNT(*) as c FROM order_items;"),
      ]);

      const productsCount = Number(prodRes.rows[0]?.c || 0);
      const categoriesCount = Number(catRes.rows[0]?.c || 0);
      const ordersCount = Number(orderRes.rows[0]?.c || 0);
      const itemsCount = Number(itemsRes.rows[0]?.c || 0);

      assert.ok(productsCount >= 12, `Expected >= 12 products, got ${productsCount}`);
      assert.equal(categoriesCount, 6, `Expected exactly 6 categories, got ${categoriesCount}`);
      assert.ok(ordersCount >= 0, "Orders count must be a non-negative integer");
      assert.ok(itemsCount >= 0, "Order items count must be a non-negative integer");
    });
  });

  // =========================================================================
  // SECTION 4: Orders PATCH Route Invariants
  // =========================================================================
  describe("4. Orders PATCH Route Invariants (app/api/orders/[id]/route.ts)", () => {
    const routePath = path.join(PROJECT_ROOT, "app/api/orders/[id]/route.ts");
    const routeContent = fs.readFileSync(routePath, "utf-8");

    it("4.1 should define ALLOWED_STATUSES containing all 5 lifecycle states", () => {
      assert.ok(routeContent.includes('"Pending"'));
      assert.ok(routeContent.includes('"Processing"'));
      assert.ok(routeContent.includes('"Shipped"'));
      assert.ok(routeContent.includes('"Delivered"'));
      assert.ok(routeContent.includes('"Cancelled"'));
    });

    it("4.2 should guard against malformed JSON or empty request body with 400", () => {
      assert.ok(routeContent.includes("request.json()"));
      assert.ok(routeContent.includes("status: 400"));
      assert.ok(routeContent.includes("Invalid JSON or empty request body"));
    });

    it("4.3 should verify order existence before mutation and return 404 for nonexistent order", () => {
      assert.ok(routeContent.includes("status: 404"));
      assert.ok(
        routeContent.includes("not found") ||
        routeContent.includes("Not found") ||
        routeContent.includes("Not Found"),
        "Route must return informative 404 error when order is not found"
      );
    });

    it("4.4 should validate orderId is a positive number", () => {
      assert.ok(routeContent.includes("isNaN(orderId)"));
      assert.ok(routeContent.includes("orderId <= 0"));
    });
  });

  // =========================================================================
  // SECTION 5: Direct SQLite Order Lifecycle Mutation & State Transitions
  // =========================================================================
  describe("5. Direct SQLite Order Lifecycle Mutation & State Transitions", () => {
    it("5.1 should transition an order through all 5 lifecycle statuses and verify persistence", async () => {
      // Create a test order directly in the database using test-helper
      const { orderId } = await insertDbOrder({
        customerName: "M2 Adversarial Tester",
        customerEmail: "test-m2@bargainstore.uk",
        customerPhone: "07123456789",
        shippingAddress: "100 Bull Street",
        city: "Birmingham",
        postcode: "B4 6AF",
        subtotal: 49.99,
        total: 49.99,
        status: "Pending",
      });

      assert.ok(orderId > 0, "Order insertion should return valid ID");

      const lifecycleSequence = ["Processing", "Shipped", "Delivered", "Cancelled", "Pending"];

      for (const targetStatus of lifecycleSequence) {
        await updateDbOrderStatus(orderId, targetStatus);

        const verifyResult = await executeDb({
          sql: "SELECT id, status FROM orders WHERE id = ? LIMIT 1",
          args: [orderId],
        });

        assert.equal(verifyResult.rows.length, 1);
        assert.equal(
          verifyResult.rows[0].status,
          targetStatus,
          `Status in database should be updated to "${targetStatus}"`
        );
      }

      // Teardown test order
      await executeDb({
        sql: "DELETE FROM orders WHERE id = ?",
        args: [orderId],
      });
      createdOrderIds.delete(orderId);
    });

    it("5.2 should confirm nonexistent order query returns 0 rows", async () => {
      const nonexistentId = 9999999;
      const res = await executeDb({
        sql: "SELECT id FROM orders WHERE id = ? LIMIT 1",
        args: [nonexistentId],
      });
      assert.equal(res.rows.length, 0, "Query for nonexistent order ID 9999999 must return 0 rows");
    });
  });

  // =========================================================================
  // SECTION 6: HeroBanner JSX Typings
  // =========================================================================
  describe("6. HeroBanner JSX Typings (components/HeroBanner.tsx)", () => {
    const bannerPath = path.join(PROJECT_ROOT, "components/HeroBanner.tsx");
    const bannerContent = fs.readFileSync(bannerPath, "utf-8");

    it("6.1 should NOT contain invalid priority='true' attribute on native img element", () => {
      assert.ok(!bannerContent.includes('priority="true"'));
      assert.ok(!bannerContent.includes("priority='true'"));
    });

    it("6.2 should contain valid HTML img element with hero banner asset", () => {
      assert.ok(bannerContent.includes("/assets/banners/hero-banner.webp"));
    });

    it("6.3 should specify valid fetchPriority attribute on hero img element", () => {
      assert.ok(bannerContent.includes('fetchPriority="high"'));
    });
  });
});
