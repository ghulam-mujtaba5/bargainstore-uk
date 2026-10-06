/**
 * M1 Challenger 2: Adversarial Empirical Verification Suite
 * Targets:
 * 1. Order placement API logic: 400 Bad Request rejection of invalid postcodes, missing items, malformed payloads.
 * 2. Order insertion into SQLite: promo_code and discount_amount persistence and Drizzle ORM query back.
 * 3. Subcategory matcher: unusual casings, punctuation, non-existent subcategories, product isolation.
 * 4. Route fallback: /cart redirect behavior.
 */

import { POST } from "../app/api/orders/route";
import CartPage from "../app/cart/page";
import CategoryPage from "../app/category/[slug]/page";
import { db } from "../db";
import { orders, orderItems } from "../db/schema";
import { eq } from "drizzle-orm";

const createdOrderIds: number[] = [];

async function cleanupOrders() {
  for (const id of createdOrderIds) {
    try {
      await db.delete(orderItems).where(eq(orderItems.orderId, id));
      await db.delete(orders).where(eq(orders.id, id));
    } catch (err) {
      console.warn(`Failed to cleanup test order ${id}:`, err);
    }
  }
  createdOrderIds.length = 0;
}

function findRenderedProductNames(node: any): string[] {
  const names: string[] = [];
  function walk(n: any) {
    if (!n) return;
    if (n.type && (n.type.name === "ProductCard" || typeof n.type === "function")) {
      if (n.props?.product?.name) {
        names.push(n.props.product.name);
      }
    }
    if (n.props?.children) {
      if (Array.isArray(n.props.children)) {
        n.props.children.forEach(walk);
      } else {
        walk(n.props.children);
      }
    }
  }
  walk(node);
  return names;
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("   M1 CHALLENGER 2: ADVERSARIAL EMPIRICAL VERIFICATION HARNESS   ");
  console.log("================================================================================\n");

  let passedAssertions = 0;
  let totalAssertions = 0;

  function record(description: string, passed: boolean, details?: string) {
    totalAssertions++;
    if (passed) {
      passedAssertions++;
      console.log(`  [PASS] ${description}`);
    } else {
      console.error(`  [FAIL] ${description} ${details ? `(${details})` : ""}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: ORDER PLACEMENT API LOGIC REJECTIONS (400 Bad Request)
    // -------------------------------------------------------------------------
    console.log("--- SECTION 1: Order Placement API Logic Rejections (POST /api/orders) ---");

    const validBasePayload = {
      customerName: "Jane Smith",
      customerEmail: "jane.smith@example.co.uk",
      customerPhone: "07700900000",
      shippingAddress: "10 Downing Street",
      city: "London",
      postcode: "SW1A 2AA",
      deliveryMethod: "Standard UK Delivery",
      items: [{ productId: 13, productName: "Dulux Paint", price: 19.99, quantity: 1 }],
      paymentMethod: "Credit Card",
    };

    // 1.1 Test rejection of invalid UK postcodes (16 invalid formats)
    const invalidPostcodes = [
      "12345",
      "ABC DEF",
      "SW1A",
      "1AA",
      "SW1A 1",
      "SW1A 1AAA",
      "USA 90210",
      "K1A 0B1",
      "SW1A1AA1",
      "INVALID",
      "SW!A 1AA",
      "SW1A-1AA",
      "12 34",
      "SW1A 11A",
      "SW1A AAA",
      "",
      "   ",
    ];

    for (const badPostcode of invalidPostcodes) {
      const payload = { ...validBasePayload, postcode: badPostcode };
      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();
      record(
        `1.1 Reject invalid postcode "${badPostcode}" with status 400`,
        res.status === 400 && typeof data.error === "string",
        `Got status ${res.status}: ${JSON.stringify(data)}`
      );
    }

    // 1.2 Test whitespace-tolerant valid postcode formatting via API
    {
      const payload = { ...validBasePayload, postcode: "sw1a  1aa" };
      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const res = await POST(req);
      const data = await res.json();
      record(
        "1.2 Whitespace-tolerant valid postcode 'sw1a  1aa' succeeds with 200 OK",
        res.status === 200 && data.success === true
      );
      if (data.orderId) createdOrderIds.push(data.orderId);

      // Verify formatted in database
      const rows = await db.select().from(orders).where(eq(orders.orderNumber, data.orderNumber));
      record(
        "1.2 Postcode correctly normalized to standard Royal Mail spacing 'SW1A 1AA' in SQLite",
        rows.length === 1 && rows[0].postcode === "SW1A 1AA"
      );
    }

    // 1.3 Test missing / empty items array
    const invalidItemsCases = [
      { label: "empty items array []", items: [] },
      { label: "null items", items: null },
      { label: "undefined items", items: undefined },
    ];

    for (const { label, items } of invalidItemsCases) {
      const payload = { ...validBasePayload, items };
      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();
      record(
        `1.3 Reject order with ${label} with status 400`,
        res.status === 400 && data.error.includes("Missing required order information or items"),
        `Got status ${res.status}: ${JSON.stringify(data)}`
      );
    }

    // 1.4 Test malformed payloads: customerName validations
    const invalidNameCases = [
      { label: "missing customerName", customerName: undefined },
      { label: "empty customerName", customerName: "" },
      { label: "whitespace customerName", customerName: "   " },
      { label: "single character customerName", customerName: "A" },
      { label: "numeric customerName", customerName: 12345 },
    ];

    for (const { label, customerName } of invalidNameCases) {
      const payload = { ...validBasePayload, customerName };
      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();
      record(
        `1.4 Reject order with ${label} with status 400`,
        res.status === 400 && typeof data.error === "string",
        `Got status ${res.status}: ${JSON.stringify(data)}`
      );
    }

    // 1.5 Test malformed payloads: customerEmail validations
    const invalidEmailCases = [
      { label: "missing customerEmail", customerEmail: undefined },
      { label: "empty customerEmail", customerEmail: "" },
      { label: "plain text customerEmail", customerEmail: "notanemail" },
      { label: "customerEmail missing local part", customerEmail: "@example.co.uk" },
      { label: "customerEmail missing domain", customerEmail: "user@" },
      { label: "customerEmail missing TLD", customerEmail: "user@domain" },
      { label: "customerEmail with spaces", customerEmail: "user @domain.co.uk" },
    ];

    for (const { label, customerEmail } of invalidEmailCases) {
      const payload = { ...validBasePayload, customerEmail };
      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();
      record(
        `1.5 Reject order with ${label} with status 400`,
        res.status === 400 && typeof data.error === "string",
        `Got status ${res.status}: ${JSON.stringify(data)}`
      );
    }

    // 1.6 Test malformed payloads: shippingAddress validations (missing and empty)
    const invalidAddressCases = [
      { label: "missing shippingAddress", shippingAddress: undefined },
      { label: "empty shippingAddress", shippingAddress: "" },
    ];

    for (const { label, shippingAddress } of invalidAddressCases) {
      const payload = { ...validBasePayload, shippingAddress };
      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();
      record(
        `1.6 Reject order with ${label} with status 400`,
        res.status === 400 && typeof data.error === "string",
        `Got status ${res.status}: ${JSON.stringify(data)}`
      );
    }

    console.log();

    // -------------------------------------------------------------------------
    // SECTION 2: ORDER INSERTION INTO SQLITE & DRIZZLE ORM QUERY BACK
    // -------------------------------------------------------------------------
    console.log("--- SECTION 2: Order Persistence & Drizzle ORM Query Back ---");

    // 2.1 Order WITH voucher BARGAIN10 (subtotal >= £50 => free delivery)
    {
      const payload = {
        customerName: "Voucher Eligible Customer",
        customerEmail: "voucher.test@bargainstore.uk",
        customerPhone: "07700900111",
        shippingAddress: "45 Queen Victoria Street",
        city: "London",
        postcode: "EC4N 4SA",
        deliveryMethod: "Standard UK Delivery",
        items: [
          { productId: 14, productName: "Black+Decker Multi-Tool", price: 35.0, quantity: 2 },
        ],
        promoCode: "BARGAIN10",
        paymentMethod: "Credit Card",
      };

      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const body = await res.json();
      record("2.1.1 Order creation with BARGAIN10 returns 200 OK", res.status === 200 && body.success === true);
      record("2.1.2 Order creation returns valid BS- prefixed orderNumber", typeof body.orderNumber === "string" && body.orderNumber.startsWith("BS-"));
      record("2.1.3 Order creation returns positive integer orderId", typeof body.orderId === "number" && body.orderId > 0);

      createdOrderIds.push(body.orderId);

      // Query back via Drizzle ORM
      const rows = await db.select().from(orders).where(eq(orders.orderNumber, body.orderNumber));
      record("2.1.4 Order is retrievable via Drizzle ORM query", rows.length === 1);
      const order = rows[0];

      record("2.1.5 Drizzle query confirms promo_code is exactly 'BARGAIN10'", order.promoCode === "BARGAIN10");
      record("2.1.6 Drizzle query confirms discount_amount is 10% of subtotal (£7.00)", Number(order.discountAmount) === 7.0);
      record("2.1.7 Drizzle query confirms subtotal is £70.00", Number(order.subtotal) === 70.0);
      record("2.1.8 Drizzle query confirms shipping_fee is £0.00 (subtotal >= £50)", Number(order.shippingFee) === 0);
      record("2.1.9 Drizzle query confirms total is £63.00 (£70 - £7 + £0)", Number(order.total) === 63.0);
      record("2.1.10 Drizzle query confirms order status is 'Processing'", order.status === "Processing");
      record("2.1.11 Drizzle query confirms formatted UK postcode 'EC4N 4SA'", order.postcode === "EC4N 4SA");

      // Verify orderItems via Drizzle ORM
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      record("2.1.12 Drizzle query returns associated order line item", items.length === 1);
      record("2.1.13 Order item has correct product_id, product_name, and quantity", items[0].productId === 14 && items[0].quantity === 2);
    }

    // 2.2 Order WITH voucher BARGAIN10 (subtotal < £50 => standard delivery £4.99 applies)
    {
      const payload = {
        customerName: "Small Basket Customer",
        customerEmail: "small.basket@bargainstore.uk",
        shippingAddress: "12 Church Lane",
        city: "Manchester",
        postcode: "m11ae", // test lowercase no-space formatting
        deliveryMethod: "Standard UK Delivery",
        items: [
          { productId: 13, productName: "Dulux Paint", price: 30.0, quantity: 1 },
        ],
        promoCode: "  bargain10  ", // test lowercase with whitespace
        paymentMethod: "PayPal",
      };

      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const body = await res.json();
      record("2.2.1 Order creation with lowercase voucher returns 200 OK", res.status === 200 && body.success === true);
      createdOrderIds.push(body.orderId);

      const rows = await db.select().from(orders).where(eq(orders.orderNumber, body.orderNumber));
      const order = rows[0];

      record("2.2.2 Drizzle query confirms normalized promo_code is 'BARGAIN10'", order.promoCode === "BARGAIN10");
      record("2.2.3 Drizzle query confirms discount_amount is £3.00 (10% of £30)", Number(order.discountAmount) === 3.0);
      record("2.2.4 Drizzle query confirms shipping_fee is £4.99 (subtotal < £50)", Number(order.shippingFee) === 4.99);
      record("2.2.5 Drizzle query confirms total is £31.99 (£30 - £3 + £4.99)", Number(order.total) === 31.99);
      record("2.2.6 Drizzle query confirms postcode is formatted to 'M1 1AE'", order.postcode === "M1 1AE");
    }

    // 2.3 Order WITHOUT voucher (promoCode null)
    {
      const payload = {
        customerName: "No Voucher Customer",
        customerEmail: "no.voucher@bargainstore.uk",
        shippingAddress: "88 High Street",
        city: "Birmingham",
        postcode: "B33 8TH",
        deliveryMethod: "Standard UK Delivery",
        items: [
          { productId: 20, productName: "Stanley Tape", price: 15.0, quantity: 2 },
        ],
        promoCode: null,
      };

      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const body = await res.json();
      record("2.3.1 Order creation without voucher returns 200 OK", res.status === 200 && body.success === true);
      createdOrderIds.push(body.orderId);

      const rows = await db.select().from(orders).where(eq(orders.orderNumber, body.orderNumber));
      const order = rows[0];

      record("2.3.2 Drizzle query confirms promo_code is null", order.promoCode === null);
      record("2.3.3 Drizzle query confirms discount_amount is 0", Number(order.discountAmount) === 0);
      record("2.3.4 Drizzle query confirms subtotal £30 and total £34.99", Number(order.subtotal) === 30.0 && Number(order.total) === 34.99);
    }

    // 2.4 Order WITH invalid voucher code (must NOT grant discount)
    {
      const payload = {
        customerName: "Invalid Voucher Attacker",
        customerEmail: "attacker@bargainstore.uk",
        shippingAddress: "99 Fake Street",
        city: "Leeds",
        postcode: "LS1 6DG",
        deliveryMethod: "Standard UK Delivery",
        items: [
          { productId: 13, productName: "Dulux Paint", price: 40.0, quantity: 1 },
        ],
        promoCode: "FAKE50OFF",
        discountAmount: 20.0, // adversarial injection attempt
      };

      const req = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const body = await res.json();
      record("2.4.1 Order creation with unrecognized voucher code returns 200 OK", res.status === 200 && body.success === true);
      createdOrderIds.push(body.orderId);

      const rows = await db.select().from(orders).where(eq(orders.orderNumber, body.orderNumber));
      const order = rows[0];

      record("2.4.2 Drizzle query confirms invalid voucher promo_code is nullified", order.promoCode === null);
      record("2.4.3 Drizzle query confirms adversary discountAmount was zeroed out", Number(order.discountAmount) === 0);
      record("2.4.4 Drizzle query confirms total retains full price (£44.99 with shipping)", Number(order.total) === 44.99);
    }

    console.log();

    // -------------------------------------------------------------------------
    // SECTION 3: SUBCATEGORY MATCHER EMPIRICAL TESTING
    // -------------------------------------------------------------------------
    console.log("--- SECTION 3: Subcategory Matcher Empirical Testing ---");

    // 3.1 Standard Casing & Product Isolation in diy-decorating
    {
      const resPowerTools = await CategoryPage({
        params: Promise.resolve({ slug: "diy-decorating" }),
        searchParams: Promise.resolve({ sub: "Power Tools" }),
      });
      const powerToolProducts = findRenderedProductNames(resPowerTools);

      record(
        "3.1.1 Subcategory 'Power Tools' renders matching Black+Decker tools",
        powerToolProducts.some((p) => p.includes("Multi-Tool") || p.includes("Jigsaw")),
        `Found: ${JSON.stringify(powerToolProducts)}`
      );
      record(
        "3.1.2 Subcategory 'Power Tools' strictly isolates (excludes) Dulux paint",
        !powerToolProducts.some((p) => p.toLowerCase().includes("dulux") || p.toLowerCase().includes("paint")),
        `Found: ${JSON.stringify(powerToolProducts)}`
      );

      const resPaint = await CategoryPage({
        params: Promise.resolve({ slug: "diy-decorating" }),
        searchParams: Promise.resolve({ sub: "Paint & Varnish" }),
      });
      const paintProducts = findRenderedProductNames(resPaint);

      record(
        "3.1.3 Subcategory 'Paint & Varnish' renders Dulux paint",
        paintProducts.some((p) => p.includes("Dulux")),
        `Found: ${JSON.stringify(paintProducts)}`
      );
      record(
        "3.1.4 Subcategory 'Paint & Varnish' strictly isolates (excludes) Black+Decker tools",
        !paintProducts.some((p) => p.toLowerCase().includes("black+decker") || p.toLowerCase().includes("jigsaw")),
        `Found: ${JSON.stringify(paintProducts)}`
      );
    }

    // 3.2 Unusual Casings (lowercase, UPPERCASE, MixedCase)
    {
      const casingVariations = [
        "power tools",
        "POWER TOOLS",
        "PoWeR ToOlS",
        "  Power Tools  ",
      ];

      for (const variant of casingVariations) {
        const res = await CategoryPage({
          params: Promise.resolve({ slug: "diy-decorating" }),
          searchParams: Promise.resolve({ sub: variant }),
        });
        const prods = findRenderedProductNames(res);
        record(
          `3.2 Matching casing variant "${variant}" successfully returns Power Tools`,
          prods.some((p) => p.includes("Multi-Tool") || p.includes("Jigsaw")),
          `Found: ${JSON.stringify(prods)}`
        );
      }
    }

    // 3.3 Punctuation & Symbols
    {
      const punctuationCases = [
        { sub: "Power Tools!", expectedKeyword: "Multi-Tool" },
        { sub: "Paint & Varnish...", expectedKeyword: "Dulux" },
      ];

      for (const { sub, expectedKeyword } of punctuationCases) {
        const res = await CategoryPage({
          params: Promise.resolve({ slug: "diy-decorating" }),
          searchParams: Promise.resolve({ sub }),
        });
        const prods = findRenderedProductNames(res);
        record(
          `3.3 Punctuation tolerant matching for "${sub}"`,
          prods.some((p) => p.includes(expectedKeyword)),
          `Found: ${JSON.stringify(prods)}`
        );
      }
    }

    // 3.4 Non-Existent & Arbitrary Subcategories (Isolation to 0 products)
    {
      const nonExistentSubs = [
        "NonExistentSubcategoryXYZ",
        "Quantum Teleportation Units",
        "RandomGadgets_9999",
      ];

      for (const sub of nonExistentSubs) {
        const res = await CategoryPage({
          params: Promise.resolve({ slug: "diy-decorating" }),
          searchParams: Promise.resolve({ sub }),
        });
        const prods = findRenderedProductNames(res);
        record(
          `3.4 Non-existent subcategory "${sub}" returns 0 products (complete isolation)`,
          prods.length === 0,
          `Expected 0, got ${prods.length}: ${JSON.stringify(prods)}`
        );
      }
    }

    // 3.5 Empty or Whitespace Subcategory (reverts to all products)
    {
      const resAll = await CategoryPage({
        params: Promise.resolve({ slug: "diy-decorating" }),
        searchParams: Promise.resolve({}),
      });
      const allProds = findRenderedProductNames(resAll);

      const resWhitespace = await CategoryPage({
        params: Promise.resolve({ slug: "diy-decorating" }),
        searchParams: Promise.resolve({ sub: "   " }),
      });
      const whitespaceProds = findRenderedProductNames(resWhitespace);

      record(
        "3.5 Whitespace subcategory '   ' falls back to displaying all category products",
        allProds.length > 0 && whitespaceProds.length === allProds.length,
        `all=${allProds.length}, whitespace=${whitespaceProds.length}`
      );
    }

    console.log();

    // -------------------------------------------------------------------------
    // SECTION 4: ROUTE FALLBACK (/cart REDIRECT BEHAVIOR)
    // -------------------------------------------------------------------------
    console.log("--- SECTION 4: Route Fallback (/cart redirect behavior) ---");

    // 4.1 Simple redirect without query parameters
    try {
      await CartPage({ searchParams: Promise.resolve({}) });
      record("4.1 CartPage redirects to /basket", false, "Expected NEXT_REDIRECT exception was not thrown");
    } catch (err: any) {
      record(
        "4.1 CartPage triggers NEXT_REDIRECT to '/basket'",
        err.message === "NEXT_REDIRECT" && err.digest?.includes("/basket"),
        `Caught: message=${err.message}, digest=${err.digest}`
      );
    }

    // 4.2 Redirect with query parameters preserved
    try {
      await CartPage({
        searchParams: Promise.resolve({
          ref: "email_campaign",
          voucher: "BARGAIN10",
        }),
      });
      record("4.2 CartPage preserves query params on redirect", false, "Expected NEXT_REDIRECT exception was not thrown");
    } catch (err: any) {
      const digest: string = err.digest || "";
      const matchesUrl =
        digest.includes("/basket?ref=email_campaign&voucher=BARGAIN10") ||
        (digest.includes("ref=email_campaign") && digest.includes("voucher=BARGAIN10"));

      record(
        "4.2 CartPage preserves query parameters in redirect target",
        err.message === "NEXT_REDIRECT" && matchesUrl,
        `Caught digest: ${digest}`
      );
    }

    // 4.3 Redirect with array / multi-value search parameters
    try {
      await CartPage({
        searchParams: Promise.resolve({
          tag: ["garden", "tools"],
        }),
      });
      record("4.3 CartPage handles multi-value params", false, "Expected redirect not thrown");
    } catch (err: any) {
      const digest: string = err.digest || "";
      record(
        "4.3 CartPage handles multi-value search parameters cleanly",
        err.message === "NEXT_REDIRECT" && digest.includes("tag=garden") && digest.includes("tag=tools"),
        `Caught digest: ${digest}`
      );
    }

    console.log();
    console.log("================================================================================");
    console.log(`   VERIFICATION SUMMARY: ${passedAssertions} / ${totalAssertions} ASSERTIONS PASSED (100%)   `);
    console.log("================================================================================\n");

  } finally {
    // Teardown
    await cleanupOrders();
    console.log("Cleanup completed: all test orders purged from SQLite database.");
  }
}

runTestSuite()
  .then(() => {
    console.log("Empirical verification run exited successfully with code 0.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FATAL ERROR during empirical verification run:", err);
    process.exit(1);
  });
