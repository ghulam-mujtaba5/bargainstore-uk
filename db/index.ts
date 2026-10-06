import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from "@/lib/seed-data";

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL_ENV;
const defaultDbUrl = isVercel ? "file:/tmp/local.db" : "file:local.db";
const url = process.env.TURSO_DATABASE_URL || defaultDbUrl;
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Helper to ensure database tables are created automatically on startup
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      image TEXT,
      featured INTEGER DEFAULT 1,
      item_count INTEGER DEFAULT 0,
      subcategories TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      brand TEXT NOT NULL,
      description TEXT NOT NULL,
      specs TEXT,
      price REAL NOT NULL,
      compare_price REAL,
      competitor_name TEXT DEFAULT 'Amazon',
      saving_amount REAL,
      badge TEXT,
      image TEXT NOT NULL,
      additional_images TEXT,
      stock INTEGER DEFAULT 25,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 18,
      is_staff_pick INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_deal_of_the_day INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postcode TEXT NOT NULL,
      delivery_method TEXT DEFAULT 'Standard UK Delivery',
      subtotal REAL NOT NULL,
      promo_code TEXT,
      discount_amount REAL DEFAULT 0,
      shipping_fee REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Processing',
      payment_method TEXT DEFAULT 'Card',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT
    );
  `);

  // Self-healing migration for existing databases
  try {
    await client.execute(`ALTER TABLE orders ADD COLUMN promo_code TEXT;`);
  } catch (_) {
    // Column already exists
  }
  try {
    await client.execute(`ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;`);
  } catch (_) {
    // Column already exists
  }

  // Seed default categories and products if empty
  try {
    const catCheck = await client.execute(`SELECT count(*) as count FROM categories;`);
    const count = Number(catCheck.rows[0]?.count || 0);
    if (count === 0) {
      for (const c of DEFAULT_CATEGORIES) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO categories (slug, name, description, icon, image, featured, item_count, subcategories)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            c.slug,
            c.name,
            c.description ?? null,
            c.icon ?? null,
            c.image ?? null,
            c.featured ?? 1,
            c.itemCount ?? 0,
            c.subcategories ?? null,
          ],
        });
      }

      for (const p of DEFAULT_PRODUCTS) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO products (slug, name, category_slug, brand, description, specs, price, compare_price, competitor_name, saving_amount, badge, image, additional_images, stock, rating, review_count, is_staff_pick, is_featured, is_deal_of_the_day)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.slug,
            p.name,
            p.categorySlug,
            p.brand,
            p.description,
            p.specs ?? null,
            p.price,
            p.comparePrice ?? null,
            p.competitorName ?? "Amazon",
            p.savingAmount ?? null,
            p.badge ?? null,
            p.image,
            p.additionalImages ?? null,
            p.stock,
            p.rating,
            p.reviewCount,
            p.isStaffPick,
            p.isFeatured,
            p.isDealOfTheDay,
          ],
        });
      }
    }
  } catch (err) {
    console.error("Auto-seed error:", err);
  }
}

export async function ensureDbReady() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = initDb()
      .then(() => {
        isInitialized = true;
      })
      .catch((err) => {
        console.error("Failed to initialize database:", err);
      });
  }
  await initPromise;
}
