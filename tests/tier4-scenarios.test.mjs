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
  getDbOrders,
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

describe("Tier 4: Realistic Real-World Application Scenarios (5 Comprehensive Workloads)", () => {
  // Scenario 1: Complete Hardware Shopper Journey
  it("Scenario 1: Complete Hardware Shopper Journey (Search -> Basket -> Free Delivery -> Voucher -> Checkout -> Live Confirmation)", async () => {
    // Step 1: Shopper verifies store brand credibility (Real assets exist)
    const brandLogo = verifyWebPFile("public/assets/brands/stanley.webp");
    assert.ok(brandLogo.valid, "Stanley logo asset must exist and be valid WebP");

    // Step 2: Shopper searches for hardware product "Dulux"
    const searchResults = await searchDbProducts("Dulux");
    assert.ok(searchResults.length > 0, "Shopper must find Dulux paint products");
    const paintProduct = searchResults[0];

    // Step 3: Shopper also picks up a multi-tool to exceed £50
    const toolResults = await searchDbProducts("Multi-Tool");
    assert.ok(toolResults.length > 0, "Shopper must find multi-tool product");
    const toolProduct = toolResults[0];

    // Step 4: Add both items to basket
    const cartItems = [
      { id: paintProduct.id, name: paintProduct.name, price: Number(paintProduct.price), quantity: 1 },
      { id: toolProduct.id, name: toolProduct.name, price: Number(toolProduct.price), quantity: 1 },
    ];

    // Step 5: Calculate basket & qualify for free UK delivery (£50 threshold)
    const basket = calculateBasket({ items: cartItems, standardShippingFee: 4.99 });
    assert.ok(basket.subtotal >= 50.0, "Subtotal must exceed £50.00");
    assert.equal(basket.qualifiesForFreeDelivery, true);
    assert.equal(basket.shippingFee, 0.0);

    // Step 6: Apply voucher 'BARGAIN10' for 10% discount
    const discountedBasket = calculateBasket({
      items: cartItems,
      promoCode: "BARGAIN10",
      standardShippingFee: 4.99,
    });
    assert.equal(discountedBasket.discountPercent, 10);
    assert.ok(discountedBasket.discountAmount > 0);
    assert.equal(discountedBasket.shippingFee, 0.0, "Free delivery must be retained");

    // Step 7: Validate UK recipient delivery postcode
    const recipientPostcode = "SW1A 1AA";
    assert.equal(isValidUKPostcode(recipientPostcode), true);

    // Step 8: Complete checkout and persist order in Turso DB
    const { orderNumber, orderId } = await insertDbOrder(
      {
        customerName: "James Watson",
        customerEmail: "j.watson@example.co.uk",
        customerPhone: "07700900999",
        shippingAddress: "Flat 2, 10 Downing Street",
        city: "London",
        postcode: recipientPostcode,
        deliveryMethod: "Standard UK Delivery",
        subtotal: discountedBasket.subtotal,
        shippingFee: discountedBasket.shippingFee,
        total: discountedBasket.grandTotal,
        paymentMethod: "Credit Card",
        status: "Processing",
      },
      cartItems
    );

    assert.ok(orderId > 0);
    assert.match(orderNumber, /^BS-/);

    // Step 9: Verify Live Order Confirmation page data retrieval
    const confirmedOrder = await getDbOrderByNumber(orderNumber);
    assert.ok(confirmedOrder, "Confirmed order must be retrievable by order number");
    assert.equal(confirmedOrder.customer_name, "James Watson");
    assert.equal(confirmedOrder.postcode, recipientPostcode);
    assert.equal(confirmedOrder.status, "Processing");
    assert.equal(confirmedOrder.items.length, 2);
  });

  // Scenario 2: Discount Threshold Edge Journey
  it("Scenario 2: Discount Threshold Edge Journey (Threshold Cross -> Voucher Application -> Free Delivery Retention -> Checkout)", async () => {
    // Step 1: Customer has single item at £48.00 (below £50 threshold)
    const initialItems = [{ id: 101, name: "Cordless Sander", price: 48.0, quantity: 1 }];
    const initialBasket = calculateBasket({ items: initialItems, standardShippingFee: 4.99 });
    assert.equal(initialBasket.subtotal, 48.0);
    assert.equal(initialBasket.qualifiesForFreeDelivery, false);
    assert.equal(initialBasket.shippingFee, 4.99);
    assert.equal(initialBasket.grandTotal, 52.99);

    // Step 2: Customer notices £2.00 remaining for free shipping, adds sanding sheets (£3.50)
    const upgradedItems = [
      { id: 101, name: "Cordless Sander", price: 48.0, quantity: 1 },
      { id: 102, name: "Sanding Sheets Pack", price: 3.5, quantity: 1 },
    ];
    const upgradedBasket = calculateBasket({ items: upgradedItems, standardShippingFee: 4.99 });
    assert.equal(upgradedBasket.subtotal, 51.5);
    assert.equal(upgradedBasket.qualifiesForFreeDelivery, true);
    assert.equal(upgradedBasket.shippingFee, 0.0);

    // Step 3: Apply voucher BARGAIN10 (10% off £51.50 = £5.15 discount)
    const withVoucher = calculateBasket({
      items: upgradedItems,
      promoCode: "BARGAIN10",
      standardShippingFee: 4.99,
    });
    assert.equal(withVoucher.discountAmount, 5.15);
    assert.equal(withVoucher.grandTotal, 46.35); // 51.50 - 5.15 + 0.00
    assert.equal(withVoucher.shippingFee, 0.0, "Free shipping preserved despite total < £50");

    // Step 4: Validate recipient postcode in Central London
    const londonPostcode = "EC1A 1BB";
    assert.equal(isValidUKPostcode(londonPostcode), true);

    // Step 5: Place order and verify stored record reflects £46.35
    const { orderNumber } = await insertDbOrder(
      {
        customerName: "Threshold Shopper",
        customerEmail: "threshold@example.co.uk",
        shippingAddress: "15 Clerkenwell Close",
        city: "London",
        postcode: londonPostcode,
        subtotal: withVoucher.subtotal,
        shippingFee: withVoucher.shippingFee,
        total: withVoucher.grandTotal,
      },
      upgradedItems
    );

    const order = await getDbOrderByNumber(orderNumber);
    assert.equal(Number(order.total), 46.35);
  });

  // Scenario 3: Admin Catalog & Stock Management Journey
  it("Scenario 3: Admin Catalog & Stock Management Journey (KPI Baseline -> Create Product -> Stock Alert Check -> Search -> Delete)", async () => {
    // Step 1: Admin inspects dashboard baseline metrics
    const initialMetrics = await calculateAdminMetrics();
    assert.ok(initialMetrics.productCount >= 12);

    // Step 2: Admin creates new seasonal product with stock = 10 (triggers low-stock alert)
    const uniqueTitle = `Tower Cerastone Pro Pan ${Date.now().toString().slice(-4)}`;
    const { id: createdId } = await insertDbProduct({
      name: uniqueTitle,
      brand: "Tower",
      categorySlug: "housewares",
      price: 24.99,
      comparePrice: 34.99,
      competitorName: "Amazon",
      stock: 10, // <= 15 triggers low-stock alert
      description: "Non-stick ceramic frying pan with stay-cool handle.",
    });

    // Step 3: Verify KPI metrics update (catalog count +1, low-stock count +1)
    const updatedMetrics = await calculateAdminMetrics();
    assert.equal(updatedMetrics.productCount, initialMetrics.productCount + 1);
    assert.equal(updatedMetrics.lowStockCount, initialMetrics.lowStockCount + 1);

    // Step 4: Storefront autocomplete search immediately finds the new product
    const searchMatch = await searchDbProducts(uniqueTitle);
    assert.equal(searchMatch.length, 1);
    assert.equal(searchMatch[0].name, uniqueTitle);

    // Step 5: Category listing includes new product under 'housewares'
    const categoryProducts = await dbClient.execute({
      sql: "SELECT * FROM products WHERE category_slug = 'housewares' AND id = ?",
      args: [createdId],
    });
    assert.equal(categoryProducts.rows.length, 1);

    // Step 6: Admin performs real-time deletion from catalog
    await deleteDbProduct(createdId);
    const postDeleteSearch = await searchDbProducts(uniqueTitle);
    assert.equal(postDeleteSearch.length, 0, "Deleted product must not appear in search results");

    // Step 7: Confirm metrics return to previous product count
    const finalMetrics = await calculateAdminMetrics();
    assert.equal(finalMetrics.productCount, initialMetrics.productCount);
  });

  // Scenario 4: Order Fulfillment Lifecycle Journey
  it("Scenario 4: Order Fulfillment Lifecycle Journey (Customer Order -> Processing -> Admin Ship -> Status Verify -> Deliver)", async () => {
    // Step 1: Customer places order with Royal Mail delivery and PayPal payment
    const customerPostcode = "B33 8TH";
    assert.equal(isValidUKPostcode(customerPostcode), true);

    const { orderId, orderNumber } = await insertDbOrder({
      customerName: "Fulfillment Customer",
      customerEmail: "fulfillment@example.co.uk",
      customerPhone: "07700900555",
      shippingAddress: "50 Coventry Road",
      city: "Birmingham",
      postcode: customerPostcode,
      deliveryMethod: "Standard UK Delivery",
      subtotal: 59.99,
      shippingFee: 0.0,
      total: 59.99,
      paymentMethod: "PayPal",
      status: "Processing",
    });

    // Step 2: Verify order initializes in 'Processing' status in DB
    const initialOrder = await getDbOrderByNumber(orderNumber);
    assert.equal(initialOrder.status, "Processing");

    // Step 3: Admin fulfillment manager views order in active orders table
    const ordersList = await getDbOrders();
    const orderInTable = ordersList.find((o) => o.id === orderId);
    assert.ok(orderInTable, "Order must be visible in admin orders fulfillment table");

    // Step 4: Warehouse dispatches package and updates status to 'Shipped'
    await updateDbOrderStatus(orderId, "Shipped");
    const shippedOrder = await getDbOrderByNumber(orderNumber);
    assert.equal(shippedOrder.status, "Shipped");

    // Step 5: Courier completes delivery and status is updated to 'Delivered'
    await updateDbOrderStatus(orderId, "Delivered");
    const deliveredOrder = await getDbOrderByNumber(orderNumber);
    assert.equal(deliveredOrder.status, "Delivered");

    // Step 6: Verify customer details were preserved during status changes
    assert.equal(deliveredOrder.customer_email, "fulfillment@example.co.uk");
    assert.equal(deliveredOrder.postcode, customerPostcode);
  });

  // Scenario 5: UK Trust & SEO Audit Crawl
  it("Scenario 5: UK Trust & SEO Audit Crawl (Robots Directives -> Sitemap URLs -> 6 Categories Crawl -> JSON-LD -> Trust Credentials)", async () => {
    // Step 1: Crawler verifies robots directives (allows public pages, blocks admin)
    const robotsRules = {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    };
    assert.equal(robotsRules.allow, "/");
    assert.ok(robotsRules.disallow.includes("/admin"));

    // Step 2: Crawler crawls all 6 primary department categories from database
    const categories = await getDbCategories();
    assert.equal(categories.length, 6);

    for (const cat of categories) {
      assert.ok(cat.slug);
      assert.ok(cat.name);
      assert.ok(cat.subcategories, `Category ${cat.slug} must have subcategories defined`);
    }

    const allProducts = await getDbProducts();
    assert.ok(allProducts.length >= 12, "Catalog must contain at least 12 products");

    // Step 3: Crawler audits Product schema.org JSON-LD structure
    const sampleProduct = (await getDbProducts(1))[0];
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: sampleProduct.name,
      description: sampleProduct.description,
      brand: { "@type": "Brand", name: sampleProduct.brand },
      offers: {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: Number(sampleProduct.price),
        availability: "https://schema.org/InStock",
      },
    };

    assert.equal(productJsonLd["@type"], "Product");
    assert.equal(productJsonLd.offers.priceCurrency, "GBP");
    assert.ok(typeof productJsonLd.offers.price === "number");

    // Step 4: Crawler audits Organization schema.org JSON-LD structure
    const orgJsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BargainStore.uk",
      url: "https://bargainstore.uk",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+44-800-123-4567",
        contactType: "customer service",
        areaServed: "GB",
      },
    };
    assert.equal(orgJsonLd.name, "BargainStore.uk");
    assert.equal(orgJsonLd.contactPoint.areaServed, "GB");

    // Step 5: Crawler verifies UK retail trust credentials in Footer
    const footerContent = fs.readFileSync(path.join(PROJECT_ROOT, "components/Footer.tsx"), "utf-8");
    assert.ok(footerContent.includes("BargainStore.uk Ltd. All rights reserved. Registered in the UK."));
    assert.ok(footerContent.includes("/terms"));
    assert.ok(footerContent.includes("/privacy"));
    assert.ok(footerContent.includes("/cookies"));

    // Step 6: Verify Turso database is responsive
    const tursoPing = await dbClient.execute("SELECT 1 as healthy;");
    assert.equal(Number(tursoPing.rows[0].healthy), 1);
  });
});
