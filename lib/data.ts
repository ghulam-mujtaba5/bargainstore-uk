import { db, ensureDbReady } from "@/db";
import { products, categories, orders, orderItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Product, Category, Order } from "./types";
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from "./seed-data";

export async function getAllProducts(): Promise<Product[]> {
  try {
    await ensureDbReady();
    const list = await db.select().from(products).orderBy(desc(products.id));
    return list.length > 0 ? (list as Product[]) : DEFAULT_PRODUCTS;
  } catch (e) {
    console.error("Error fetching products:", e);
    return DEFAULT_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    await ensureDbReady();
    const list = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (list.length > 0) return list[0] as Product;
    return DEFAULT_PRODUCTS.find((p) => p.slug === slug) || null;
  } catch (e) {
    console.error("Error fetching product by slug:", e);
    return DEFAULT_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    await ensureDbReady();
    const list = await db
      .select()
      .from(products)
      .where(eq(products.categorySlug, categorySlug))
      .orderBy(desc(products.id));
    if (list.length > 0) return list as Product[];
    return DEFAULT_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
  } catch (e) {
    console.error("Error fetching products by category:", e);
    return DEFAULT_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    await ensureDbReady();
    const list = await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, 1))
      .limit(8);
    if (list.length > 0) return list as Product[];
    return DEFAULT_PRODUCTS.filter((p) => p.isFeatured === 1).slice(0, 8);
  } catch (e) {
    console.error("Error fetching featured products:", e);
    return DEFAULT_PRODUCTS.filter((p) => p.isFeatured === 1).slice(0, 8);
  }
}

export async function getStaffPicks(): Promise<Product[]> {
  try {
    await ensureDbReady();
    const list = await db
      .select()
      .from(products)
      .where(eq(products.isStaffPick, 1))
      .limit(6);
    if (list.length > 0) return list as Product[];
    return DEFAULT_PRODUCTS.filter((p) => p.isStaffPick === 1).slice(0, 6);
  } catch (e) {
    console.error("Error fetching staff picks:", e);
    return DEFAULT_PRODUCTS.filter((p) => p.isStaffPick === 1).slice(0, 6);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    await ensureDbReady();
    const list = await db.select().from(categories).orderBy(categories.id);
    return list.length > 0 ? (list as Category[]) : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error("Error fetching categories:", e);
    return DEFAULT_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    await ensureDbReady();
    const list = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (list.length > 0) return list[0] as Category;
    return DEFAULT_CATEGORIES.find((c) => c.slug === slug) || null;
  } catch (e) {
    console.error("Error fetching category by slug:", e);
    return DEFAULT_CATEGORIES.find((c) => c.slug === slug) || null;
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!id || isNaN(id) || !isFinite(id)) return null;
  try {
    await ensureDbReady();
    const list = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (list.length > 0) return list[0] as Product;
    return DEFAULT_PRODUCTS.find((p) => p.id === id) || null;
  } catch (e) {
    console.error("Error fetching product by id:", e);
    return DEFAULT_PRODUCTS.find((p) => p.id === id) || null;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    await ensureDbReady();
    const list = await db.select().from(orders).orderBy(desc(orders.id));
    return list as Order[];
  } catch (e) {
    console.error("Error fetching orders:", e);
    return [];
  }
}

export async function getAllOrdersWithItems(): Promise<Order[]> {
  try {
    await ensureDbReady();
    const orderList = await db.select().from(orders).orderBy(desc(orders.id));
    if (orderList.length === 0) return [];

    const items = await db.select().from(orderItems);
    const itemsByOrderId = new Map<number, typeof items>();
    for (const item of items) {
      if (!itemsByOrderId.has(item.orderId)) {
        itemsByOrderId.set(item.orderId, []);
      }
      itemsByOrderId.get(item.orderId)!.push(item);
    }

    return orderList.map((o) => ({
      ...o,
      items: itemsByOrderId.get(o.id) || [],
    })) as Order[];
  } catch (e) {
    console.error("Error fetching orders with items:", e);
    return [];
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    await ensureDbReady();
    const list = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!list.length) return null;
    const order = list[0] as Order;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    order.items = items;
    return order;
  } catch (e) {
    console.error("Error fetching order by number:", e);
    return null;
  }
}
