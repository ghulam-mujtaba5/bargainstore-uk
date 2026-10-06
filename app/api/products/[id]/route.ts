import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prod = await db
      .select()
      .from(products)
      .where(eq(products.id, Number(id)))
      .limit(1);

    if (!prod.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: prod[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const numPrice = Number(body.price);
    const numCompare = body.comparePrice ? Number(body.comparePrice) : null;
    const savingAmount =
      numCompare && numCompare > numPrice ? numCompare - numPrice : null;

    await db
      .update(products)
      .set({
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
        stock: Number(body.stock),
      })
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
    const { id } = await params;
    await db.delete(products).where(eq(products.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
