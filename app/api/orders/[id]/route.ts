import { NextResponse } from "next/server";
import { db } from "@/db";
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
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body || {};

    if (!status || !ALLOWED_STATUSES.includes(status as any)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 }
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
