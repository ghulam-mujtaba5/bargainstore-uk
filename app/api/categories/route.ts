import { NextResponse } from "next/server";
import { db, ensureDbReady } from "@/db";
import { categories } from "@/db/schema";
import { DEFAULT_CATEGORIES } from "@/lib/seed-data";

export async function GET() {
  try {
    await ensureDbReady();
    const list = await db.select().from(categories).orderBy(categories.id);
    return NextResponse.json({ categories: list.length > 0 ? list : DEFAULT_CATEGORIES });
  } catch (err: any) {
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}
