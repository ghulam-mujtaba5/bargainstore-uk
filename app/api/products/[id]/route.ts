import { NextResponse } from "next/server";
import { db, ensureDbReady } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_PRODUCTS } from "@/lib/seed-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbReady();
    const { id } = await params;
    const prod = await db
      .select()
      .from(products)
      .where(eq(products.id, Number(id)))
      .limit(1);

    if (prod.length > 0) {
      return NextResponse.json({ product: prod[0] });
    }

    const fallback = DEFAULT_PRODUCTS.find((p) => p.id === Number(id));
    if (fallback) {
      return NextResponse.json({ product: fallback });
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbReady();
    const { id } = await params;
    const body = await request.json();

    const numPrice = Number(body.price);
    const numCompare = body.comparePrice ? Number(body.comparePrice) : null;
    const savingAmount =
      numCompare && numCompare > numPrice ? numCompare - numPrice : null;

    const updateData: Record<string, any> = {
      name: body.name,
      categorySlug: body.categorySlug,
      brand: body.brand,
      description: body.description,
      price: numPrice,
      comparePrice: numCompare,
      competitorName: body.competitorName || "Amazon",
      savingAmount,
      badge: body.badge,
      image: body.image,
      stock: Number(body.stock ?? 0),
    };

    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured ? 1 : 0;
    if (body.isStaffPick !== undefined) updateData.isStaffPick = body.isStaffPick ? 1 : 0;
    if (body.isDealOfTheDay !== undefined) updateData.isDealOfTheDay = body.isDealOfTheDay ? 1 : 0;
    if (body.specs !== undefined) updateData.specs = body.specs;

    await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbReady();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {};
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured ? 1 : 0;
    if (body.isStaffPick !== undefined) updateData.isStaffPick = body.isStaffPick ? 1 : 0;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbReady();
    const { id } = await params;
    await db.delete(products).where(eq(products.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
