import { NextResponse } from "next/server";
import { db, ensureDbReady } from "@/db";
import { products } from "@/db/schema";
import { or, like } from "drizzle-orm";
import { DEFAULT_PRODUCTS } from "@/lib/seed-data";

export async function GET(request: Request) {
  try {
    await ensureDbReady();
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

    if (results.length > 0) {
      return NextResponse.json({ products: results });
    }

    // Fallback in-memory search
    const lower = query.toLowerCase().trim();
    const fallbackResults = DEFAULT_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.categorySlug.toLowerCase().includes(lower)
    ).slice(0, 6);

    return NextResponse.json({ products: fallbackResults });
  } catch (err: any) {
    console.error("Search API error:", err);
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").toLowerCase().trim();
    const fallbackResults = DEFAULT_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.categorySlug.toLowerCase().includes(query)
    ).slice(0, 6);
    return NextResponse.json({ products: fallbackResults });
  }
}
