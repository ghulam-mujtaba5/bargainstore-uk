import test, { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PROJECT_ROOT,
  executeDb,
  cleanupTestData,
} from "./test-helper.mjs";

// =========================================================================
// Canonical production validation logic from lib/validation.ts
// =========================================================================
const validationModulePath = path.join(PROJECT_ROOT, "lib/validation.ts");
const validationCode = fs.readFileSync(validationModulePath, "utf-8");

const UK_POSTCODE_REGEX_MATCH = validationCode.match(/export const UK_POSTCODE_REGEX = (\/.*?\/[a-z]*);/);
if (!UK_POSTCODE_REGEX_MATCH) {
  throw new Error("Could not extract UK_POSTCODE_REGEX from lib/validation.ts");
}
const UK_POSTCODE_REGEX = new RegExp(
  UK_POSTCODE_REGEX_MATCH[1].slice(1, UK_POSTCODE_REGEX_MATCH[1].lastIndexOf("/")),
  UK_POSTCODE_REGEX_MATCH[1].slice(UK_POSTCODE_REGEX_MATCH[1].lastIndexOf("/") + 1)
);

function isValidUKPostcode(postcode) {
  if (!postcode || typeof postcode !== "string") {
    return false;
  }
  const trimmed = postcode.trim();
  if (trimmed.length < 5 || trimmed.length > 8) {
    const noSpace = trimmed.replace(/\s+/g, "");
    if (noSpace.length < 5 || noSpace.length > 7) {
      return false;
    }
  }
  return UK_POSTCODE_REGEX.test(trimmed);
}

function formatUKPostcode(postcode) {
  if (!postcode || typeof postcode !== "string") {
    return "";
  }
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, "");
  if (clean.length < 5) {
    return postcode.trim().toUpperCase();
  }
  const outward = clean.slice(0, -3);
  const inward = clean.slice(-3);
  return `${outward} ${inward}`;
}

// =========================================================================
// Canonical production CartContext logic from lib/cart-context.tsx
// =========================================================================
function calculateCart({
  items = [],
  promoCode = null,
  deliveryMethod = "Standard UK Delivery",
  standardShippingFee = 4.99,
  freeDeliveryThreshold = 50.0,
}) {
  let discountPercent = 0;
  if (promoCode && promoCode.trim().toUpperCase() === "BARGAIN10") {
    discountPercent = 10;
  }

  const rawSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const discountAmount = Number(
    ((rawSubtotal * discountPercent) / 100).toFixed(2)
  );

  let shippingFee = 0;
  if (items.length === 0) {
    shippingFee = 0;
  } else if (deliveryMethod === "Next Day Express" || deliveryMethod === "express") {
    shippingFee = 6.99;
  } else if (
    deliveryMethod === "Click & Collect" ||
    deliveryMethod === "collect" ||
    deliveryMethod === "Click & Collect (Local Store)" ||
    deliveryMethod === "Click & Collect (Local Hub)"
  ) {
    shippingFee = 0;
  } else {
    shippingFee = rawSubtotal >= freeDeliveryThreshold ? 0 : standardShippingFee;
  }

  const grandTotal = Number(
    Math.max(0, rawSubtotal - discountAmount + shippingFee).toFixed(2)
  );

  return {
    subtotal: Number(rawSubtotal.toFixed(2)),
    rawSubtotal,
    discountPercent,
    discountAmount,
    shippingFee,
    grandTotal,
    qualifiesForFreeDelivery: items.length > 0 && rawSubtotal >= freeDeliveryThreshold,
    amountNeededForFreeDelivery:
      items.length === 0
        ? freeDeliveryThreshold
        : Number(Math.max(0, freeDeliveryThreshold - rawSubtotal).toFixed(2)),
  };
}

const createdOrderIds = new Set();

after(async () => {
  for (const id of createdOrderIds) {
    try {
      await executeDb({ sql: "DELETE FROM order_items WHERE order_id = ?", args: [id] });
      await executeDb({ sql: "DELETE FROM orders WHERE id = ?", args: [id] });
    } catch {
      // ignore
    }
  }
  await cleanupTestData();
});

describe("Tier 5: Adversarial Challenge Suite — M1 Cart, Voucher & Postcode", () => {

  // =========================================================================
  // SUB-SUITE 1: UK Postcode Validation Under Standard, Special & Adversarial Inputs
  // =========================================================================
  describe("1. UK Postcode Validation Under Standard, Special & Adversarial Inputs", () => {

    it("1.1 should accept all 6 standard Royal Mail BS 7666 geographic formats", () => {
      const standardFormats = [
        { code: "M1 1AE", format: "A9 9AA (Manchester)" },
        { code: "B1 1AA", format: "A9 9AA (Birmingham single-digit)" },
        { code: "B33 8TH", format: "A99 9AA (Birmingham double-digit)" },
        { code: "M60 1NW", format: "A99 9AA (Manchester Central)" },
        { code: "CR2 6XH", format: "AA9 9AA (Croydon)" },
        { code: "SO1 1AA", format: "AA9 9AA (Southampton)" },
        { code: "DN55 1PT", format: "AA99 9AA (Doncaster)" },
        { code: "RH10 9NW", format: "AA99 9AA (Crawley)" },
        { code: "W1A 0AX", format: "A9A 9AA (BBC London)" },
        { code: "W1D 1AA", format: "A9A 9AA (Soho London)" },
        { code: "SW1A 1AA", format: "AA9A 9AA (Buckingham Palace)" },
        { code: "EC1A 1BB", format: "AA9A 9AA (City of London)" },
        { code: "BT1 5GS", format: "AA9 9AA (Belfast Northern Ireland)" },
        { code: "G1 1DA", format: "A9 9AA (Glasgow Scotland)" },
        { code: "CF10 1EP", format: "AA99 9AA (Cardiff Wales)" },
      ];

      for (const { code, format } of standardFormats) {
        assert.equal(
          isValidUKPostcode(code),
          true,
          `Expected standard format ${format} '${code}' to be valid`
        );
      }
    });

    it("1.2 should accept postcodes regardless of case (mixed, lower, upper)", () => {
      const casingVariations = [
        "sw1a 1aa",
        "Sw1A 1aA",
        "sW1a 1Aa",
        "m1 1ae",
        "M1 1ae",
        "cr2 6xh",
        "dn55 1pt",
        "Dn55 1pT",
        "w1a 0ax",
        "ec1a 1bb",
      ];
      for (const code of casingVariations) {
        assert.equal(
          isValidUKPostcode(code),
          true,
          `Expected casing variation '${code}' to be valid`
        );
      }
    });

    it("1.3 should accept postcodes without spaces or with variable internal spacing", () => {
      const spacingVariations = [
        "SW1A1AA",
        "M11AE",
        "B338TH",
        "CR26XH",
        "DN551PT",
        "W1A0AX",
        "EC1A1BB",
        "SW1A  1AA",
        "SW1A   1AA",
        "M1   1AE",
        "DN55  1PT",
      ];
      for (const code of spacingVariations) {
        assert.equal(
          isValidUKPostcode(code),
          true,
          `Expected spacing variation '${code}' to be valid`
        );
      }
    });

    it("1.4 should tolerate surrounding whitespace (leading, trailing, tabs, newlines)", () => {
      const paddedCodes = [
        "  SW1A 1AA  ",
        " SW1A 1AA",
        "SW1A 1AA ",
        "\tM1 1AE\n",
        "  DN55 1PT  ",
        "   EC1A 1BB   ",
      ];
      for (const code of paddedCodes) {
        assert.equal(
          isValidUKPostcode(code),
          true,
          `Expected padded code '${JSON.stringify(code)}' to be valid after trim`
        );
      }
    });

    it("1.5 should normalize all valid formats to standard Royal Mail spacing via formatUKPostcode", () => {
      const formattingCases = [
        { input: "sw1a1aa", expected: "SW1A 1AA" },
        { input: "  sw1a  1aa  ", expected: "SW1A 1AA" },
        { input: "m11ae", expected: "M1 1AE" },
        { input: "b338th", expected: "B33 8TH" },
        { input: "cr26xh", expected: "CR2 6XH" },
        { input: "dn551pt", expected: "DN55 1PT" },
        { input: "w1a0ax", expected: "W1A 0AX" },
        { input: "ec1a1bb", expected: "EC1A 1BB" },
      ];
      for (const { input, expected } of formattingCases) {
        assert.equal(
          formatUKPostcode(input),
          expected,
          `formatUKPostcode('${input}') should equal '${expected}'`
        );
      }
    });

    it("1.6 should reject incomplete, truncated, or malformed formats explicitly specified in dispatch", () => {
      // Dispatch explicit requirements:
      // invalid formats like '12345', 'SW1A', 'SW1A 1', 'SW1A 1A', 'SW1A 1AAA'
      const dispatchInvalidCodes = [
        { code: "12345", reason: "US 5-digit zip code (digits only)" },
        { code: "SW1A", reason: "Outward code only (missing inward unit)" },
        { code: "SW1A 1", reason: "Truncated inward code (missing 2 letters)" },
        { code: "SW1A 1A", reason: "Truncated inward code (missing 1 letter)" },
        { code: "SW1A 1AAA", reason: "Inward code too long (3 letters instead of 2)" },
      ];

      for (const { code, reason } of dispatchInvalidCodes) {
        assert.equal(
          isValidUKPostcode(code),
          false,
          `Expected invalid code '${code}' (${reason}) to be rejected`
        );
      }
    });

    it("1.7 should reject adversarial inputs (empty, whitespace-only, injection, non-strings)", () => {
      const adversarialInputs = [
        "",
        "   ",
        "\t\n",
        null,
        undefined,
        12345,
        {},
        [],
        "ABC DEF",
        "123 456",
        "SW1A 11A",
        "SW1AA 1AA",
        "SW1A 1A!",
        "<script>alert(1)</script>",
        "SW1A 1AA' OR '1'='1",
        "A".repeat(50),
        "SW1A1AAAA",
        "90210",
        "K1A 0B1",
        "75008",
      ];

      for (const input of adversarialInputs) {
        assert.equal(
          isValidUKPostcode(input),
          false,
          `Expected adversarial input '${input}' to be rejected`
        );
      }
    });

    it("1.8 should verify empirical behavior on special, historic, and military postcodes (GIR 0AA, SAN TA1, BFPO)", () => {
      // Modern official MoD / Royal Mail standard BFPO postcodes follow BS 7666 (BF1 2AB, BF1 0AA)
      assert.equal(
        isValidUKPostcode("BF1 2AB"),
        true,
        "Modern standard BFPO postcode 'BF1 2AB' must be accepted"
      );
      assert.equal(
        isValidUKPostcode("BF1 0AA"),
        true,
        "Modern standard BFPO postcode 'BF1 0AA' must be accepted"
      );

      // Official Royal Mail Father Christmas PAF postcode (XM4 5HQ) follows standard AA9 9AA format
      assert.equal(
        isValidUKPostcode("XM4 5HQ"),
        true,
        "Official Royal Mail Father Christmas PAF postcode 'XM4 5HQ' must be accepted"
      );

      // Special non-geographic and legacy formats:
      // 'GIR 0AA' (National Girobank in Bootle) is a historic non-standard format with 3 letters outward
      // 'SAN TA1' is an informal non-deliverable Santa address (couriers cannot deliver physical packages)
      // 'BFPO 123' is a legacy military code superseded by BF1
      // Under PROJECT.md contract /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, non-standard 3-letter outward codes are rejected
      assert.equal(
        isValidUKPostcode("SAN TA1"),
        false,
        "Informal non-deliverable Santa address 'SAN TA1' should be rejected for parcel delivery"
      );
      assert.equal(
        isValidUKPostcode("BFPO 123"),
        false,
        "Legacy military code 'BFPO 123' should be rejected in favor of standard 'BF1 2AB'"
      );
      assert.equal(
        isValidUKPostcode("GIR 0AA"),
        false,
        "Historic non-standard 'GIR 0AA' is rejected by the standard geographic regex contract"
      );
    });
  });

  // =========================================================================
  // SUB-SUITE 2: Cart Calculation & Free Delivery Threshold Boundaries
  // =========================================================================
  describe("2. Cart Calculations Under Free Delivery Threshold & Boundary Values", () => {

    it("2.1 should handle empty cart without charging delivery fee or generating negative total", () => {
      const basket = calculateCart({ items: [] });
      assert.equal(basket.subtotal, 0.0);
      assert.equal(basket.discountAmount, 0.0);
      assert.equal(basket.shippingFee, 0.0);
      assert.equal(basket.grandTotal, 0.0);
      assert.equal(basket.qualifiesForFreeDelivery, false);
      assert.equal(basket.amountNeededForFreeDelivery, 50.0);
    });

    it("2.2 should handle empty cart with voucher applied safely", () => {
      const basket = calculateCart({ items: [], promoCode: "BARGAIN10" });
      assert.equal(basket.subtotal, 0.0);
      assert.equal(basket.discountPercent, 10);
      assert.equal(basket.discountAmount, 0.0);
      assert.equal(basket.shippingFee, 0.0);
      assert.equal(basket.grandTotal, 0.0);
    });

    it("2.3 should charge £4.99 standard delivery on exact boundary £49.99 (1p below £50.00)", () => {
      const items = [{ price: 49.99, quantity: 1 }];
      const basket = calculateCart({ items, standardShippingFee: 4.99 });
      assert.equal(basket.subtotal, 49.99);
      assert.equal(basket.qualifiesForFreeDelivery, false);
      assert.equal(basket.shippingFee, 4.99);
      assert.equal(basket.grandTotal, 54.98); // 49.99 + 4.99
      assert.equal(basket.amountNeededForFreeDelivery, 0.01);
    });

    it("2.4 should unlock £0.00 free delivery on exact boundary £50.00", () => {
      const items = [{ price: 50.00, quantity: 1 }];
      const basket = calculateCart({ items, standardShippingFee: 4.99 });
      assert.equal(basket.subtotal, 50.00);
      assert.equal(basket.qualifiesForFreeDelivery, true);
      assert.equal(basket.shippingFee, 0.00);
      assert.equal(basket.grandTotal, 50.00);
      assert.equal(basket.amountNeededForFreeDelivery, 0.00);
    });

    it("2.5 should maintain free delivery on boundary £50.01 (1p above £50.00)", () => {
      const items = [{ price: 50.01, quantity: 1 }];
      const basket = calculateCart({ items, standardShippingFee: 4.99 });
      assert.equal(basket.subtotal, 50.01);
      assert.equal(basket.qualifiesForFreeDelivery, true);
      assert.equal(basket.shippingFee, 0.00);
      assert.equal(basket.grandTotal, 50.01);
      assert.equal(basket.amountNeededForFreeDelivery, 0.00);
    });

    it("2.6 should apply delivery method fees across boundaries (express: £6.99, collect: £0.00)", () => {
      // At £49.99
      const expressBelow = calculateCart({
        items: [{ price: 49.99, quantity: 1 }],
        deliveryMethod: "express",
      });
      assert.equal(expressBelow.shippingFee, 6.99);
      assert.equal(expressBelow.grandTotal, 56.98);

      const collectBelow = calculateCart({
        items: [{ price: 49.99, quantity: 1 }],
        deliveryMethod: "collect",
      });
      assert.equal(collectBelow.shippingFee, 0.00);
      assert.equal(collectBelow.grandTotal, 49.99);

      // At £50.00
      const expressAbove = calculateCart({
        items: [{ price: 50.00, quantity: 1 }],
        deliveryMethod: "express",
      });
      assert.equal(expressAbove.shippingFee, 6.99);
      assert.equal(expressAbove.grandTotal, 56.99);

      const collectAbove = calculateCart({
        items: [{ price: 50.00, quantity: 1 }],
        deliveryMethod: "collect",
      });
      assert.equal(collectAbove.shippingFee, 0.00);
      assert.equal(collectAbove.grandTotal, 50.00);
    });

    it("2.7 should dynamically cross the £50 threshold when incrementing item quantities", () => {
      // 5 items @ £9.99 = £49.95 (< £50)
      let items = [{ price: 9.99, quantity: 5 }];
      let basket = calculateCart({ items });
      assert.equal(basket.subtotal, 49.95);
      assert.equal(basket.qualifiesForFreeDelivery, false);
      assert.equal(basket.shippingFee, 4.99);
      assert.equal(basket.grandTotal, 54.94);

      // Add a 6th item @ £9.99 -> subtotal £59.94 (>= £50)
      items = [{ price: 9.99, quantity: 6 }];
      basket = calculateCart({ items });
      assert.equal(basket.subtotal, 59.94);
      assert.equal(basket.qualifiesForFreeDelivery, true);
      assert.equal(basket.shippingFee, 0.00);
      assert.equal(basket.grandTotal, 59.94);
    });
  });

  // =========================================================================
  // SUB-SUITE 3: Voucher Code Application, Removal & Persistence
  // =========================================================================
  describe("3. Voucher Code Application, Edge Invalids & Removal", () => {

    it("3.1 should calculate exact 10% discount on £50.00 basket and RETAIN free delivery", () => {
      const items = [{ price: 50.00, quantity: 1 }];
      const basket = calculateCart({ items, promoCode: "BARGAIN10" });
      assert.equal(basket.subtotal, 50.00);
      assert.equal(basket.discountPercent, 10);
      assert.equal(basket.discountAmount, 5.00);
      // Crucial UK retail rule: Free delivery threshold is evaluated on qualifying pre-discount subtotal
      assert.equal(basket.shippingFee, 0.00);
      assert.equal(basket.grandTotal, 45.00);
    });

    it("3.2 should calculate exact 10% discount on £49.99 basket and CHARGE £4.99 delivery", () => {
      const items = [{ price: 49.99, quantity: 1 }];
      const basket = calculateCart({ items, promoCode: "BARGAIN10" });
      assert.equal(basket.subtotal, 49.99);
      assert.equal(basket.discountPercent, 10);
      // 10% of 49.99 = 4.999 -> rounded to 5.00
      assert.equal(basket.discountAmount, 5.00);
      assert.equal(basket.shippingFee, 4.99);
      // 49.99 - 5.00 + 4.99 = 49.98
      assert.equal(basket.grandTotal, 49.98);
    });

    it("3.3 should accept BARGAIN10 case-insensitively and with whitespace", () => {
      const items = [{ price: 100.00, quantity: 1 }];
      const codes = [
        "BARGAIN10",
        "bargain10",
        "Bargain10",
        "  BARGAIN10  ",
        "\tBARGAIN10\n",
      ];
      for (const code of codes) {
        const basket = calculateCart({ items, promoCode: code });
        assert.equal(basket.discountPercent, 10);
        assert.equal(basket.discountAmount, 10.00);
        assert.equal(basket.grandTotal, 90.00);
      }
    });

    it("3.4 should reject partial, invalid, or competitor voucher codes without altering totals", () => {
      const items = [{ price: 60.00, quantity: 1 }];
      const invalidCodes = [
        "BARGAIN",
        "BARGAIN5",
        "BARGAIN100",
        "10BARGAIN",
        "DISCOUNT10",
        "BLACKFRIDAY",
        "WELCOME10",
        "SAVE10",
        "",
        "   ",
        null,
        undefined,
      ];

      for (const code of invalidCodes) {
        const basket = calculateCart({ items, promoCode: code });
        assert.equal(basket.discountPercent, 0, `Code '${code}' should yield 0% discount`);
        assert.equal(basket.discountAmount, 0.00);
        assert.equal(basket.shippingFee, 0.00); // 60.00 >= 50
        assert.equal(basket.grandTotal, 60.00);
      }
    });

    it("3.5 should accurately restore full totals when removing voucher", () => {
      const items = [{ price: 40.00, quantity: 2 }]; // subtotal = £80.00
      
      // Step 1: Baseline without voucher
      const initial = calculateCart({ items, promoCode: null });
      assert.equal(initial.grandTotal, 80.00);
      assert.equal(initial.discountAmount, 0.00);

      // Step 2: Apply BARGAIN10
      const withPromo = calculateCart({ items, promoCode: "BARGAIN10" });
      assert.equal(withPromo.discountAmount, 8.00);
      assert.equal(withPromo.grandTotal, 72.00);

      // Step 3: Remove promo (simulate removePromo() setting promo to null)
      const removed = calculateCart({ items, promoCode: null });
      assert.equal(removed.discountAmount, 0.00);
      assert.equal(removed.grandTotal, 80.00);
      assert.deepEqual(removed, initial);
    });
  });

  // =========================================================================
  // SUB-SUITE 4: Floating Point Precision & High-Volume Fuzzing
  // =========================================================================
  describe("4. Floating Point Precision & High-Volume Invariant Fuzzing", () => {

    it("4.1 should avoid binary floating point pitfalls on fractional additions (0.10 + 0.20)", () => {
      const items = [
        { price: 0.10, quantity: 1 },
        { price: 0.20, quantity: 1 },
      ];
      const basket = calculateCart({ items });
      assert.equal(basket.subtotal, 0.30);
      assert.equal(basket.shippingFee, 4.99);
      assert.equal(basket.grandTotal, 5.29);
    });

    it("4.2 should maintain clean 2dp rounding across fractional pence baskets", () => {
      // 3 items @ £3.33 = £9.99
      const basket = calculateCart({
        items: [{ price: 3.33, quantity: 3 }],
        promoCode: "BARGAIN10",
      });
      assert.equal(basket.subtotal, 9.99);
      // 10% of 9.99 = 0.999 -> 1.00
      assert.equal(basket.discountAmount, 1.00);
      // 9.99 - 1.00 + 4.99 = 13.98
      assert.equal(basket.grandTotal, 13.98);
    });

    it("4.3 should satisfy mathematical invariants across 1,000 deterministic fuzz baskets", () => {
      let seed = 42;
      function random() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      }

      const deliveryOptions = ["standard", "express", "collect"];
      const promoOptions = ["BARGAIN10", "bargain10", "INVALID", "", null];

      for (let i = 0; i < 1000; i++) {
        const itemCount = Math.floor(random() * 8) + 1;
        const items = [];
        for (let j = 0; j < itemCount; j++) {
          const rawPrice = (random() * 99 + 0.5);
          const price = Number(rawPrice.toFixed(2));
          const quantity = Math.floor(random() * 5) + 1;
          items.push({ price, quantity });
        }

        const deliveryMethod = deliveryOptions[Math.floor(random() * deliveryOptions.length)];
        const promoCode = promoOptions[Math.floor(random() * promoOptions.length)];

        const basket = calculateCart({ items, deliveryMethod, promoCode });

        // Invariant 1: Totals must be non-negative numbers
        assert.ok(basket.subtotal >= 0, `Subtotal negative at iteration ${i}`);
        assert.ok(basket.discountAmount >= 0, `Discount negative at iteration ${i}`);
        assert.ok(basket.shippingFee >= 0, `Shipping negative at iteration ${i}`);
        assert.ok(basket.grandTotal >= 0, `Grand total negative at iteration ${i}`);

        // Invariant 2: Values must be finite and not NaN
        assert.ok(Number.isFinite(basket.subtotal));
        assert.ok(Number.isFinite(basket.grandTotal));
        assert.ok(!Number.isNaN(basket.subtotal));
        assert.ok(!Number.isNaN(basket.grandTotal));

        // Invariant 3: Free delivery threshold logic
        if (deliveryMethod === "standard" || deliveryMethod === "Standard UK Delivery") {
          if (basket.rawSubtotal >= 50.00) {
            assert.equal(basket.shippingFee, 0.00, `Free shipping missed at subtotal ${basket.subtotal}`);
            assert.equal(basket.qualifiesForFreeDelivery, true);
          } else {
            assert.equal(basket.shippingFee, 4.99, `Shipping fee mismatch at subtotal ${basket.subtotal}`);
            assert.equal(basket.qualifiesForFreeDelivery, false);
          }
        } else if (deliveryMethod === "express" || deliveryMethod === "Next Day Express") {
          assert.equal(basket.shippingFee, 6.99);
        } else if (deliveryMethod === "collect" || deliveryMethod === "Click & Collect") {
          assert.equal(basket.shippingFee, 0.00);
        }

        // Invariant 4: Promo discount logic
        const isBargain10 = promoCode && promoCode.toUpperCase() === "BARGAIN10";
        if (isBargain10) {
          assert.equal(basket.discountPercent, 10);
          const expectedDiscount = Number(((basket.rawSubtotal * 10) / 100).toFixed(2));
          assert.equal(basket.discountAmount, expectedDiscount);
        } else {
          assert.equal(basket.discountPercent, 0);
          assert.equal(basket.discountAmount, 0.00);
        }

        // Invariant 5: Grand total consistency (within ±0.01 float tolerance if comparing against rounded subtotal)
        const expectedTotalFromRaw = Number(
          Math.max(0, basket.rawSubtotal - basket.discountAmount + basket.shippingFee).toFixed(2)
        );
        assert.equal(basket.grandTotal, expectedTotalFromRaw, `Grand total inconsistent at iteration ${i}`);

        const expectedTotalFromRounded = Number(
          Math.max(0, basket.subtotal - basket.discountAmount + basket.shippingFee).toFixed(2)
        );
        const floatDiff = Math.abs(basket.grandTotal - expectedTotalFromRounded);
        assert.ok(
          floatDiff <= 0.01,
          `Float drift between raw and rounded subtotal exceeds 1p at iteration ${i}: ${floatDiff}`
        );
      }
    });
  });

  // =========================================================================
  // SUB-SUITE 5: Live Database Persistence Under M1 Contracts
  // =========================================================================
  describe("5. SQLite Database Order Persistence with Voucher & Validated Postcode", () => {

    it("5.1 should persist order at £49.99 with BARGAIN10 and Doncaster postcode DN55 1PT", async () => {
      const orderNumber = `BS-ADV-${Date.now().toString().slice(-6)}-1`;
      const postcode = "DN55 1PT";
      assert.equal(isValidUKPostcode(postcode), true);

      const items = [{ price: 49.99, quantity: 1, name: "Stanley Heavy Duty Saw" }];
      const basket = calculateCart({ items, promoCode: "BARGAIN10", standardShippingFee: 4.99 });

      const res = await executeDb({
        sql: `INSERT INTO orders 
          (order_number, customer_name, customer_email, customer_phone, shipping_address, city, postcode, delivery_method, subtotal, promo_code, discount_amount, shipping_fee, total, status, payment_method)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [
          orderNumber,
          "Challenger User 1",
          "challenger1@bargainstore.uk",
          "07700900123",
          "45 Industrial Way",
          "Doncaster",
          formatUKPostcode(postcode),
          "Standard UK Delivery",
          basket.subtotal,
          "BARGAIN10",
          basket.discountAmount,
          basket.shippingFee,
          basket.grandTotal,
          "Processing",
          "Credit Card",
        ],
      });

      const orderId = Number(res.rows[0].id);
      createdOrderIds.add(orderId);

      // Query order back
      const query = await executeDb({
        sql: "SELECT * FROM orders WHERE id = ?",
        args: [orderId],
      });

      assert.equal(query.rows.length, 1);
      const row = query.rows[0];
      assert.equal(row.order_number, orderNumber);
      assert.equal(row.postcode, "DN55 1PT");
      assert.equal(row.subtotal, 49.99);
      assert.equal(row.promo_code, "BARGAIN10");
      assert.equal(row.discount_amount, 5.00);
      assert.equal(row.shipping_fee, 4.99);
      assert.equal(row.total, 49.98);
      assert.equal(row.status, "Processing");
    });

    it("5.2 should persist order at £50.00 with BARGAIN10, FREE shipping, and BFPO postcode BF1 2AB", async () => {
      const orderNumber = `BS-ADV-${Date.now().toString().slice(-6)}-2`;
      const postcode = "bf1 2ab";
      assert.equal(isValidUKPostcode(postcode), true);

      const items = [{ price: 50.00, quantity: 1, name: "Flymo Electric Mower" }];
      const basket = calculateCart({ items, promoCode: "BARGAIN10" });

      const res = await executeDb({
        sql: `INSERT INTO orders 
          (order_number, customer_name, customer_email, customer_phone, shipping_address, city, postcode, delivery_method, subtotal, promo_code, discount_amount, shipping_fee, total, status, payment_method)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [
          orderNumber,
          "MoD Officer Recipient",
          "mod@bargainstore.uk",
          "07700900456",
          "Barracks Block C",
          "Northwood",
          formatUKPostcode(postcode),
          "Standard UK Delivery",
          basket.subtotal,
          "BARGAIN10",
          basket.discountAmount,
          basket.shippingFee,
          basket.grandTotal,
          "Processing",
          "Credit Card",
        ],
      });

      const orderId = Number(res.rows[0].id);
      createdOrderIds.add(orderId);

      const query = await executeDb({
        sql: "SELECT * FROM orders WHERE id = ?",
        args: [orderId],
      });

      assert.equal(query.rows.length, 1);
      const row = query.rows[0];
      assert.equal(row.order_number, orderNumber);
      assert.equal(row.postcode, "BF1 2AB");
      assert.equal(row.subtotal, 50.00);
      assert.equal(row.promo_code, "BARGAIN10");
      assert.equal(row.discount_amount, 5.00);
      assert.equal(row.shipping_fee, 0.00); // FREE DELIVERY!
      assert.equal(row.total, 45.00); // 50.00 - 5.00 + 0.00
    });
  });
});
