import { db } from "@/db";
import { products, categories, orders, orderItems } from "@/db/schema";
import { eq, desc, like, or } from "drizzle-orm";
import { Product, Category, Order } from "./types";

export async function getAllProducts(): Promise<Product[]> {
  try {
    const list = await db.select().from(products).orderBy(desc(products.id));
    return list as Product[];
  } catch (e) {
    console.error("Error fetching products:", e);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const list = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return (list[0] as Product) || null;
  } catch (e) {
    console.error("Error fetching product by slug:", e);
    return null;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const list = await db
      .select()
      .from(products)
      .where(eq(products.categorySlug, categorySlug))
      .orderBy(desc(products.id));
    return list as Product[];
  } catch (e) {
    console.error("Error fetching products by category:", e);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const list = await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, 1))
      .limit(8);
    return list as Product[];
  } catch (e) {
    console.error("Error fetching featured products:", e);
    return [];
  }
}

export async function getStaffPicks(): Promise<Product[]> {
  try {
    const list = await db
      .select()
      .from(products)
      .where(eq(products.isStaffPick, 1))
      .limit(6);
    return list as Product[];
  } catch (e) {
    console.error("Error fetching staff picks:", e);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const list = await db.select().from(categories).orderBy(categories.id);
    return list as Category[];
  } catch (e) {
    console.error("Error fetching categories:", e);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const list = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return (list[0] as Category) || null;
  } catch (e) {
    console.error("Error fetching category by slug:", e);
    return null;
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!id || isNaN(id) || !isFinite(id)) return null;
  try {
    const list = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return (list[0] as Product) || null;
  } catch (e) {
    console.error("Error fetching product by id:", e);
    return null;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const list = await db.select().from(orders).orderBy(desc(orders.id));
    return list as Order[];
  } catch (e) {
    console.error("Error fetching orders:", e);
    return [];
  }
}

export async function getAllOrdersWithItems(): Promise<Order[]> {
  try {
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

