import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  image: text("image"),
  featured: integer("featured").default(1),
  itemCount: integer("item_count").default(0),
  subcategories: text("subcategories"), // JSON string array
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  categorySlug: text("category_slug").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  specs: text("specs"), // JSON string
  price: real("price").notNull(),
  comparePrice: real("compare_price"),
  competitorName: text("competitor_name").default("Amazon"),
  savingAmount: real("saving_amount"),
  badge: text("badge"),
  image: text("image").notNull(),
  additionalImages: text("additional_images"), // JSON string array
  stock: integer("stock").default(25),
  rating: real("rating").default(4.8),
  reviewCount: integer("review_count").default(18),
  isStaffPick: integer("is_staff_pick").default(0),
  isFeatured: integer("is_featured").default(0),
  isDealOfTheDay: integer("is_deal_of_the_day").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  city: text("city").notNull(),
  postcode: text("postcode").notNull(),
  deliveryMethod: text("delivery_method").default("Standard UK Delivery"),
  subtotal: real("subtotal").notNull(),
  promoCode: text("promo_code"),
  discountAmount: real("discount_amount").default(0),
  shippingFee: real("shipping_fee").default(0),
  total: real("total").notNull(),
  status: text("status").default("Processing"), // Pending, Processing, Shipped, Delivered
  paymentMethod: text("payment_method").default("Card"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull(),
  image: text("image"),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
