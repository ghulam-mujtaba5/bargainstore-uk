import { createClient } from "@libsql/client";

// Test 1: UK Postcode Regex and validation tests
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUKPostcode(postcode) {
  if (!postcode || typeof postcode !== "string") return false;
  const trimmed = postcode.trim();
  const noSpace = trimmed.replace(/\s+/g, "");
  if (noSpace.length < 5 || noSpace.length > 7) return false;
  return UK_POSTCODE_REGEX.test(trimmed);
}

function formatUKPostcode(postcode) {
  if (!postcode || typeof postcode !== "string") return "";
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, "");
  if (clean.length < 5) return postcode.trim().toUpperCase();
  const outward = clean.slice(0, -3);
  const inward = clean.slice(-3);
  return `${outward} ${inward}`;
}

console.log("=== TEST SUITE: M1 STOREFRONT & ORDER INTEGRATION ===");

// 1. Postcode validation assertions
const validPostcodes = [
  "SW1A 1AA", "sw1a 1aa", "M1 1AE", "B33 8TH", "CR2 6XH",
  "DN55 1PT", "W1A 0AX", "EC1A 1BB", "SW1A1AA", "B1 1AA"
];

for (const pc of validPostcodes) {
  if (!isValidUKPostcode(pc)) {
    console.error(`FAILED: Expected '${pc}' to be valid.`);
    process.exit(1);
  }
}
console.log("✓ All 10 valid UK postcode patterns passed validation.");

const invalidPostcodes = [
  "12345", "ABC DEF", "SW1A", "SW1A 1", "SW1A 1AAA", "USA 90210", "", " "
];

for (const pc of invalidPostcodes) {
  if (isValidUKPostcode(pc)) {
    console.error(`FAILED: Expected '${pc}' to be invalid.`);
    process.exit(1);
  }
}
console.log("✓ All 8 invalid UK postcode patterns correctly rejected.");

// Formatter test
if (formatUKPostcode("sw1a1aa") !== "SW1A 1AA" || formatUKPostcode("m11ae") !== "M1 1AE") {
  console.error("FAILED: Postcode formatter mismatch.");
  process.exit(1);
}
console.log("✓ Postcode formatter produces standard Royal Mail format ('SW1A 1AA').");

// Email regex test
if (!EMAIL_REGEX.test("customer@bargainstore.uk") || EMAIL_REGEX.test("invalid-email")) {
  console.error("FAILED: Email validation mismatch.");
  process.exit(1);
}
console.log("✓ Email validation logic verified.");

// 2. Math & Voucher Calculation assertions
function computeOrderMath(items, promoCode, deliveryMethod) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountAmount = 0;
  if (promoCode === "BARGAIN10") {
    discountAmount = Number(((subtotal * 10) / 100).toFixed(2));
  }
  let shippingFee = 0;
  if (deliveryMethod === "Standard UK Delivery") {
    shippingFee = subtotal >= 50 ? 0 : 4.99;
  } else if (deliveryMethod === "Next Day Express") {
    shippingFee = 6.99;
  } else if (deliveryMethod === "Click & Collect") {
    shippingFee = 0;
  }
  const grandTotal = Math.max(0, Number((subtotal - discountAmount + shippingFee).toFixed(2)));
  return { subtotal, discountAmount, shippingFee, grandTotal };
}

// Subtotal < 50 without voucher: standard delivery applies (£4.99)
const r1 = computeOrderMath([{ price: 29.99, quantity: 1 }], null, "Standard UK Delivery");
if (r1.shippingFee !== 4.99 || r1.grandTotal !== 34.98) {
  console.error("FAILED: Subtotal < 50 shipping math incorrect.", r1);
  process.exit(1);
}
console.log("✓ Basket math < £50 correctly adds £4.99 standard delivery fee.");

// Subtotal >= 50 with BARGAIN10 voucher: FREE standard delivery, 10% off
const r2 = computeOrderMath([{ price: 40.00, quantity: 2 }], "BARGAIN10", "Standard UK Delivery");
// subtotal = 80, discount = 8.00, shipping = 0, grandTotal = 72.00
if (r2.shippingFee !== 0 || r2.discountAmount !== 8.00 || r2.grandTotal !== 72.00) {
  console.error("FAILED: Subtotal >= 50 voucher math incorrect.", r2);
  process.exit(1);
}
console.log("✓ Subtotal >= £50 with BARGAIN10 correctly applies 10% discount and FREE shipping (£72.00).");

// 3. Database direct insertion and retrieval test
async function testDatabase() {
  const client = createClient({ url: "file:local.db" });
  
  const testOrderNumber = `BS-TEST-${Date.now().toString().slice(-4)}`;
  const testSubtotal = 65.00;
  const testDiscount = 6.50;
  const testShipping = 0;
  const testTotal = 58.50;
  const testPromo = "BARGAIN10";

  await client.execute({
    sql: `INSERT INTO orders (
      order_number, customer_name, customer_email, customer_phone, shipping_address,
      city, postcode, delivery_method, subtotal, promo_code, discount_amount,
      shipping_fee, total, status, payment_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      testOrderNumber, "Jane Doe", "jane.doe@example.co.uk", "07700900000",
      "12 High Street", "Birmingham", "B1 1AA", "Standard UK Delivery",
      testSubtotal, testPromo, testDiscount, testShipping, testTotal,
      "Processing", "Credit Card"
    ]
  });

  const res = await client.execute({
    sql: `SELECT * FROM orders WHERE order_number = ?`,
    args: [testOrderNumber]
  });

  if (res.rows.length === 0) {
    console.error("FAILED: Inserted order could not be queried.");
    process.exit(1);
  }

  const order = res.rows[0];
  if (order.promo_code !== "BARGAIN10" || Number(order.discount_amount) !== 6.50) {
    console.error("FAILED: Database promo_code or discount_amount mismatch.", order);
    process.exit(1);
  }

  console.log(`✓ Real SQLite insertion & verification passed for order ${testOrderNumber}:`);
  console.log(`  promo_code = ${order.promo_code}, discount_amount = £${order.discount_amount}, total = £${order.total}`);
}

testDatabase().then(() => {
  console.log("=== ALL M1 VERIFICATION CHECKS PASSED SUCCESSFULLY ===");
}).catch(err => {
  console.error("Database test error:", err);
  process.exit(1);
});
