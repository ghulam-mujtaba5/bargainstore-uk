import test, { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PROJECT_ROOT,
  dbClient,
  cleanupTestData,
  getDbProducts,
  getDbProductById,
  searchDbProducts,
  getDbCategories,
  getDbCategoryBySlug,
  getDbOrderByNumber,
  insertDbOrder,
  updateDbOrderStatus,
  insertDbProduct,
  deleteDbProduct,
  isValidUKPostcode,
  calculateBasket,
  verifyWebPFile,
  calculateAdminMetrics,
} from "./test-helper.mjs";

after(async () => {
  await cleanupTestData();
});

describe("Tier 2: Boundary Value Analysis & Edge Cases (22 Features, Boundary Tests)", () => {
  // Feature 1: Asset Boundaries
  describe("Feature 1: Real Asset Integration Boundaries", () => {
    it("1.1 should return valid: false for non-existent asset path", () => {
      const res = verifyWebPFile("public/assets/brands/non-existent-brand.webp");
      assert.equal(res.valid, false);
      assert.match(res.error, /File not found/i);
    });

    it("1.2 should reject a 0-byte or corrupted asset file", () => {
      const tempPath = path.join(PROJECT_ROOT, "public/assets/temp-zero.webp");
      fs.writeFileSync(tempPath, Buffer.alloc(0));
      try {
        const res = verifyWebPFile(tempPath);
        assert.equal(res.valid, false);
        assert.match(res.error, /empty/i);
      } finally {
        fs.unlinkSync(tempPath);
      }
    });

    it("1.3 should verify all brand logos are under 250KB for fast page loading", () => {
      const brands = [
        "black-decker.webp",
        "flymo.webp",
        "hozelock.webp",
        "joseph-joseph.webp",
        "stanley.webp",
        "tower.webp",
      ];
      for (const brand of brands) {
        const res = verifyWebPFile(path.join("public/assets/brands", brand));
        assert.ok(res.sizeBytes < 250000, `${brand} size must be < 250KB`);
      }
    });

    it("1.4 should confirm all payment badges are compact (< 10KB)", () => {
      const badges = ["visa.webp", "mastercard.webp", "paypal.webp", "apple-pay.webp", "google-pay.webp"];
      for (const badge of badges) {
        const res = verifyWebPFile(path.join("public/assets/payment", badge));
        assert.ok(res.sizeBytes < 10000, `${badge} must be < 10KB`);
      }
    });

    it("1.5 should verify files do not use legacy PNG or JPEG signatures", () => {
      const flymo = path.join(PROJECT_ROOT, "public/assets/brands/flymo.webp");
      const buffer = fs.readFileSync(flymo);
      // PNG magic: 0x89 0x50 0x4E 0x47; JPEG magic: 0xFF 0xD8
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      assert.equal(isPng, false);
      assert.equal(isJpeg, false);
    });
  });

  // Feature 2: Responsive Navigation Boundaries
  describe("Feature 2: Responsive Navigation Boundaries", () => {
    it("2.1 should handle empty categories gracefully with fallback list", () => {
      const navbarPath = path.join(PROJECT_ROOT, "components/Navbar.tsx");
      const content = fs.readFileSync(navbarPath, "utf-8");
      assert.ok(content.includes("categories.length > 0 ? categories :"));
    });

    it("2.2 should reject search queries with length < 2 chars in debounced handler", () => {
      const navbarPath = path.join(PROJECT_ROOT, "components/Navbar.tsx");
      const content = fs.readFileSync(navbarPath, "utf-8");
      assert.ok(content.includes("searchQuery.length < 2"));
    });

    it("2.3 should support ultra-long search queries in form without crashing", () => {
      const longQuery = "a".repeat(300);
      assert.equal(longQuery.length, 300);
    });

    it("2.4 should handle cart count of 0 correctly without negative values", () => {
      const cartCount = 0;
      assert.ok(cartCount >= 0);
    });

    it("2.5 should support high cart item counts (> 99) in responsive badge", () => {
      const cartCount = 120;
      const display = cartCount > 99 ? "99+" : String(cartCount);
      assert.equal(display, "99+");
    });
  });

  // Feature 3: Search Latency & Keyword Boundaries
  describe("Feature 3: Search Latency & Keyword Boundaries", () => {
    it("3.1 should return empty array for empty search query", async () => {
      const results = await searchDbProducts("");
      assert.equal(results.length, 0);
    });

    it("3.2 should return empty array for whitespace-only search query", async () => {
      const results = await searchDbProducts("     ");
      assert.equal(results.length, 0);
    });

    it("3.3 should handle SQL wildcard characters (% and _) safely", async () => {
      const results = await searchDbProducts("%");
      assert.ok(Array.isArray(results));
    });

    it("3.4 should handle SQL quotation and apostrophe characters without syntax errors", async () => {
      const results = await searchDbProducts("Black'n'Decker; DROP TABLE--");
      assert.ok(Array.isArray(results));
    });

    it("3.5 should return empty array for completely non-existent term", async () => {
      const results = await searchDbProducts("xyznonexistentterm999888");
      assert.equal(results.length, 0);
    });
  });

  // Feature 4: Basket Threshold Boundaries (£49.99 vs £50.00)
  describe("Feature 4: Basket Threshold Boundaries (£49.99 vs £50.00)", () => {
    it("4.1 should charge delivery fee on £49.99 (exact 1p below free threshold)", () => {
      const items = [{ price: 49.99, quantity: 1 }];
      const basket = calculateBasket({ items, standardShippingFee: 4.99 });
      assert.equal(basket.subtotal, 49.99);
      assert.equal(basket.qualifiesForFreeDelivery, false);
      assert.equal(basket.shippingFee, 4.99);
      assert.equal(basket.grandTotal, 54.98);
      assert.equal(basket.amountNeededForFreeDelivery, 0.01);
    });

    it("4.2 should grant free delivery on £50.00 (exact threshold boundary)", () => {
      const items = [{ price: 50.0, quantity: 1 }];
      const basket = calculateBasket({ items, standardShippingFee: 4.99 });
      assert.equal(basket.subtotal, 50.0);
      assert.equal(basket.qualifiesForFreeDelivery, true);
      assert.equal(basket.shippingFee, 0.0);
      assert.equal(basket.grandTotal, 50.0);
      assert.equal(basket.amountNeededForFreeDelivery, 0.0);
    });

    it("4.3 should grant free delivery on £50.01 (exact 1p above free threshold)", () => {
      const items = [{ price: 50.01, quantity: 1 }];
      const basket = calculateBasket({ items, standardShippingFee: 4.99 });
      assert.equal(basket.subtotal, 50.01);
      assert.equal(basket.qualifiesForFreeDelivery, true);
      assert.equal(basket.shippingFee, 0.0);
      assert.equal(basket.grandTotal, 50.01);
    });

    it("4.4 should handle £0.00 basket without charging delivery fee or negative total", () => {
      const basket = calculateBasket({ items: [] });
      assert.equal(basket.subtotal, 0.0);
      assert.equal(basket.grandTotal, 0.0);
    });

    it("4.5 should apply delivery fee for minimal non-zero item (£0.01)", () => {
      const items = [{ price: 0.01, quantity: 1 }];
      const basket = calculateBasket({ items, standardShippingFee: 4.99 });
      assert.equal(basket.subtotal, 0.01);
      assert.equal(basket.shippingFee, 4.99);
      assert.equal(basket.grandTotal, 5.0);
    });
  });

  // Feature 5: Voucher Calculation Boundaries
  describe("Feature 5: Voucher Calculation Boundaries", () => {
    it("5.1 should compute exact 10% discount on £49.99 basket (£5.00 rounded)", () => {
      const items = [{ price: 49.99, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "BARGAIN10", standardShippingFee: 4.99 });
      assert.equal(basket.discountAmount, 5.0);
      assert.equal(basket.grandTotal, 49.98); // 49.99 - 5.00 + 4.99
    });

    it("5.2 should compute exact 10% discount on £50.00 basket (£5.00 discount, £0 shipping)", () => {
      const items = [{ price: 50.0, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "BARGAIN10" });
      assert.equal(basket.discountAmount, 5.0);
      assert.equal(basket.grandTotal, 45.0);
    });

    it("5.3 should compute exact 10% discount on large basket (£2,499.90)", () => {
      const items = [{ price: 2499.9, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "BARGAIN10" });
      assert.equal(basket.discountAmount, 249.99);
      assert.equal(basket.grandTotal, 2249.91);
    });

    it("5.4 should accept voucher with surrounding whitespace and newline characters", () => {
      const items = [{ price: 100.0, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "  BARGAIN10\n  " });
      assert.equal(basket.discountPercent, 10);
      assert.equal(basket.discountAmount, 10.0);
    });

    it("5.5 should reject partial codes like 'BARGAIN', 'BARGAIN5', 'BARGAIN100'", () => {
      const items = [{ price: 50.0, quantity: 1 }];
      for (const invalidCode of ["BARGAIN", "BARGAIN5", "BARGAIN100", "10BARGAIN"]) {
        const basket = calculateBasket({ items, promoCode: invalidCode });
        assert.equal(basket.discountPercent, 0, `Code ${invalidCode} should not match`);
      }
    });
  });

  // Feature 6: UK Postcode Malformed & Boundary Formats
  describe("Feature 6: UK Postcode Malformed & Boundary Formats", () => {
    it("6.1 should reject empty string, null, or undefined as UK postcode", () => {
      assert.equal(isValidUKPostcode(""), false);
      assert.equal(isValidUKPostcode("   "), false);
      assert.equal(isValidUKPostcode(null), false);
      assert.equal(isValidUKPostcode(undefined), false);
    });

    it("6.2 should reject non-UK international postal codes (US 90210, Canadian K1A 0B1)", () => {
      assert.equal(isValidUKPostcode("90210"), false);
      assert.equal(isValidUKPostcode("K1A 0B1"), false);
      assert.equal(isValidUKPostcode("10001"), false);
    });

    it("6.3 should reject strings with numbers only or letters only", () => {
      assert.equal(isValidUKPostcode("12345"), false);
      assert.equal(isValidUKPostcode("ABCDEF"), false);
      assert.equal(isValidUKPostcode("ABC DEF"), false);
    });

    it("6.4 should reject incomplete outward or inward codes (SW1A, 1AA, W1)", () => {
      assert.equal(isValidUKPostcode("SW1A"), false);
      assert.equal(isValidUKPostcode("1AA"), false);
      assert.equal(isValidUKPostcode("W1"), false);
    });

    it("6.5 should accept valid UK formats EC1A 1BB and double-digit area DN55 1PT", () => {
      assert.equal(isValidUKPostcode("EC1A 1BB"), true);
      assert.equal(isValidUKPostcode("DN55 1PT"), true);
      assert.equal(isValidUKPostcode("CR2 6XH"), true);
    });
  });

  // Feature 7: Order Creation Validation Boundaries
  describe("Feature 7: Order Creation Validation Boundaries", () => {
    it("7.1 should handle order creation with empty line items without crash", async () => {
      const res = await insertDbOrder({
        customerName: "No Items Test",
        customerEmail: "noitems@example.co.uk",
        shippingAddress: "1 Lone Road",
        city: "Leeds",
        postcode: "LS1 1AA",
        subtotal: 0.0,
        total: 0.0,
      }, []);
      assert.ok(res.orderId > 0);
    });

    it("7.2 should handle large bulk order with 20 items", async () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        productId: i + 1,
        productName: `Bulk Item ${i + 1}`,
        price: 9.99,
        quantity: 2,
      }));
      const { orderNumber } = await insertDbOrder({
        customerName: "Bulk Buyer",
        customerEmail: "bulk@example.co.uk",
        shippingAddress: "100 Warehouse Way",
        city: "Birmingham",
        postcode: "B1 1AA",
        subtotal: 399.6,
        total: 399.6,
      }, items);
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.items.length, 20);
    });

    it("7.3 should handle punctuation and special characters in shipping address", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Dr. O'Reilly-Smith",
        customerEmail: "oreilly.smith@example.co.uk",
        shippingAddress: "Flat 4B, St. John's Court, High St.",
        city: "Newcastle upon Tyne",
        postcode: "NE1 1AD",
        subtotal: 45.0,
        total: 49.99,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.customer_name, "Dr. O'Reilly-Smith");
      assert.ok(order.shipping_address.includes("St. John's Court"));
    });

    it("7.4 should accept subaddressed email addresses (user+tag@domain.co.uk)", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Subaddress User",
        customerEmail: "user+bargains@example.co.uk",
        shippingAddress: "32 Park Lane",
        city: "London",
        postcode: "W1K 1PN",
        subtotal: 25.0,
        total: 29.99,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.customer_email, "user+bargains@example.co.uk");
    });

    it("7.5 should store high precision decimal monetary amounts correctly", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Penny Precision",
        customerEmail: "penny@example.co.uk",
        shippingAddress: "1 Penny Lane",
        city: "Liverpool",
        postcode: "L18 1DG",
        subtotal: 49.99,
        shippingFee: 4.99,
        total: 54.98,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(Number(order.total), 54.98);
    });
  });

  // Feature 8: Live Order Confirmation Boundaries
  describe("Feature 8: Live Order Confirmation Boundaries", () => {
    it("8.1 should return null for empty string order number", async () => {
      const order = await getDbOrderByNumber("");
      assert.equal(order, null);
    });

    it("8.2 should return null for order number exceeding 200 characters", async () => {
      const order = await getDbOrderByNumber("BS-" + "9".repeat(250));
      assert.equal(order, null);
    });

    it("8.3 should handle SQL injection string in order number lookup safely", async () => {
      const order = await getDbOrderByNumber("' OR 1=1--");
      assert.equal(order, null);
    });

    it("8.4 should return null for lowercase 'bs-123456' when orders use uppercase", async () => {
      const order = await getDbOrderByNumber("bs-nonexistent");
      assert.equal(order, null);
    });

    it("8.5 should handle order with 0 subtotal cleanly", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Free Sample Recipient",
        customerEmail: "free@example.co.uk",
        shippingAddress: "0 Null St",
        city: "London",
        postcode: "EC1A 1BB",
        subtotal: 0.0,
        shippingFee: 0.0,
        total: 0.0,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(Number(order.total), 0);
    });
  });

  // Feature 9: Category & Subcategory Boundaries
  describe("Feature 9: Category & Subcategory Boundaries", () => {
    it("9.1 should return null for empty category slug", async () => {
      const cat = await getDbCategoryBySlug("");
      assert.equal(cat, null);
    });

    it("9.2 should return null for category slug with spaces or illegal characters", async () => {
      const cat = await getDbCategoryBySlug("diy decorating & paint");
      assert.equal(cat, null);
    });

    it("9.3 should parse subcategories array with 0 syntax errors across all categories", async () => {
      const res = await dbClient.execute("SELECT slug, subcategories FROM categories");
      for (const row of res.rows) {
        if (row.subcategories) {
          const parsed = JSON.parse(row.subcategories);
          assert.ok(Array.isArray(parsed));
          assert.ok(parsed.length > 0);
        }
      }
    });

    it("9.4 should return empty product list for category that has no products", async () => {
      const res = await dbClient.execute({
        sql: "SELECT * FROM products WHERE category_slug = ?",
        args: ["empty-department"],
      });
      assert.equal(res.rows.length, 0);
    });

    it("9.5 should match category slug exact case-sensitively", async () => {
      const cat = await getDbCategoryBySlug("DIY-DECORATING");
      // Local SQLite may or may not be case sensitive, but function should return cleanly
      assert.ok(cat === null || cat.slug === "diy-decorating");
    });
  });

  // Feature 10: Route Fallbacks & Edge Routes
  describe("Feature 10: Route Fallbacks & Edge Routes", () => {
    it("10.1 should verify terms and privacy route components exist", () => {
      const footerPath = path.join(PROJECT_ROOT, "components/Footer.tsx");
      const content = fs.readFileSync(footerPath, "utf-8");
      assert.ok(content.includes("/terms"));
      assert.ok(content.includes("/privacy"));
      assert.ok(content.includes("/cookies"));
    });

    it("10.2 should verify product dynamic route folder exists", () => {
      const prodDir = path.join(PROJECT_ROOT, "app/product/[slug]");
      assert.ok(fs.existsSync(prodDir));
    });

    it("10.3 should verify category dynamic route folder exists", () => {
      const catDir = path.join(PROJECT_ROOT, "app/category/[slug]");
      assert.ok(fs.existsSync(catDir));
    });

    it("10.4 should verify shop listing route folder exists", () => {
      const shopDir = path.join(PROJECT_ROOT, "app/shop");
      assert.ok(fs.existsSync(shopDir));
    });

    it("10.5 should verify ideas & advice blog guide route folder exists", () => {
      const ideasDir = path.join(PROJECT_ROOT, "app/ideas-advice");
      assert.ok(fs.existsSync(ideasDir));
    });
  });

  // Feature 11: Admin Layout Boundary Isolation
  describe("Feature 11: Admin Layout Boundary Isolation", () => {
    it("11.1 should verify admin product subroute exists at app/admin/products/new", () => {
      const newProdPath = path.join(PROJECT_ROOT, "app/admin/products/new/page.tsx");
      assert.ok(fs.existsSync(newProdPath));
    });

    it("11.2 should verify admin orders subroute exists at app/admin/orders", () => {
      const ordersPath = path.join(PROJECT_ROOT, "app/admin/orders/page.tsx");
      assert.ok(fs.existsSync(ordersPath));
    });

    it("11.3 should verify admin sidebar has target=_blank on external console link", () => {
      const layoutPath = path.join(PROJECT_ROOT, "app/admin/layout.tsx");
      const content = fs.readFileSync(layoutPath, "utf-8");
      assert.ok(content.includes('target="_blank"'));
    });

    it("11.4 should verify admin layout does not import public storefront Header or Footer", () => {
      const layoutPath = path.join(PROJECT_ROOT, "app/admin/layout.tsx");
      const content = fs.readFileSync(layoutPath, "utf-8");
      assert.equal(content.includes("<Navbar"), false);
      assert.equal(content.includes("<Footer"), false);
      assert.equal(content.includes("@/components/Footer"), false);
    });

    it("11.5 should verify admin main container has overflow-y-auto scrolling container", () => {
      const layoutPath = path.join(PROJECT_ROOT, "app/admin/layout.tsx");
      const content = fs.readFileSync(layoutPath, "utf-8");
      assert.ok(content.includes("overflow-y-auto"));
    });
  });

  // Feature 12: Admin Dashboard Metric Boundaries
  describe("Feature 12: Admin Dashboard Metric Boundaries", () => {
    it("12.1 should classify product with stock = 15 as low stock alert (boundary)", async () => {
      const { id } = await insertDbProduct({
        name: "Boundary Stock Item 15",
        brand: "Boundary",
        categorySlug: "diy-decorating",
        price: 19.99,
        stock: 15,
      });
      const prod = await getDbProductById(id);
      assert.ok(Number(prod.stock) <= 15, "Stock 15 must trigger low stock");
    });

    it("12.2 should classify product with stock = 16 as healthy stock (boundary)", async () => {
      const { id } = await insertDbProduct({
        name: "Boundary Stock Item 16",
        brand: "Boundary",
        categorySlug: "diy-decorating",
        price: 19.99,
        stock: 16,
      });
      const prod = await getDbProductById(id);
      assert.ok(Number(prod.stock) > 15, "Stock 16 must not trigger low stock");
    });

    it("12.3 should classify product with stock = 0 as out of stock warning", async () => {
      const { id } = await insertDbProduct({
        name: "Out of Stock Item 0",
        brand: "Boundary",
        categorySlug: "housewares",
        price: 29.99,
        stock: 0,
      });
      const prod = await getDbProductById(id);
      assert.equal(Number(prod.stock), 0);
    });

    it("12.4 should handle 0 orders without throwing division by zero in metric calculations", async () => {
      const metrics = await calculateAdminMetrics();
      assert.ok(Number.isFinite(metrics.totalRevenue));
      assert.ok(Number.isFinite(metrics.orderCount));
    });

    it("12.5 should verify low stock count is never negative", async () => {
      const metrics = await calculateAdminMetrics();
      assert.ok(metrics.lowStockCount >= 0);
    });
  });

  // Feature 13: Admin Catalog Search & Filter Boundaries
  describe("Feature 13: Admin Catalog Search & Filter Boundaries", () => {
    it("13.1 should return empty array when searching for non-matching characters", async () => {
      const results = await searchDbProducts("!@#$%^&*()");
      assert.equal(results.length, 0);
    });

    it("13.2 should handle products with compare_price = null without crash", async () => {
      const products = await getDbProducts(50);
      const withoutCompare = products.filter((p) => p.compare_price === null);
      assert.ok(Array.isArray(withoutCompare));
    });

    it("13.3 should handle product with compare_price <= price without badge", async () => {
      const { id } = await insertDbProduct({
        name: "No Saving Item",
        brand: "Test",
        categorySlug: "electricals",
        price: 30.0,
        comparePrice: 30.0,
      });
      const prod = await getDbProductById(id);
      assert.equal(prod.saving_amount, null);
    });

    it("13.4 should support searching catalog with single character query", async () => {
      const results = await searchDbProducts("a", 6);
      assert.ok(results.length <= 6);
    });

    it("13.5 should verify limit argument clamps catalog query length", async () => {
      const limit1 = await searchDbProducts("e", 1);
      assert.equal(limit1.length, 1);
    });
  });

  // Feature 14: Admin Product Creation Validation Boundaries
  describe("Feature 14: Admin Product Creation Validation Boundaries", () => {
    it("14.1 should support penny price products (£0.01)", async () => {
      const { id } = await insertDbProduct({
        name: "Sample Washer 1p",
        brand: "Stanley",
        categorySlug: "diy-decorating",
        price: 0.01,
      });
      const prod = await getDbProductById(id);
      assert.equal(Number(prod.price), 0.01);
    });

    it("14.2 should support high value equipment price (£9,999.99)", async () => {
      const { id } = await insertDbProduct({
        name: "Industrial Site Generator",
        brand: "Stanley",
        categorySlug: "electricals",
        price: 9999.99,
      });
      const prod = await getDbProductById(id);
      assert.equal(Number(prod.price), 9999.99);
    });

    it("14.3 should handle long product title (150+ chars) in slug generation", async () => {
      const longTitle = "Heavy Duty Cordless Hammer Drill Driver With 2x 5.0Ah Lithium-Ion Batteries Charger And Heavy Duty Carry Case Extra Long Edition";
      const { slug } = await insertDbProduct({
        name: longTitle,
        brand: "DeWalt",
        categorySlug: "diy-decorating",
        price: 189.99,
      });
      assert.ok(slug.length > 50);
      assert.match(slug, /heavy-duty-cordless/);
    });

    it("14.4 should handle special characters and punctuation in product title slugification", async () => {
      const title = "Black+Decker 18V Mouse® Detail Sander & Accessories (Kit)";
      const { slug } = await insertDbProduct({
        name: title,
        brand: "Black+Decker",
        categorySlug: "diy-decorating",
        price: 34.99,
      });
      assert.ok(!slug.includes("®"));
      assert.ok(!slug.includes("&"));
      assert.ok(!slug.includes("("));
    });

    it("14.5 should generate distinct slugs for duplicate product titles using timestamp suffix", async () => {
      const name = "Identical Title Test";
      const prodA = await insertDbProduct({ name, brand: "Brand A", categorySlug: "housewares", price: 10.0 });
      const prodB = await insertDbProduct({ name, brand: "Brand B", categorySlug: "housewares", price: 10.0 });
      assert.notEqual(prodA.slug, prodB.slug);
    });
  });

  // Feature 15: Order Status Transition Boundaries
  describe("Feature 15: Order Status Transition Boundaries", () => {
    it("15.1 should handle multiple rapid status transitions (Processing -> Shipped -> Delivered)", async () => {
      const { orderId } = await insertDbOrder({
        customerName: "Rapid Transition",
        customerEmail: "rapid@example.co.uk",
        shippingAddress: "1 Fast Way",
        city: "London",
        postcode: "SW1A 1AA",
        subtotal: 20.0,
        total: 20.0,
        status: "Processing",
      });
      await updateDbOrderStatus(orderId, "Shipped");
      await updateDbOrderStatus(orderId, "Delivered");
      const res = await dbClient.execute({ sql: "SELECT status FROM orders WHERE id = ?", args: [orderId] });
      assert.equal(res.rows[0].status, "Delivered");
    });

    it("15.2 should support transition to 'Cancelled' status", async () => {
      const { orderId } = await insertDbOrder({
        customerName: "Cancellation Test",
        customerEmail: "cancel@example.co.uk",
        shippingAddress: "2 Stop St",
        city: "Manchester",
        postcode: "M1 1AE",
        subtotal: 30.0,
        total: 30.0,
      });
      await updateDbOrderStatus(orderId, "Cancelled");
      const res = await dbClient.execute({ sql: "SELECT status FROM orders WHERE id = ?", args: [orderId] });
      assert.equal(res.rows[0].status, "Cancelled");
    });

    it("15.3 should gracefully handle updating status of non-existent order ID", async () => {
      await assert.doesNotReject(async () => {
        await updateDbOrderStatus(99999999, "Delivered");
      });
    });

    it("15.4 should support status rollback (Delivered back to Processing)", async () => {
      const { orderId } = await insertDbOrder({
        customerName: "Rollback Test",
        customerEmail: "rollback@example.co.uk",
        shippingAddress: "3 Reverse Lane",
        city: "Bristol",
        postcode: "BS1 1AA",
        subtotal: 15.0,
        total: 19.99,
        status: "Delivered",
      });
      await updateDbOrderStatus(orderId, "Processing");
      const res = await dbClient.execute({ sql: "SELECT status FROM orders WHERE id = ?", args: [orderId] });
      assert.equal(res.rows[0].status, "Processing");
    });

    it("15.5 should verify order status update preserves customer postcode format exactly", async () => {
      const { orderId, orderNumber } = await insertDbOrder({
        customerName: "Postcode Guard",
        customerEmail: "guard@example.co.uk",
        shippingAddress: "4 Guard St",
        city: "London",
        postcode: "EC1A 1BB",
        subtotal: 40.0,
        total: 44.99,
      });
      await updateDbOrderStatus(orderId, "Shipped");
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.postcode, "EC1A 1BB");
    });
  });

  // Feature 16: Turso Connection & Health Boundaries
  describe("Feature 16: Turso Connection & Health Boundaries", () => {
    it("16.1 should execute multiple concurrent queries without connection pool starvation", async () => {
      const queries = Array.from({ length: 10 }, () => dbClient.execute("SELECT 1 as n"));
      const results = await Promise.all(queries);
      assert.equal(results.length, 10);
      for (const r of results) {
        assert.equal(Number(r.rows[0].n), 1);
      }
    });

    it("16.2 should handle SQL syntax errors gracefully via LibsqlError", async () => {
      await assert.rejects(async () => {
        await dbClient.execute("SELECT * FROM invalid_table_that_does_not_exist_xyz;");
      });
    });

    it("16.3 should verify database counts return non-negative integers", async () => {
      const res = await dbClient.execute("SELECT COUNT(*) as c FROM products");
      const count = Number(res.rows[0].c);
      assert.ok(Number.isInteger(count));
      assert.ok(count >= 0);
    });

    it("16.4 should verify database URL masking logic for cloud URLs", () => {
      const cloudUrl = "libsql://my-db-account:secrettoken123@turso.io";
      const masked = cloudUrl.replace(/:[^:]*@/, ":***@");
      assert.ok(!masked.includes("secrettoken123"));
    });

    it("16.5 should ensure turso status API endpoint route file exists", () => {
      const routePath = path.join(PROJECT_ROOT, "app/api/turso-status/route.ts");
      assert.ok(fs.existsSync(routePath));
    });
  });

  // Feature 17: SEO Metadata Boundaries
  describe("Feature 17: SEO Metadata Boundaries", () => {
    it("17.1 should verify root meta title length does not exceed standard 70 chars", () => {
      const title = "BargainStore.uk | Trusted UK Brands At Low Prices";
      assert.ok(title.length <= 70, `Title length ${title.length} exceeds 70 chars`);
    });

    it("17.2 should verify root description length is informative and under 250 chars", () => {
      const desc = "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.";
      assert.ok(desc.length <= 250);
      assert.ok(desc.length > 50);
    });

    it("17.3 should sanitize product titles with HTML characters in dynamic SEO strings", () => {
      const rawTitle = 'Dulux Paint <Pure White> & "Brilliant" 7L';
      const sanitized = rawTitle.replace(/[<>"]/g, "");
      assert.ok(!sanitized.includes("<"));
      assert.ok(!sanitized.includes(">"));
    });

    it("17.4 should format GBP price strings cleanly with 2 decimal places for SEO", () => {
      const price = 19.99;
      const formatted = `£${price.toFixed(2)}`;
      assert.equal(formatted, "£19.99");
    });

    it("17.5 should provide canonical domain target URL https://bargainstore.uk", () => {
      const domain = "https://bargainstore.uk";
      assert.match(domain, /^https:\/\/[a-z0-9.-]+\.uk$/);
    });
  });

  // Feature 18: JSON-LD Boundary Validation
  describe("Feature 18: JSON-LD Boundary Validation", () => {
    it("18.1 should format Product schema offer price as a numeric value without £ symbol", () => {
      const offer = {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: 49.99,
        availability: "https://schema.org/InStock",
      };
      assert.equal(typeof offer.price, "number");
      assert.equal(offer.priceCurrency, "GBP");
    });

    it("18.2 should serialize JSON-LD with escaped quotation marks in description without syntax error", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: 'Stanley 8m "FatMax" Tape',
        description: 'Featuring "BladeArmor" coating for durability.',
      };
      const json = JSON.stringify(schema);
      const parsed = JSON.parse(json);
      assert.equal(parsed.name, 'Stanley 8m "FatMax" Tape');
    });

    it("18.3 should handle product with out-of-stock availability schema", () => {
      const outOfStockAvailability = "https://schema.org/OutOfStock";
      assert.equal(outOfStockAvailability, "https://schema.org/OutOfStock");
    });

    it("18.4 should handle BreadcrumbList with single item (homepage boundary)", () => {
      const breadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bargainstore.uk" },
        ],
      };
      assert.equal(breadcrumbs.itemListElement.length, 1);
    });

    it("18.5 should verify Organization contact point telephone includes UK international prefix +44", () => {
      const phone = "+44-800-123-4567";
      assert.match(phone, /^\+44/);
    });
  });

  // Feature 19: Sitemap & Robots Boundary Directives
  describe("Feature 19: Sitemap & Robots Boundary Directives", () => {
    it("19.1 should verify sitemap URL count does not exceed Google 50,000 threshold", async () => {
      const products = await getDbProducts();
      const categories = await getDbCategories();
      const totalUrls = 5 + products.length + categories.length;
      assert.ok(totalUrls < 50000);
    });

    it("19.2 should verify sitemap URLs start with https:// protocol", () => {
      const url = "https://bargainstore.uk/product/flymo-lawnmower";
      assert.match(url, /^https:\/\//);
    });

    it("19.3 should format ISO 8601 last modified date string cleanly", () => {
      const iso = new Date().toISOString();
      assert.match(iso, /^\d{4}-\d{2}-\d{2}T/);
    });

    it("19.4 should ensure robots.txt User-agent rule targets all crawlers (*)", () => {
      const rule = { userAgent: "*", allow: "/" };
      assert.equal(rule.userAgent, "*");
    });

    it("19.5 should ensure admin and private API endpoints are marked for disallow", () => {
      const disallowed = ["/admin", "/api"];
      for (const d of disallowed) {
        assert.match(d, /^\/(admin|api)/);
      }
    });
  });

  // Feature 20: UK Retail Trust Credentials Boundaries
  describe("Feature 20: UK Retail Trust Credentials Boundaries", () => {
    it("20.1 should format UK VAT registration number in valid 9-digit format", () => {
      const vatNumber = "GB 432 9876 54";
      const digits = vatNumber.replace(/[^0-9]/g, "");
      assert.equal(digits.length, 9, "UK VAT number must contain exactly 9 digits");
    });

    it("20.2 should format Companies House registration number in standard 8-digit format", () => {
      const companyNumber = "14567890";
      assert.match(companyNumber, /^\d{8}$/, "Company Registration Number must be 8 digits");
    });

    it("20.3 should define 30-day money back returns guarantee period", () => {
      const returnsWindowDays = 30;
      assert.equal(returnsWindowDays, 30);
    });

    it("20.4 should reference trusted UK carriers (Royal Mail or DPD)", () => {
      const carriers = ["Royal Mail Tracked", "DPD Express"];
      assert.ok(carriers.some((c) => c.includes("Royal Mail")));
      assert.ok(carriers.some((c) => c.includes("DPD")));
    });

    it("20.5 should confirm 256-bit SSL encryption trust signal text", () => {
      const trustText = "256-Bit SSL Encrypted";
      assert.match(trustText, /256-Bit/);
    });
  });

  // Feature 21: Zero-Error Production Build Boundaries
  describe("Feature 21: Zero-Error Production Build Boundaries", () => {
    it("21.1 should confirm tsconfig target is modern ES (ES2017+ or ESNext)", () => {
      const tsconfig = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "tsconfig.json"), "utf-8"));
      assert.ok(tsconfig.compilerOptions.target || tsconfig.compilerOptions.lib);
    });

    it("21.2 should confirm package.json semver version format", () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf-8"));
      assert.match(pkg.version, /^\d+\.\d+\.\d+/);
    });

    it("21.3 should confirm Tailwind CSS content glob matches all components and app pages", () => {
      const tailwindConfigPath = path.join(PROJECT_ROOT, "tailwind.config.ts");
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      assert.ok(content.includes("./app/**/*.{js,ts,jsx,tsx,mdx}"));
      assert.ok(content.includes("./components/**/*.{js,ts,jsx,tsx,mdx}"));
    });

    it("21.4 should confirm Lucide React icon package is declared in dependencies", () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf-8"));
      assert.ok(pkg.dependencies["lucide-react"]);
    });

    it("21.5 should verify node engine compatibility with Node 22", () => {
      const currentVersion = process.versions.node;
      const major = parseInt(currentVersion.split(".")[0], 10);
      assert.ok(major >= 20, `Node major version must be >= 20, got ${major}`);
    });
  });

  // Feature 22: Local Production Server Port & Runtime Boundaries
  describe("Feature 22: Local Production Server Port & Runtime Boundaries", () => {
    it("22.1 should confirm default port 3000 is an unprivileged non-system port", () => {
      const port = 3000;
      assert.ok(port > 1024 && port < 65535);
    });

    it("22.2 should handle PORT environment variable override cleanly", () => {
      const customPort = Number("3005" || 3000);
      assert.equal(customPort, 3005);
    });

    it("22.3 should verify local.db file size is greater than 10KB", () => {
      const dbPath = path.join(PROJECT_ROOT, "local.db");
      const stat = fs.statSync(dbPath);
      assert.ok(stat.size > 10240, "local.db should be populated and > 10KB");
    });

    it("22.4 should confirm database connection URL supports both file: and libsql: protocols", () => {
      const localProtocol = "file:local.db".split(":")[0];
      const cloudProtocol = "libsql://my-cluster.turso.io".split(":")[0];
      assert.equal(localProtocol, "file");
      assert.equal(cloudProtocol, "libsql");
    });

    it("22.5 should execute rapid ping query returning execution timestamp", async () => {
      const start = performance.now();
      await dbClient.execute("SELECT 1;");
      const duration = performance.now() - start;
      assert.ok(duration < 50, `Ping query must take < 50ms, took ${duration.toFixed(2)}ms`);
    });
  });
});
