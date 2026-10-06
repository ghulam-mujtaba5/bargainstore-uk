import { NextResponse } from "next/server";
import { db, ensureDbReady } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbReady();
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON or empty request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { status } = body;

    if (!status || typeof status !== "string" || !ALLOWED_STATUSES.includes(status as any)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Verify order exists before performing update
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: `Order #${orderId} not found` },
        { status: 404 }
      );
    }

    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        status,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
