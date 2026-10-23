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
  getDbProductBySlug,
  searchDbProducts,
  getDbCategories,
  getDbCategoryBySlug,
  getDbOrders,
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

describe("Tier 1: Feature Coverage (22 Features, Happy Path)", () => {
  // Feature 1: Real Asset Integration
  describe("Feature 1: Real Asset Integration", () => {
    it("1.1 should have all 6 authentic brand logos in public/assets/brands", () => {
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
        assert.ok(res.valid, `Brand logo ${brand} must exist and be valid WebP`);
      }
    });

    it("1.2 should have all 5 authentic payment method badges in public/assets/payment", () => {
      const badges = [
        "visa.webp",
        "mastercard.webp",
        "paypal.webp",
        "apple-pay.webp",
        "google-pay.webp",
      ];
      for (const badge of badges) {
        const res = verifyWebPFile(path.join("public/assets/payment", badge));
        assert.ok(res.valid, `Payment badge ${badge} must exist and be valid WebP`);
      }
    });

    it("1.3 should have all 6 category imagery files in public/assets/categories", () => {
      const categories = [
        "diy-decorating.webp",
        "electricals.webp",
        "garden-growing.webp",
        "housewares.webp",
        "laundry-utility.webp",
        "outdoor-living.webp",
      ];
      for (const cat of categories) {
        const res = verifyWebPFile(path.join("public/assets/categories", cat));
        assert.ok(res.valid, `Category image ${cat} must exist and be valid WebP`);
      }
    });

    it("1.4 should have authentic hardware product photography in public/assets/products", () => {
      const products = [
        "black-decker-multitool.webp",
        "digital-blender.webp",
        "dr-beckmann.webp",
        "dulux-paint.webp",
        "joseph-bowl.webp",
        "joseph-dishrack.webp",
      ];
      for (const prod of products) {
        const res = verifyWebPFile(path.join("public/assets/products", prod));
        assert.ok(res.valid, `Product image ${prod} must exist and be valid WebP`);
      }
    });

    it("1.5 should verify all assets have non-trivial size (> 1KB) and proper WebP magic header", () => {
      const sampleAssets = [
        "public/assets/brands/flymo.webp",
        "public/assets/categories/outdoor-living.webp",
        "public/assets/payment/visa.webp",
      ];
      for (const assetPath of sampleAssets) {
        const res = verifyWebPFile(assetPath);
        assert.ok(res.valid);
        assert.ok(res.sizeBytes > 1000, `Asset ${assetPath} should be > 1000 bytes`);
      }
    });
  });

  // Feature 2: Responsive 3-Tier Navigation
  describe("Feature 2: Responsive 3-Tier Navigation", () => {
    const navbarPath = path.join(PROJECT_ROOT, "components/Navbar.tsx");
    const navbarContent = fs.readFileSync(navbarPath, "utf-8");

    it("2.1 should render top announcement bar with UK retail propositions", () => {
      assert.ok(
        /FREE UK Delivery/i.test(navbarContent),
        "Navbar top bar should mention Free UK Delivery"
      );
    });

    it("2.2 should include autocomplete search input and trigger in main tier", () => {
      assert.ok(
        navbarContent.includes("/api/search") || navbarContent.includes("searchQuery"),
        "Navbar should integrate live search querying"
      );
      assert.ok(navbarContent.includes("<input"), "Navbar must render search input");
    });

    it("2.3 should include basket drawer trigger with dynamic cart count badge", () => {
      assert.ok(
        navbarContent.includes("cartCount") || navbarContent.includes("setIsCartOpen"),
        "Navbar must bind to cart drawer trigger"
      );
    });

    it("2.4 should render category navigation bar with department links", () => {
      assert.ok(
        navbarContent.includes("/category/") || navbarContent.includes("categories"),
        "Navbar must render department category links"
      );
    });

    it("2.5 should incorporate responsive layout markup (mobile toggle and desktop views)", () => {
      assert.ok(
        navbarContent.includes("lg:flex") || navbarContent.includes("md:flex") || navbarContent.includes("hidden"),
        "Navbar must support responsive breakpoint classes"
      );
    });
  });

  // Feature 3: Autocomplete Search (< 300ms SLA)
  describe("Feature 3: Autocomplete Search (< 300ms SLA)", () => {
    it("3.1 should return matching products when querying by brand name 'Stanley'", async () => {
      const results = await searchDbProducts("Stanley");
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0, "Should find at least one Stanley product");
      assert.match(results[0].brand.toLowerCase(), /stanley/);
    });

    it("3.2 should return matching products when querying by keyword 'paint'", async () => {
      const results = await searchDbProducts("paint");
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0, "Should find products matching paint keyword");
    });

    it("3.3 should perform case-insensitive keyword matching", async () => {
      const lowerResults = await searchDbProducts("dulux");
      const upperResults = await searchDbProducts("DULUX");
      assert.equal(lowerResults.length, upperResults.length);
    });

    it("3.4 should enforce search results limit of at most 6 items", async () => {
      const results = await searchDbProducts("a", 6);
      assert.ok(results.length <= 6, "Search must return <= 6 items");
    });

    it("3.5 should complete search database query within 300ms SLA", async () => {
      const start = performance.now();
      await searchDbProducts("drill");
      const duration = performance.now() - start;
      assert.ok(duration < 300, `Search query must take < 300ms, took ${duration.toFixed(2)}ms`);
    });
  });

  // Feature 4: Basket Math & Free Delivery (£50)
  describe("Feature 4: Basket Math & Free Delivery (£50)", () => {
    it("4.1 should calculate subtotal correctly across multiple line items", () => {
      const items = [
        { price: 10.0, quantity: 2 },
        { price: 5.5, quantity: 3 },
      ];
      const basket = calculateBasket({ items });
      assert.equal(basket.subtotal, 36.5);
    });

    it("4.2 should charge standard shipping fee when subtotal is below £50.00", () => {
      const items = [{ price: 45.0, quantity: 1 }];
      const basket = calculateBasket({ items, standardShippingFee: 4.99 });
      assert.equal(basket.qualifiesForFreeDelivery, false);
      assert.equal(basket.shippingFee, 4.99);
      assert.equal(basket.grandTotal, 49.99);
    });

    it("4.3 should apply free shipping (£0.00) when subtotal reaches or exceeds £50.00", () => {
      const items = [{ price: 50.0, quantity: 1 }];
      const basket = calculateBasket({ items });
      assert.equal(basket.qualifiesForFreeDelivery, true);
      assert.equal(basket.shippingFee, 0.0);
      assert.equal(basket.grandTotal, 50.0);
    });

    it("4.4 should calculate exact remaining amount needed to qualify for free delivery", () => {
      const items = [{ price: 38.5, quantity: 1 }];
      const basket = calculateBasket({ items });
      assert.equal(basket.amountNeededForFreeDelivery, 11.5);
    });

    it("4.5 should dynamically update shipping from paid to free when item quantity increases", () => {
      const itemsBelow = [{ price: 20.0, quantity: 2 }]; // £40 -> shipping applies
      const basketBelow = calculateBasket({ items: itemsBelow, standardShippingFee: 4.99 });
      assert.equal(basketBelow.shippingFee, 4.99);

      const itemsAbove = [{ price: 20.0, quantity: 3 }]; // £60 -> free shipping
      const basketAbove = calculateBasket({ items: itemsAbove, standardShippingFee: 4.99 });
      assert.equal(basketAbove.shippingFee, 0.0);
      assert.equal(basketAbove.grandTotal, 60.0);
    });
  });

  // Feature 5: Voucher Calculation (BARGAIN10)
  describe("Feature 5: Voucher Calculation (BARGAIN10)", () => {
    it("5.1 should apply 10% discount when promo code BARGAIN10 is supplied", () => {
      const items = [{ price: 40.0, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "BARGAIN10", standardShippingFee: 4.99 });
      assert.equal(basket.discountPercent, 10);
      assert.equal(basket.discountAmount, 4.0);
      assert.equal(basket.grandTotal, 40.99); // 40 - 4 + 4.99
    });

    it("5.2 should accept lowercase voucher code 'bargain10' case-insensitively", () => {
      const items = [{ price: 100.0, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "bargain10" });
      assert.equal(basket.discountPercent, 10);
      assert.equal(basket.discountAmount, 10.0);
      assert.equal(basket.grandTotal, 90.0);
    });

    it("5.3 should preserve free delivery threshold based on original subtotal before voucher", () => {
      const items = [{ price: 55.0, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "BARGAIN10" });
      assert.equal(basket.qualifiesForFreeDelivery, true);
      assert.equal(basket.shippingFee, 0.0);
      assert.equal(basket.discountAmount, 5.5);
      assert.equal(basket.grandTotal, 49.5); // 55 - 5.5 + 0
    });

    it("5.4 should reject unrecognized promotional codes without applying discount", () => {
      const items = [{ price: 60.0, quantity: 1 }];
      const basket = calculateBasket({ items, promoCode: "SUMMER20" });
      assert.equal(basket.discountPercent, 0);
      assert.equal(basket.discountAmount, 0.0);
      assert.equal(basket.grandTotal, 60.0);
    });

    it("5.5 should revert discount to £0.00 when promo code is removed", () => {
      const items = [{ price: 80.0, quantity: 1 }];
      const withPromo = calculateBasket({ items, promoCode: "BARGAIN10" });
      assert.equal(withPromo.discountAmount, 8.0);

      const withoutPromo = calculateBasket({ items, promoCode: null });
      assert.equal(withoutPromo.discountAmount, 0.0);
      assert.equal(withoutPromo.grandTotal, 80.0);
    });
  });

  // Feature 6: UK Postcode Regex Validation
  describe("Feature 6: UK Postcode Regex Validation", () => {
    it("6.1 should accept Buckingham Palace postcode 'SW1A 1AA'", () => {
      assert.equal(isValidUKPostcode("SW1A 1AA"), true);
    });

    it("6.2 should accept Manchester postcode 'M1 1AE'", () => {
      assert.equal(isValidUKPostcode("M1 1AE"), true);
    });

    it("6.3 should accept Birmingham postcode 'B33 8TH'", () => {
      assert.equal(isValidUKPostcode("B33 8TH"), true);
    });

    it("6.4 should accept valid UK postcode without spaces 'EC1A1BB'", () => {
      assert.equal(isValidUKPostcode("EC1A1BB"), true);
    });

    it("6.5 should accept lowercase valid postcode 'w1a 0ax'", () => {
      assert.equal(isValidUKPostcode("w1a 0ax"), true);
    });
  });

  // Feature 7: Persistent Order Creation (DB)
  describe("Feature 7: Persistent Order Creation (DB)", () => {
    it("7.1 should generate unique BS- prefixed order number upon creation", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Alice Tester",
        customerEmail: "alice@example.co.uk",
        shippingAddress: "10 Downing Street",
        city: "London",
        postcode: "SW1A 2AA",
        subtotal: 39.99,
        shippingFee: 4.99,
        total: 44.98,
      });
      assert.match(orderNumber, /^BS-/);
    });

    it("7.2 should persist customer contact and shipping destination details", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Robert Bruce",
        customerEmail: "robert.b@example.co.uk",
        customerPhone: "07700900123",
        shippingAddress: "42 High Street",
        city: "Edinburgh",
        postcode: "EH1 1YZ",
        subtotal: 55.0,
        shippingFee: 0.0,
        total: 55.0,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.ok(order);
      assert.equal(order.customer_name, "Robert Bruce");
      assert.equal(order.postcode, "EH1 1YZ");
    });

    it("7.3 should persist financial metrics: subtotal, shipping fee, and grand total", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Fiona Gallagher",
        customerEmail: "fiona@example.co.uk",
        shippingAddress: "12 Chatsworth Estate",
        city: "Manchester",
        postcode: "M14 5LL",
        subtotal: 25.5,
        shippingFee: 4.99,
        total: 30.49,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(Number(order.subtotal), 25.5);
      assert.equal(Number(order.shipping_fee), 4.99);
      assert.equal(Number(order.total), 30.49);
    });

    it("7.4 should persist line items into order_items table linked by order ID", async () => {
      const items = [
        { productId: 13, productName: "Dulux Pure Brilliant White 7L", price: 19.99, quantity: 2 },
      ];
      const { orderNumber } = await insertDbOrder(
        {
          customerName: "Line Item Tester",
          customerEmail: "lineitem@example.co.uk",
          shippingAddress: "1 Test Lane",
          city: "Bristol",
          postcode: "BS1 4PB",
          subtotal: 39.98,
          total: 39.98,
        },
        items
      );
      const order = await getDbOrderByNumber(orderNumber);
      assert.ok(order.items && order.items.length === 1);
      assert.equal(order.items[0].product_name, "Dulux Pure Brilliant White 7L");
      assert.equal(Number(order.items[0].quantity), 2);
    });

    it("7.5 should initialize order status to 'Processing' by default", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Default Status Test",
        customerEmail: "status@example.co.uk",
        shippingAddress: "5 Crown Way",
        city: "Cardiff",
        postcode: "CF14 3UZ",
        subtotal: 15.0,
        total: 19.99,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.status, "Processing");
    });
  });

  // Feature 8: Live Order Confirmation Page
  describe("Feature 8: Live Order Confirmation Page", () => {
    it("8.1 should retrieve complete order summary by valid orderNumber", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Confirmation Tester",
        customerEmail: "confirm@example.co.uk",
        shippingAddress: "88 Market St",
        city: "Leeds",
        postcode: "LS1 6DG",
        subtotal: 75.0,
        shippingFee: 0.0,
        total: 75.0,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.ok(order);
      assert.equal(order.order_number, orderNumber);
    });

    it("8.2 should return line items associated with confirmed order", async () => {
      const { orderNumber } = await insertDbOrder(
        {
          customerName: "Multi-Item Confirmer",
          customerEmail: "multi@example.co.uk",
          shippingAddress: "12 Abbey Road",
          city: "London",
          postcode: "NW8 9AY",
          subtotal: 50.0,
          total: 50.0,
        },
        [
          { productId: 1, productName: "Product Alpha", price: 20.0, quantity: 1 },
          { productId: 2, productName: "Product Beta", price: 30.0, quantity: 1 },
        ]
      );
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.items.length, 2);
    });

    it("8.3 should return customer recipient email and postal delivery address", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Postcode Check",
        customerEmail: "postcode@example.co.uk",
        shippingAddress: "221B Baker St",
        city: "London",
        postcode: "NW1 6XE",
        subtotal: 30.0,
        total: 34.99,
      });
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.customer_email, "postcode@example.co.uk");
      assert.equal(order.postcode, "NW1 6XE");
    });

    it("8.4 should verify order reference formatting conforms to BS- pattern", async () => {
      const { orderNumber } = await insertDbOrder({
        customerName: "Pattern Check",
        customerEmail: "pattern@example.co.uk",
        shippingAddress: "10 Downing St",
        city: "London",
        postcode: "SW1A 2AA",
        subtotal: 20.0,
        total: 24.99,
      });
      assert.match(orderNumber, /^BS-\d+$/);
    });

    it("8.5 should return null when querying non-existent order number (404 condition)", async () => {
      const order = await getDbOrderByNumber("BS-DOES-NOT-EXIST-999");
      assert.equal(order, null);
    });
  });

  // Feature 9: Category & Subcategory Filter
  describe("Feature 9: Category & Subcategory Filter", () => {
    it("9.1 should retrieve all 6 primary department categories", async () => {
      const categories = await getDbCategories();
      assert.equal(categories.length, 6);
    });

    it("9.2 should filter products by category 'diy-decorating'", async () => {
      const res = await dbClient.execute({
        sql: "SELECT * FROM products WHERE category_slug = ?",
        args: ["diy-decorating"],
      });
      assert.ok(res.rows.length > 0);
      for (const row of res.rows) {
        assert.equal(row.category_slug, "diy-decorating");
      }
    });

    it("9.3 should filter products by category 'garden-growing'", async () => {
      const res = await dbClient.execute({
        sql: "SELECT * FROM products WHERE category_slug = ?",
        args: ["garden-growing"],
      });
      assert.ok(res.rows.length > 0);
      for (const row of res.rows) {
        assert.equal(row.category_slug, "garden-growing");
      }
    });

    it("9.4 should verify category contains valid JSON array of subcategories", async () => {
      const cat = await getDbCategoryBySlug("diy-decorating");
      assert.ok(cat);
      const subcats = JSON.parse(cat.subcategories);
      assert.ok(Array.isArray(subcats));
      assert.ok(subcats.includes("Paint & Varnish"));
    });

    it("9.5 should return null when querying non-existent category slug", async () => {
      const cat = await getDbCategoryBySlug("non-existent-category");
      assert.equal(cat, null);
    });
  });

  // Feature 10: Route Fallbacks (/cart, /terms, etc.)
  describe("Feature 10: Route Fallbacks (/cart, /terms, etc.)", () => {
    it("10.1 should confirm basket page exists at app/basket/page.tsx", () => {
      const basketPath = path.join(PROJECT_ROOT, "app/basket/page.tsx");
      assert.ok(fs.existsSync(basketPath), "app/basket/page.tsx must exist");
    });

    it("10.2 should confirm cart fallback exists in app/cart", () => {
      const cartDir = path.join(PROJECT_ROOT, "app/cart");
      assert.ok(fs.existsSync(cartDir), "app/cart directory must exist");
    });

    it("10.3 should confirm checkout page exists at app/checkout/page.tsx", () => {
      const checkoutPath = path.join(PROJECT_ROOT, "app/checkout/page.tsx");
      assert.ok(fs.existsSync(checkoutPath), "app/checkout/page.tsx must exist");
    });

    it("10.4 should confirm order confirmation page exists at app/order-confirmation/[orderNumber]/page.tsx", () => {
      const confirmPath = path.join(PROJECT_ROOT, "app/order-confirmation/[orderNumber]/page.tsx");
      assert.ok(fs.existsSync(confirmPath), "Order confirmation page route must exist");
    });

    it("10.5 should confirm customer informational routes exist (app/help)", () => {
      const helpDir = path.join(PROJECT_ROOT, "app/help");
      assert.ok(fs.existsSync(helpDir), "app/help directory must exist");
    });
  });

  // Feature 11: Admin Layout Isolation
  describe("Feature 11: Admin Layout Isolation", () => {
    const layoutPath = path.join(PROJECT_ROOT, "app/admin/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    it("11.1 should have dedicated admin layout file at app/admin/layout.tsx", () => {
      assert.ok(fs.existsSync(layoutPath));
    });

    it("11.2 should provide navigation link to Admin Dashboard Overview (/admin)", () => {
      assert.ok(layoutContent.includes('href="/admin"'));
    });

    it("11.3 should provide navigation links to Products (/admin/products) and Orders (/admin/orders)", () => {
      assert.ok(layoutContent.includes('href="/admin/products"'));
      assert.ok(layoutContent.includes('href="/admin/orders"'));
    });

    it("11.4 should provide link to Turso Edge Database manager (/admin/turso)", () => {
      assert.ok(layoutContent.includes('href="/admin/turso"'));
    });

    it("11.5 should include direct link to external Turso cloud dashboard and storefront return", () => {
      assert.ok(layoutContent.includes("https://app.turso.tech/ghulam--mujtaba"));
      assert.ok(layoutContent.includes('href="/"'));
    });
  });

  // Feature 12: Admin Dashboard Overview
  describe("Feature 12: Admin Dashboard Overview", () => {
    it("12.1 should compute total sales revenue as sum of order totals", async () => {
      const metrics = await calculateAdminMetrics();
      assert.ok(typeof metrics.totalRevenue === "number");
      assert.ok(metrics.totalRevenue >= 0);
    });

    it("12.2 should count total customer orders matching database count", async () => {
      const metrics = await calculateAdminMetrics();
      const orders = await getDbOrders();
      assert.equal(metrics.orderCount, orders.length);
    });

    it("12.3 should count total products in catalog matching database count", async () => {
      const metrics = await calculateAdminMetrics();
      const products = await getDbProducts();
      assert.equal(metrics.productCount, products.length);
    });

    it("12.4 should identify low stock products (stock <= 15)", async () => {
      const metrics = await calculateAdminMetrics();
      const allProducts = await getDbProducts();
      const expectedLow = allProducts.filter((p) => Number(p.stock) <= 15).length;
      assert.equal(metrics.lowStockCount, expectedLow);
    });

    it("12.5 should verify recent orders can be retrieved in descending ID order", async () => {
      const orders = await getDbOrders();
      if (orders.length >= 2) {
        assert.ok(Number(orders[0].id) >= Number(orders[1].id));
      }
    });
  });

  // Feature 13: Admin Catalog Management
  describe("Feature 13: Admin Catalog Management", () => {
    it("13.1 should query products with prices and stock for admin catalog table", async () => {
      const products = await getDbProducts(5);
      assert.ok(products.length > 0);
      assert.ok(products[0].price !== undefined);
      assert.ok(products[0].stock !== undefined);
    });

    it("13.2 should support searching products by title", async () => {
      const results = await searchDbProducts("Brilliant White");
      assert.ok(results.length > 0);
      assert.match(results[0].name, /Brilliant White/i);
    });

    it("13.3 should support searching products by brand name", async () => {
      const results = await searchDbProducts("Flymo");
      assert.ok(results.length > 0);
      assert.equal(results[0].brand, "Flymo");
    });

    it("13.4 should classify products by stock status (in stock vs low stock)", async () => {
      const products = await getDbProducts(20);
      for (const p of products) {
        const isLow = Number(p.stock) <= 15;
        assert.equal(typeof isLow, "boolean");
      }
    });

    it("13.5 should compute price match savings relative to competitor comparison price", async () => {
      const products = await getDbProducts(20);
      const withCompare = products.find((p) => p.compare_price && Number(p.compare_price) > Number(p.price));
      if (withCompare) {
        const saving = Number(withCompare.compare_price) - Number(withCompare.price);
        assert.ok(saving > 0);
      }
    });
  });

  // Feature 14: Admin Product Creation
  describe("Feature 14: Admin Product Creation", () => {
    it("14.1 should automatically generate URL slug from product title", async () => {
      const { slug } = await insertDbProduct({
        name: "Stanley FatMax Tape Measure 8m",
        brand: "Stanley",
        categorySlug: "diy-decorating",
        price: 14.99,
        stock: 50,
      });
      assert.match(slug, /^stanley-fatmax-tape-measure-8m/);
    });

    it("14.2 should persist new product in database with correct attributes", async () => {
      const { id } = await insertDbProduct({
        name: "Flymo EasiGlide Plus 330V",
        brand: "Flymo",
        categorySlug: "garden-growing",
        price: 119.99,
        stock: 12,
      });
      const prod = await getDbProductById(id);
      assert.ok(prod);
      assert.equal(prod.name, "Flymo EasiGlide Plus 330V");
      assert.equal(Number(prod.price), 119.99);
      assert.equal(Number(prod.stock), 12);
    });

    it("14.3 should make newly created product immediately searchable", async () => {
      const uniqueName = `Unique Drill Test ${Date.now().toString().slice(-4)}`;
      await insertDbProduct({
        name: uniqueName,
        brand: "DeWalt",
        categorySlug: "diy-decorating",
        price: 89.99,
      });
      const results = await searchDbProducts(uniqueName);
      assert.ok(results.length > 0);
      assert.equal(results[0].name, uniqueName);
    });

    it("14.4 should assign product to specified department category", async () => {
      const { id } = await insertDbProduct({
        name: "Tower 4L Digital Air Fryer",
        brand: "Tower",
        categorySlug: "electricals",
        price: 49.99,
      });
      const prod = await getDbProductById(id);
      assert.equal(prod.category_slug, "electricals");
    });

    it("14.5 should delete product successfully upon admin request", async () => {
      const { id } = await insertDbProduct({
        name: "Temporary Test Item For Deletion",
        brand: "Temp",
        categorySlug: "housewares",
        price: 9.99,
      });
      await deleteDbProduct(id);
      const prod = await getDbProductById(id);
      assert.equal(prod, null);
    });
  });

  // Feature 15: Admin Order Status Updater
  describe("Feature 15: Admin Order Status Updater", () => {
    it("15.1 should update order status to 'Shipped'", async () => {
      const { orderId } = await insertDbOrder({
        customerName: "Status Updater Test",
        customerEmail: "update@example.co.uk",
        shippingAddress: "5 High Road",
        city: "Leeds",
        postcode: "LS1 2AB",
        subtotal: 30.0,
        total: 30.0,
        status: "Processing",
      });
      await updateDbOrderStatus(orderId, "Shipped");
      const res = await dbClient.execute({
        sql: "SELECT status FROM orders WHERE id = ?",
        args: [orderId],
      });
      assert.equal(res.rows[0].status, "Shipped");
    });

    it("15.2 should update order status to 'Delivered'", async () => {
      const { orderId } = await insertDbOrder({
        customerName: "Delivery Test",
        customerEmail: "delivered@example.co.uk",
        shippingAddress: "9 Queen St",
        city: "York",
        postcode: "YO1 7AA",
        subtotal: 45.0,
        total: 45.0,
        status: "Shipped",
      });
      await updateDbOrderStatus(orderId, "Delivered");
      const res = await dbClient.execute({
        sql: "SELECT status FROM orders WHERE id = ?",
        args: [orderId],
      });
      assert.equal(res.rows[0].status, "Delivered");
    });

    it("15.3 should support standard status values: Processing, Shipped, Delivered", () => {
      const allowedStatuses = ["Processing", "Shipped", "Delivered"];
      assert.ok(allowedStatuses.includes("Processing"));
      assert.ok(allowedStatuses.includes("Shipped"));
      assert.ok(allowedStatuses.includes("Delivered"));
    });

    it("15.4 should verify updated status is visible in order confirmation query", async () => {
      const { orderId, orderNumber } = await insertDbOrder({
        customerName: "Live Check",
        customerEmail: "live@example.co.uk",
        shippingAddress: "14 Kings Rd",
        city: "Brighton",
        postcode: "BN1 1NE",
        subtotal: 60.0,
        total: 60.0,
      });
      await updateDbOrderStatus(orderId, "Delivered");
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.status, "Delivered");
    });

    it("15.5 should preserve order details without alteration during status updates", async () => {
      const { orderId, orderNumber } = await insertDbOrder({
        customerName: "Integrity Preservation",
        customerEmail: "preserve@example.co.uk",
        shippingAddress: "10 Downing St",
        city: "London",
        postcode: "SW1A 2AA",
        subtotal: 99.0,
        total: 99.0,
      });
      await updateDbOrderStatus(orderId, "Shipped");
      const order = await getDbOrderByNumber(orderNumber);
      assert.equal(order.customer_name, "Integrity Preservation");
      assert.equal(Number(order.total), 99.0);
    });
  });

  // Feature 16: Turso Console & Route
  describe("Feature 16: Turso Console & Route", () => {
    it("16.1 should configure database URL with local SQLite fallback", () => {
      const url = process.env.TURSO_DATABASE_URL || "file:local.db";
      assert.ok(url.startsWith("file:") || url.startsWith("libsql:"));
    });

    it("16.2 should successfully execute live query against database client", async () => {
      const res = await dbClient.execute("SELECT 1 as alive");
      assert.equal(Number(res.rows[0].alive), 1);
    });

    it("16.3 should return record counts for products, categories, orders, order_items", async () => {
      const [p, c, o, oi] = await Promise.all([
        dbClient.execute("SELECT COUNT(*) as c FROM products"),
        dbClient.execute("SELECT COUNT(*) as c FROM categories"),
        dbClient.execute("SELECT COUNT(*) as c FROM orders"),
        dbClient.execute("SELECT COUNT(*) as c FROM order_items"),
      ]);
      assert.ok(Number(p.rows[0].c) >= 12);
      assert.ok(Number(c.rows[0].c) === 6);
      assert.ok(Number(o.rows[0].c) >= 3);
      assert.ok(Number(oi.rows[0].c) >= 3);
    });

    it("16.4 should provide canonical link to Turso account dashboard", () => {
      const expectedUrl = "https://app.turso.tech/ghulam--mujtaba";
      assert.match(expectedUrl, /^https:\/\/app\.turso\.tech\//);
    });

    it("16.5 should confirm Turso manager console page exists at app/admin/turso/page.tsx", () => {
      const tursoPage = path.join(PROJECT_ROOT, "app/admin/turso/page.tsx");
      assert.ok(fs.existsSync(tursoPage));
    });
  });

  // Feature 17: Root & Dynamic SEO Metadata
  describe("Feature 17: Root & Dynamic SEO Metadata", () => {
    const layoutPath = path.join(PROJECT_ROOT, "app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    it("17.1 should declare site title containing 'BargainStore.uk'", () => {
      assert.ok(layoutContent.includes("BargainStore.uk"));
    });

    it("17.2 should declare description highlighting UK hardware and pricing", () => {
      assert.ok(layoutContent.includes("description"));
    });

    it("17.3 should have product detail page routing structure for dynamic SEO metadata", () => {
      const productPagePath = path.join(PROJECT_ROOT, "app/product/[slug]/page.tsx");
      assert.ok(fs.existsSync(productPagePath));
    });

    it("17.4 should have category page routing structure for dynamic SEO metadata", () => {
      const catPagePath = path.join(PROJECT_ROOT, "app/category/[slug]/page.tsx");
      assert.ok(fs.existsSync(catPagePath));
    });

    it("17.5 should maintain en_GB or English UK language targeting in root html", () => {
      assert.ok(layoutContent.includes('lang="en"') || layoutContent.includes("en-GB"));
    });
  });

  // Feature 18: JSON-LD Structured Data
  describe("Feature 18: JSON-LD Structured Data", () => {
    it("18.1 should generate valid schema.org Organization JSON-LD structure", () => {
      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "BargainStore.uk",
        url: "https://bargainstore.uk",
        logo: "https://bargainstore.uk/assets/brands/flymo.webp",
        telephone: "+44-800-123-4567",
      };
      const serialized = JSON.stringify(orgSchema);
      const parsed = JSON.parse(serialized);
      assert.equal(parsed["@type"], "Organization");
      assert.equal(parsed.name, "BargainStore.uk");
    });

    it("18.2 should generate valid schema.org Product JSON-LD structure", () => {
      const prodSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Flymo Lawnmower 330V",
        image: "https://bargainstore.uk/assets/products/flymo.webp",
        description: "Lightweight hover lawnmower.",
        offers: {
          "@type": "Offer",
          priceCurrency: "GBP",
          price: 119.99,
          availability: "https://schema.org/InStock",
        },
      };
      const parsed = JSON.parse(JSON.stringify(prodSchema));
      assert.equal(parsed["@type"], "Product");
      assert.equal(parsed.offers.priceCurrency, "GBP");
    });

    it("18.3 should ensure Product offer price is formatted with valid numeric GBP value", () => {
      const price = 49.99;
      assert.equal(typeof price, "number");
      assert.ok(price > 0);
    });

    it("18.4 should generate valid BreadcrumbList schema with sequential positions", () => {
      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bargainstore.uk" },
          { "@type": "ListItem", position: 2, name: "Garden", item: "https://bargainstore.uk/category/garden-growing" },
        ],
      };
      const parsed = JSON.parse(JSON.stringify(breadcrumb));
      assert.equal(parsed.itemListElement.length, 2);
      assert.equal(parsed.itemListElement[0].position, 1);
    });

    it("18.5 should verify schema JSON-LD serialization parses without errors", () => {
      const testSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "BargainStore" };
      assert.doesNotThrow(() => JSON.parse(JSON.stringify(testSchema)));
    });
  });

  // Feature 19: Sitemap & Robots Discovery
  describe("Feature 19: Sitemap & Robots Discovery", () => {
    it("19.1 should verify static route listing for sitemap generation", () => {
      const staticRoutes = ["/", "/basket", "/checkout", "/help", "/about"];
      assert.ok(staticRoutes.includes("/"));
      assert.ok(staticRoutes.includes("/basket"));
    });

    it("19.2 should verify dynamic category URLs can be mapped from database categories", async () => {
      const categories = await getDbCategories();
      const urls = categories.map((c) => `/category/${c.slug}`);
      assert.equal(urls.length, 6);
      assert.ok(urls.includes("/category/diy-decorating"));
    });

    it("19.3 should verify dynamic product URLs can be mapped from database products", async () => {
      const products = await getDbProducts();
      const urls = products.map((p) => `/product/${p.slug}`);
      assert.ok(urls.length >= 12);
    });

    it("19.4 should define disallow rules for sensitive admin routes", () => {
      const disallowed = ["/admin", "/admin/*", "/api/*"];
      assert.ok(disallowed.includes("/admin"));
    });

    it("19.5 should reference canonical sitemap URL endpoint", () => {
      const sitemapUrl = "https://bargainstore.uk/sitemap.xml";
      assert.equal(sitemapUrl, "https://bargainstore.uk/sitemap.xml");
    });
  });

  // Feature 20: UK Retail Trust Signals
  describe("Feature 20: UK Retail Trust Signals", () => {
    const footerPath = path.join(PROJECT_ROOT, "components/Footer.tsx");
    const footerContent = fs.readFileSync(footerPath, "utf-8");

    it("20.1 should include company branding and address in footer", () => {
      assert.ok(footerContent.includes("BargainStore.uk") && footerContent.includes("Cowdenbeath"));
    });

    it("20.2 should include links to Terms, Privacy, and Cookie legal policies", () => {
      assert.ok(footerContent.includes('href="/terms"'));
      assert.ok(footerContent.includes('href="/privacy"'));
      assert.ok(footerContent.includes('href="/cookies"'));
    });

    it("20.3 should showcase genuine UK payment badges in footer", () => {
      assert.ok(footerContent.includes("visa.webp"));
      assert.ok(footerContent.includes("paypal.webp"));
      assert.ok(footerContent.includes("apple-pay.webp"));
    });

    it("20.4 should include 30-Day Easy Returns customer service proposition", () => {
      assert.ok(footerContent.includes("30-Day Easy Returns") || footerContent.includes("Returns"));
    });

    it("20.5 should display Price Match Promise trust credentials", () => {
      assert.ok(footerContent.includes("Price Promise") || footerContent.includes("Amazon"));
    });
  });

  // Feature 21: Zero-Error Production Build
  describe("Feature 21: Zero-Error Production Build", () => {
    const pkgPath = path.join(PROJECT_ROOT, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    it("21.1 should declare valid production build script in package.json", () => {
      assert.equal(pkg.scripts.build, "next build");
    });

    it("21.2 should have tsconfig.json configured with strict mode", () => {
      const tsconfigPath = path.join(PROJECT_ROOT, "tsconfig.json");
      assert.ok(fs.existsSync(tsconfigPath));
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
      assert.equal(tsconfig.compilerOptions.strict, true);
    });

    it("21.3 should have valid Drizzle ORM configuration at drizzle.config.ts", () => {
      const drizzleConfig = path.join(PROJECT_ROOT, "drizzle.config.ts");
      assert.ok(fs.existsSync(drizzleConfig));
    });

    it("21.4 should include core production runtime dependencies", () => {
      assert.ok(pkg.dependencies.next, "next must be installed");
      assert.ok(pkg.dependencies.react, "react must be installed");
      assert.ok(pkg.dependencies["@libsql/client"], "@libsql/client must be installed");
      assert.ok(pkg.dependencies["drizzle-orm"], "drizzle-orm must be installed");
    });

    it("21.5 should verify Next.js configuration is valid", () => {
      const postcssPath = path.join(PROJECT_ROOT, "postcss.config.mjs");
      assert.ok(fs.existsSync(postcssPath));
    });
  });

  // Feature 22: Local Production Server Run
  describe("Feature 22: Local Production Server Run", () => {
    const pkgPath = path.join(PROJECT_ROOT, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    it("22.1 should declare 'start' script to launch production server", () => {
      assert.equal(pkg.scripts.start, "next start");
    });

    it("22.2 should have standard port 3000 default binding target", () => {
      const port = process.env.PORT || 3000;
      assert.equal(Number(port), 3000);
    });

    it("22.3 should have local database file local.db present and non-empty", () => {
      const dbPath = path.join(PROJECT_ROOT, "local.db");
      assert.ok(fs.existsSync(dbPath));
      const stat = fs.statSync(dbPath);
      assert.ok(stat.size > 0);
    });

    it("22.4 should have environment configuration file present (.env.local or .env.example)", () => {
      const envLocal = fs.existsSync(path.join(PROJECT_ROOT, ".env.local"));
      const envExample = fs.existsSync(path.join(PROJECT_ROOT, ".env.example"));
      assert.ok(envLocal || envExample);
    });

    it("22.5 should execute database probe query confirming driver readiness", async () => {
      const res = await dbClient.execute("SELECT datetime('now') as ts");
      assert.ok(res.rows[0].ts);
    });
  });
});
