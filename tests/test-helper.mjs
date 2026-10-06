import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, "..");

// 1. Database Client
const dbUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
const dbAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const dbClient = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

export async function executeDb(stmt, maxRetries = 25) {
  let attempt = 0;
  while (true) {
    try {
      return await dbClient.execute(stmt);
    } catch (err) {
      const isBusy =
        err.code === "SQLITE_BUSY" ||
        err.message?.includes("database is locked") ||
        err.message?.includes("busy");
      if (isBusy && attempt < maxRetries) {
        attempt++;
        await new Promise((r) => setTimeout(r, 25 + Math.random() * 50));
        continue;
      }
      throw err;
    }
  }
}

// Track created IDs for test teardown
export const createdOrderIds = new Set();
export const createdProductIds = new Set();

export async function cleanupTestData() {
  try {
    for (const orderId of createdOrderIds) {
      await executeDb({
        sql: "DELETE FROM order_items WHERE order_id = ?",
        args: [orderId],
      });
      await executeDb({
        sql: "DELETE FROM orders WHERE id = ?",
        args: [orderId],
      });
    }
    createdOrderIds.clear();

    for (const prodId of createdProductIds) {
      await executeDb({
        sql: "DELETE FROM products WHERE id = ?",
        args: [prodId],
      });
    }
    createdProductIds.clear();
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

// Database helper functions
export async function getDbProducts(limit = 100) {
  const res = await executeDb({
    sql: "SELECT * FROM products ORDER BY id DESC LIMIT ?",
    args: [limit],
  });
  return res.rows;
}

export async function getDbProductById(id) {
  const res = await executeDb({
    sql: "SELECT * FROM products WHERE id = ? LIMIT 1",
    args: [id],
  });
  return res.rows[0] || null;
}

export async function getDbProductBySlug(slug) {
  const res = await executeDb({
    sql: "SELECT * FROM products WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  return res.rows[0] || null;
}

export async function searchDbProducts(term, limit = 6) {
  if (!term || !term.trim()) return [];
  const wildcard = `%${term.trim()}%`;
  const res = await executeDb({
    sql: `SELECT * FROM products 
          WHERE name LIKE ? OR brand LIKE ? OR category_slug LIKE ? OR description LIKE ? 
          LIMIT ?`,
    args: [wildcard, wildcard, wildcard, wildcard, limit],
  });
  return res.rows;
}

export async function getDbCategories() {
  const res = await executeDb("SELECT * FROM categories ORDER BY id ASC");
  return res.rows;
}

export async function getDbCategoryBySlug(slug) {
  const res = await executeDb({
    sql: "SELECT * FROM categories WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  return res.rows[0] || null;
}

export async function getDbOrders() {
  const res = await executeDb("SELECT * FROM orders ORDER BY id DESC");
  return res.rows;
}

export async function getDbOrderByNumber(orderNumber) {
  const orderRes = await executeDb({
    sql: "SELECT * FROM orders WHERE order_number = ? LIMIT 1",
    args: [orderNumber],
  });
  const order = orderRes.rows[0];
  if (!order) return null;

  const itemsRes = await executeDb({
    sql: "SELECT * FROM order_items WHERE order_id = ?",
    args: [order.id],
  });
  order.items = itemsRes.rows;
  return order;
}

export async function insertDbOrder(orderData, items = []) {
  const randomDigits = Math.floor(Math.random() * 900000 + 100000);
  const orderNumber = orderData.orderNumber || `BS-${Date.now()}${randomDigits}`;
  const res = await executeDb({
    sql: `INSERT INTO orders 
      (order_number, customer_name, customer_email, customer_phone, shipping_address, city, postcode, delivery_method, subtotal, shipping_fee, total, status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      orderNumber,
      orderData.customerName,
      orderData.customerEmail,
      orderData.customerPhone || null,
      orderData.shippingAddress,
      orderData.city,
      orderData.postcode,
      orderData.deliveryMethod || "Standard UK Delivery",
      Number(orderData.subtotal),
      Number(orderData.shippingFee || 0),
      Number(orderData.total),
      orderData.status || "Processing",
      orderData.paymentMethod || "Credit Card",
    ],
  });

  const orderId = Number(res.rows[0].id);
  createdOrderIds.add(orderId);

  for (const item of items) {
    await executeDb({
      sql: `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        orderId,
        item.id || item.productId || 1,
        item.name || item.productName || "Product",
        Number(item.price),
        Number(item.quantity || 1),
        item.image || null,
      ],
    });
  }

  return { orderId, orderNumber };
}

export async function updateDbOrderStatus(orderId, status) {
  await executeDb({
    sql: "UPDATE orders SET status = ? WHERE id = ?",
    args: [status, orderId],
  });
}

export async function insertDbProduct(productData) {
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  const slug = productData.slug || 
    productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}-${randomSuffix}`;
  const price = Number(productData.price);
  const comparePrice = productData.comparePrice ? Number(productData.comparePrice) : null;
  const savingAmount = comparePrice && comparePrice > price ? comparePrice - price : null;

  const res = await executeDb({
    sql: `INSERT INTO products 
      (slug, name, category_slug, brand, description, price, compare_price, competitor_name, saving_amount, badge, image, stock, rating, review_count, is_staff_pick, is_featured, is_deal_of_the_day)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      slug,
      productData.name,
      productData.categorySlug || "diy-decorating",
      productData.brand,
      productData.description || "Quality British hardware product.",
      price,
      comparePrice,
      productData.competitorName || "Amazon",
      savingAmount,
      productData.badge || (savingAmount ? `You save £${savingAmount.toFixed(2)}` : null),
      productData.image || "/assets/products/black-decker-multitool.webp",
      productData.stock !== undefined ? Number(productData.stock) : 25,
      productData.rating !== undefined ? Number(productData.rating) : 4.8,
      productData.reviewCount !== undefined ? Number(productData.reviewCount) : 10,
      productData.isStaffPick ? 1 : 0,
      productData.isFeatured ? 1 : 0,
      productData.isDealOfTheDay ? 1 : 0,
    ],
  });

  const productId = Number(res.rows[0].id);
  createdProductIds.add(productId);
  return { id: productId, slug };
}

export async function deleteDbProduct(productId) {
  await executeDb({
    sql: "DELETE FROM products WHERE id = ?",
    args: [productId],
  });
  createdProductIds.delete(productId);
}

// 2. UK Postcode Validation
// Canonical UK Postcode Regex specified in PROJECT.md and UK Gov standard
export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

export function isValidUKPostcode(postcode) {
  if (typeof postcode !== "string") return false;
  const trimmed = postcode.trim();
  if (!trimmed) return false;
  return UK_POSTCODE_REGEX.test(trimmed);
}

// 3. Basket & Voucher Math
export function calculateBasket({
  items = [],
  promoCode = null,
  deliveryMethod = "standard",
  standardShippingFee = 4.99,
  freeDeliveryThreshold = 50.0,
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  let discountPercent = 0;
  if (promoCode && promoCode.trim().toUpperCase() === "BARGAIN10") {
    discountPercent = 10;
  }

  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));

  let shippingFee = 0;
  if (deliveryMethod === "express") {
    shippingFee = 6.99;
  } else if (deliveryMethod === "collect") {
    shippingFee = 0.0;
  } else {
    // standard
    shippingFee = subtotal >= freeDeliveryThreshold ? 0.0 : standardShippingFee;
  }

  const grandTotal = Number(
    Math.max(0, subtotal - discountAmount + (items.length === 0 ? 0 : shippingFee)).toFixed(2)
  );

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountPercent,
    discountAmount,
    shippingFee: Number(shippingFee.toFixed(2)),
    grandTotal,
    qualifiesForFreeDelivery: subtotal >= freeDeliveryThreshold,
    amountNeededForFreeDelivery: Math.max(0, Number((freeDeliveryThreshold - subtotal).toFixed(2))),
  };
}

// 4. Asset Validation
export function verifyWebPFile(relativeOrAbsolutePath) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(PROJECT_ROOT, relativeOrAbsolutePath);

  if (!fs.existsSync(filePath)) {
    return { valid: false, error: `File not found: ${filePath}` };
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    return { valid: false, error: "File is empty (0 bytes)" };
  }

  const buffer = Buffer.alloc(12);
  const fd = fs.openSync(filePath, "r");
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  // Check magic bytes: RIFF .... WEBP
  const isRiff = buffer.toString("ascii", 0, 4) === "RIFF";
  const isWebp = buffer.toString("ascii", 8, 12) === "WEBP";

  if (!isRiff || !isWebp) {
    return { valid: false, error: "Invalid WebP magic bytes header" };
  }

  return { valid: true, sizeBytes: stat.size, path: filePath };
}

// 5. Admin Metrics
export async function calculateAdminMetrics() {
  const [productsRes, ordersRes] = await Promise.all([
    executeDb("SELECT price, stock FROM products"),
    executeDb("SELECT total FROM orders"),
  ]);

  const totalRevenue = ordersRes.rows.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const orderCount = ordersRes.rows.length;
  const productCount = productsRes.rows.length;
  const lowStockCount = productsRes.rows.filter((p) => Number(p.stock) <= 15).length;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    orderCount,
    productCount,
    lowStockCount,
  };
}
