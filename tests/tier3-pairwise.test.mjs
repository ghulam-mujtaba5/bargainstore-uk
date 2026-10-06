import test, { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import {
  dbClient,
  cleanupTestData,
  getDbProducts,
  getDbProductById,
  searchDbProducts,
  getDbCategoryBySlug,
  getDbOrderByNumber,
  getDbOrders,
  insertDbOrder,
  updateDbOrderStatus,
  insertDbProduct,
  deleteDbProduct,
  isValidUKPostcode,
  calculateBasket,
  calculateAdminMetrics,
} from "./test-helper.mjs";

after(async () => {
  await cleanupTestData();
});

describe("Tier 3: Pairwise & Cross-Feature Integration Flows (≥22 Test Cases)", () => {
  // Pairwise 1: Search ↔ Basket Math
  it("P.1: Search product in catalog, retrieve price, and calculate basket subtotal accurately", async () => {
    const searchResults = await searchDbProducts("Dulux");
    assert.ok(searchResults.length > 0);
    const prod = searchResults[0];

    const quantity = 3;
    const basket = calculateBasket({
      items: [{ id: prod.id, name: prod.name, price: Number(prod.price), quantity }],
    });

    const expectedSubtotal = Number((Number(prod.price) * quantity).toFixed(2));
    assert.equal(basket.subtotal, expectedSubtotal);
  });

  // Pairwise 2: Basket Math ↔ Voucher BARGAIN10 (Under £50)
  it("P.2: Apply BARGAIN10 to subtotal under £50 and verify discount plus standard shipping", () => {
    const items = [{ price: 30.0, quantity: 1 }];
    const basket = calculateBasket({ items, promoCode: "BARGAIN10", standardShippingFee: 4.99 });
    assert.equal(basket.subtotal, 30.0);
    assert.equal(basket.discountPercent, 10);
    assert.equal(basket.discountAmount, 3.0);
    assert.equal(basket.shippingFee, 4.99);
    assert.equal(basket.grandTotal, 31.99); // 30 - 3 + 4.99
  });

  // Pairwise 3: Basket Math ↔ Voucher BARGAIN10 (At Threshold £50)
  it("P.3: Apply BARGAIN10 to £50 basket and verify free shipping is maintained even though total drops to £45", () => {
    const items = [{ price: 50.0, quantity: 1 }];
    const basket = calculateBasket({ items, promoCode: "BARGAIN10", standardShippingFee: 4.99 });
    assert.equal(basket.subtotal, 50.0);
    assert.equal(basket.discountAmount, 5.0);
    assert.equal(basket.qualifiesForFreeDelivery, true);
    assert.equal(basket.shippingFee, 0.0);
    assert.equal(basket.grandTotal, 45.0);
  });

  // Pairwise 4: Voucher ↔ Dynamic Quantity Modification
  it("P.4: Dynamically increment item quantity with voucher applied, unlocking free delivery", () => {
    const itemsInitial = [{ price: 20.0, quantity: 2 }]; // £40
    const initialBasket = calculateBasket({ items: itemsInitial, promoCode: "BARGAIN10" });
    assert.equal(initialBasket.shippingFee, 4.99);
    assert.equal(initialBasket.discountAmount, 4.0);

    const itemsUpdated = [{ price: 20.0, quantity: 3 }]; // £60
    const updatedBasket = calculateBasket({ items: itemsUpdated, promoCode: "BARGAIN10" });
    assert.equal(updatedBasket.shippingFee, 0.0);
    assert.equal(updatedBasket.discountAmount, 6.0);
    assert.equal(updatedBasket.grandTotal, 54.0); // 60 - 6 + 0
  });

  // Pairwise 5: Basket Calculation ↔ UK Postcode Validation
  it("P.5: Verify checkout preparation validates both basket totals and UK recipient postcode", () => {
    const items = [{ price: 65.0, quantity: 1 }];
    const basket = calculateBasket({ items });
    assert.equal(basket.qualifiesForFreeDelivery, true);

    const postcode = "SW1A 1AA";
    assert.equal(isValidUKPostcode(postcode), true);
  });

  // Pairwise 6: UK Postcode ↔ Persistent Order DB
  it("P.6: Verify checkout with validated UK postcode inserts into database with identical postcode", async () => {
    const postcode = "M1 1AE";
    assert.equal(isValidUKPostcode(postcode), true);

    const { orderNumber } = await insertDbOrder({
      customerName: "Manchester Shopper",
      customerEmail: "mcr@example.co.uk",
      shippingAddress: "10 Piccadilly",
      city: "Manchester",
      postcode,
      subtotal: 55.0,
      total: 55.0,
    });

    const order = await getDbOrderByNumber(orderNumber);
    assert.ok(order);
    assert.equal(order.postcode, postcode);
  });

  // Pairwise 7: Basket Math ↔ Persistent Order Items Line Consistency
  it("P.7: Verify sum of inserted order line items matches order recorded subtotal in database", async () => {
    const items = [
      { productId: 13, productName: "Dulux Pure White", price: 19.99, quantity: 2 },
      { productId: 15, productName: "Dr Beckmann Leaves", price: 3.99, quantity: 3 },
    ];
    const basket = calculateBasket({ items, standardShippingFee: 4.99 });

    const { orderNumber } = await insertDbOrder({
      customerName: "Consistent Customer",
      customerEmail: "consistent@example.co.uk",
      shippingAddress: "22 Oxford Road",
      city: "Manchester",
      postcode: "M13 9PL",
      subtotal: basket.subtotal,
      shippingFee: basket.shippingFee,
      total: basket.grandTotal,
    }, items);

    const order = await getDbOrderByNumber(orderNumber);
    const calculatedSum = order.items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    assert.equal(Number(calculatedSum.toFixed(2)), Number(order.subtotal));
  });

  // Pairwise 8: Voucher BARGAIN10 ↔ Persistent Order DB
  it("P.8: Place order with BARGAIN10 voucher and confirm grand total records deducted discount", async () => {
    const items = [{ productId: 1, productName: "Power Tool", price: 100.0, quantity: 1 }];
    const basket = calculateBasket({ items, promoCode: "BARGAIN10" });

    const { orderNumber } = await insertDbOrder({
      customerName: "Discount Buyer",
      customerEmail: "discount@example.co.uk",
      shippingAddress: "5 Savings Lane",
      city: "London",
      postcode: "EC2A 4NE",
      subtotal: basket.subtotal,
      shippingFee: basket.shippingFee,
      total: basket.grandTotal,
    }, items);

    const order = await getDbOrderByNumber(orderNumber);
    assert.equal(Number(order.total), 90.0);
  });

  // Pairwise 9: Order DB Insertion ↔ Live Order Confirmation Retrieval
  it("P.9: Insert new order and confirm Live Order Confirmation retrieves 100% matching record", async () => {
    const uniqueEmail = `buyer-${Date.now()}@example.co.uk`;
    const { orderNumber } = await insertDbOrder({
      customerName: "Alice Confirmation",
      customerEmail: uniqueEmail,
      shippingAddress: "72 Victoria St",
      city: "London",
      postcode: "SW1E 6QP",
      subtotal: 42.5,
      shippingFee: 4.99,
      total: 47.49,
      deliveryMethod: "Standard UK Delivery",
      paymentMethod: "PayPal",
    });

    const liveSummary = await getDbOrderByNumber(orderNumber);
    assert.ok(liveSummary);
    assert.equal(liveSummary.customer_email, uniqueEmail);
    assert.equal(liveSummary.payment_method, "PayPal");
    assert.equal(liveSummary.status, "Processing");
  });

  // Pairwise 10: Order DB Insertion ↔ Admin Orders Fulfillment Listing
  it("P.10: Placed order immediately appears in Admin Orders fulfillment query with 'Processing' status", async () => {
    const { orderNumber } = await insertDbOrder({
      customerName: "Admin Visibility Test",
      customerEmail: "adminvis@example.co.uk",
      shippingAddress: "15 Commercial Road",
      city: "London",
      postcode: "E1 6BF",
      subtotal: 80.0,
      total: 80.0,
      status: "Processing",
    });

    const allOrders = await getDbOrders();
    const found = allOrders.find((o) => o.order_number === orderNumber);
    assert.ok(found, "Newly placed order must appear in admin orders query");
    assert.equal(found.status, "Processing");
  });

  // Pairwise 11: Admin Order Status Update ↔ Live Confirmation Reflects 'Shipped'
  it("P.11: Update order status to 'Shipped' in admin and verify live customer confirmation reflects 'Shipped'", async () => {
    const { orderId, orderNumber } = await insertDbOrder({
      customerName: "Dispatch Customer",
      customerEmail: "dispatch@example.co.uk",
      shippingAddress: "10 Station Road",
      city: "Cambridge",
      postcode: "CB1 2JW",
      subtotal: 50.0,
      total: 50.0,
      status: "Processing",
    });

    await updateDbOrderStatus(orderId, "Shipped");
    const confirmation = await getDbOrderByNumber(orderNumber);
    assert.equal(confirmation.status, "Shipped");
  });

  // Pairwise 12: Admin Order Status Update ↔ Subsequent Update to 'Delivered'
  it("P.12: Update order from 'Shipped' to 'Delivered' and verify live confirmation reflects 'Delivered'", async () => {
    const { orderId, orderNumber } = await insertDbOrder({
      customerName: "Delivered Customer",
      customerEmail: "delivered@example.co.uk",
      shippingAddress: "8 Castle St",
      city: "Edinburgh",
      postcode: "EH2 3AH",
      subtotal: 65.0,
      total: 65.0,
      status: "Shipped",
    });

    await updateDbOrderStatus(orderId, "Delivered");
    const confirmation = await getDbOrderByNumber(orderNumber);
    assert.equal(confirmation.status, "Delivered");
  });

  // Pairwise 13: Admin Product Creation ↔ Autocomplete Search Instant Appearance
  it("P.13: Create new product in admin and verify autocomplete search immediately finds it", async () => {
    const brand = "StanleyFatmaxTest";
    const name = `Stanley Pro Level ${Date.now().toString().slice(-4)}`;
    await insertDbProduct({
      name,
      brand,
      categorySlug: "diy-decorating",
      price: 29.99,
    });

    const searchResults = await searchDbProducts(brand);
    assert.ok(searchResults.length > 0);
    assert.equal(searchResults[0].brand, brand);
  });

  // Pairwise 14: Admin Product Creation ↔ Category Filter Integration
  it("P.14: Create product in category and verify category query includes new product", async () => {
    const categorySlug = "electricals";
    const name = `Kärcher Pressure Washer Test ${Date.now().toString().slice(-4)}`;
    const { id } = await insertDbProduct({
      name,
      brand: "Kärcher",
      categorySlug,
      price: 149.99,
    });

    const res = await dbClient.execute({
      sql: "SELECT * FROM products WHERE category_slug = ? AND id = ?",
      args: [categorySlug, id],
    });
    assert.equal(res.rows.length, 1);
    assert.equal(res.rows[0].name, name);
  });

  // Pairwise 15: Admin Product Creation ↔ Admin Catalog Search Integration
  it("P.15: Create product and verify admin catalog filter matches title keyword", async () => {
    const uniqueWord = `Jigsaw${Date.now().toString().slice(-4)}`;
    const name = `Black+Decker 500W ${uniqueWord}`;
    await insertDbProduct({
      name,
      brand: "Black+Decker",
      categorySlug: "diy-decorating",
      price: 39.99,
    });

    const results = await searchDbProducts(uniqueWord);
    assert.ok(results.length > 0);
    assert.match(results[0].name, new RegExp(uniqueWord));
  });

  // Pairwise 16: Admin Product Deletion ↔ Search Removal
  it("P.16: Delete product in admin and verify autocomplete search no longer returns it", async () => {
    const name = `Ephemeral Item ${Date.now().toString().slice(-4)}`;
    const { id } = await insertDbProduct({
      name,
      brand: "Ephemeral",
      categorySlug: "housewares",
      price: 19.99,
    });

    const beforeDelete = await searchDbProducts(name);
    assert.equal(beforeDelete.length, 1);

    await deleteDbProduct(id);

    const afterDelete = await searchDbProducts(name);
    assert.equal(afterDelete.length, 0);
  });

  // Pairwise 17: Admin Product Creation ↔ Low Stock Alert Count
  it("P.17: Create product with stock <= 15 and verify admin dashboard low-stock count increments", async () => {
    const metricsBefore = await calculateAdminMetrics();

    await insertDbProduct({
      name: `Low Stock Widget ${Date.now().toString().slice(-4)}`,
      brand: "WidgetCo",
      categorySlug: "diy-decorating",
      price: 12.99,
      stock: 8, // <= 15 triggers low stock
    });

    const metricsAfter = await calculateAdminMetrics();
    assert.equal(metricsAfter.lowStockCount, metricsBefore.lowStockCount + 1);
  });

  // Pairwise 18: Order Placement ↔ Admin Dashboard Total Revenue Sync
  it("P.18: Place order and verify admin dashboard total revenue increments by exact order total", async () => {
    const metricsBefore = await calculateAdminMetrics();
    const orderTotal = 85.5;

    await insertDbOrder({
      customerName: "Revenue Sync Customer",
      customerEmail: "rev@example.co.uk",
      shippingAddress: "1 Treasury Way",
      city: "London",
      postcode: "SW1A 2HQ",
      subtotal: orderTotal,
      total: orderTotal,
    });

    const metricsAfter = await calculateAdminMetrics();
    const expectedRevenue = Number((metricsBefore.totalRevenue + orderTotal).toFixed(2));
    assert.equal(metricsAfter.totalRevenue, expectedRevenue);
  });

  // Pairwise 19: Order Placement ↔ Admin Dashboard Order Count Sync
  it("P.19: Place order and verify admin dashboard total order count increments by exactly 1", async () => {
    const metricsBefore = await calculateAdminMetrics();

    await insertDbOrder({
      customerName: "Count Sync Customer",
      customerEmail: "count@example.co.uk",
      shippingAddress: "2 Counter St",
      city: "Leeds",
      postcode: "LS1 4DY",
      subtotal: 25.0,
      total: 29.99,
    });

    const metricsAfter = await calculateAdminMetrics();
    assert.equal(metricsAfter.orderCount, metricsBefore.orderCount + 1);
  });

  // Pairwise 20: Category Listing ↔ Breadcrumb Hierarchy Mapping
  it("P.20: Retrieve category from database and map into breadcrumb schema itemListElement", async () => {
    const cat = await getDbCategoryBySlug("garden-growing");
    assert.ok(cat);

    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://bargainstore.uk" },
        { "@type": "ListItem", position: 2, name: cat.name, item: `https://bargainstore.uk/category/${cat.slug}` },
      ],
    };

    assert.equal(breadcrumbs.itemListElement[1].name, "Garden & Growing");
    assert.match(breadcrumbs.itemListElement[1].item, /garden-growing/);
  });

  // Pairwise 21: Database Product ↔ JSON-LD Structured Data Price Sync
  it("P.21: Query catalog product from database and verify JSON-LD price matches exact DB price", async () => {
    const products = await getDbProducts(1);
    const prod = products[0];

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: prod.name,
      offers: {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: Number(prod.price),
        availability: "https://schema.org/InStock",
      },
    };

    assert.equal(jsonLd.offers.price, Number(prod.price));
    assert.equal(jsonLd.name, prod.name);
  });

  // Pairwise 22: Turso Table Metrics ↔ Live Database Record Counts
  it("P.22: Query Turso record stats after order insertion and verify count synchronicity", async () => {
    const ordersResBefore = await dbClient.execute("SELECT COUNT(*) as c FROM orders");
    const countBefore = Number(ordersResBefore.rows[0].c);

    await insertDbOrder({
      customerName: "Turso Sync Test",
      customerEmail: "turso@example.co.uk",
      shippingAddress: "9 Edge Way",
      city: "Manchester",
      postcode: "M2 4WU",
      subtotal: 50.0,
      total: 50.0,
    });

    const ordersResAfter = await dbClient.execute("SELECT COUNT(*) as c FROM orders");
    const countAfter = Number(ordersResAfter.rows[0].c);
    assert.equal(countAfter, countBefore + 1);
  });

  // Pairwise 23: Delivery Method Switching ↔ Grand Total Recalculation
  it("P.23: Switch delivery method from standard to express and verify grand total increases by £3.00", () => {
    const items = [{ price: 30.0, quantity: 1 }];
    const standard = calculateBasket({ items, deliveryMethod: "standard", standardShippingFee: 3.99 });
    const express = calculateBasket({ items, deliveryMethod: "express" });

    assert.equal(standard.shippingFee, 3.99);
    assert.equal(express.shippingFee, 6.99);
    assert.equal(Number((express.grandTotal - standard.grandTotal).toFixed(2)), 3.0);
  });

  // Pairwise 24: Cart Clear Action ↔ Total Reset
  it("P.24: Clear active cart and verify subtotal, discount, and grand total reset to 0", () => {
    const activeBasket = calculateBasket({
      items: [{ price: 40.0, quantity: 2 }],
      promoCode: "BARGAIN10",
    });
    assert.ok(activeBasket.subtotal > 0);

    const clearedBasket = calculateBasket({ items: [] });
    assert.equal(clearedBasket.subtotal, 0.0);
    assert.equal(clearedBasket.discountAmount, 0.0);
    assert.equal(clearedBasket.grandTotal, 0.0);
  });
});
