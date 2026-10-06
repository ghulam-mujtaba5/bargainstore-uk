import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

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
}
