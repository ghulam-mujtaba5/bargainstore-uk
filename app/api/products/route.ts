import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = db.select().from(products);
    let list;
    if (category) {
      list = await db
        .select()
        .from(products)
        .where(eq(products.categorySlug, category))
        .orderBy(desc(products.id));
    } else {
      list = await db.select().from(products).orderBy(desc(products.id));
    }

    return NextResponse.json({ products: list });
  } catch (err: any) {
    console.error("Products GET API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      categorySlug,
      brand,
      description,
      price,
      comparePrice,
      competitorName,
      image,
      stock,
      badge,
    } = body;

    if (!name || !price || !categorySlug || !brand) {
      return NextResponse.json(
        { error: "Name, price, category, and brand are required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const numPrice = Number(price);
    const numCompare = comparePrice ? Number(comparePrice) : null;
    const savingAmount =
      numCompare && numCompare > numPrice ? numCompare - numPrice : null;

    const res = await db.insert(products).values({
      slug,
      name,
      categorySlug,
      brand,
      description: description || "Quality British hardware product.",
      price: numPrice,
      comparePrice: numCompare,
      competitorName: competitorName || "Amazon",
      savingAmount,
      badge: badge || (savingAmount ? `You save £${savingAmount.toFixed(2)}` : null),
      image: image || "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80",
      stock: stock ? Number(stock) : 20,
      rating: 4.8,
      reviewCount: 1,
      isStaffPick: 0,
      isFeatured: 1,
      isDealOfTheDay: 0,
    }).returning();

    return NextResponse.json({ product: res[0], success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Products POST API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
