import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { or, like, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ products: [] });
    }

    const term = `%${query.trim()}%`;
    const results = await db
      .select()
      .from(products)
      .where(
        or(
          like(products.name, term),
          like(products.brand, term),
          like(products.categorySlug, term),
          like(products.description, term)
        )
      )
      .limit(6);

    return NextResponse.json({ products: results });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: err.message, products: [] }, { status: 500 });
  }
}
