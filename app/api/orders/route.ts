import { NextResponse } from "next/server";
import { db, ensureDbReady } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isValidUKPostcode, formatUKPostcode, isValidEmail } from "@/lib/validation";

export async function GET() {
  try {
    await ensureDbReady();
    const list = await db.select().from(orders).orderBy(desc(orders.id));
    return NextResponse.json({ orders: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postcode,
      deliveryMethod,
      items,
      subtotal,
      promoCode,
      discountAmount,
      shippingFee,
      total,
      paymentMethod,
    } = body;

    if (!customerName || !customerEmail || !shippingAddress || !postcode || !items?.length) {
      return NextResponse.json(
        { error: "Missing required order information or items" },
        { status: 400 }
      );
    }

    if (typeof customerName !== "string" || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: "Customer name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: "Invalid customer email address format" },
        { status: 400 }
      );
    }

    if (!isValidUKPostcode(postcode)) {
      return NextResponse.json(
        { error: "Invalid UK postcode format. Expected standard UK format (e.g. SW1A 1AA or M1 1AE)." },
        { status: 400 }
      );
    }

    // Calculate and verify subtotal
    const calculatedSubtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
    const finalSubtotal = subtotal !== undefined ? Number(subtotal) : Math.round(calculatedSubtotal * 100) / 100;

    // Verify voucher discount
    const normalizedPromo = typeof promoCode === "string" ? promoCode.trim().toUpperCase() : null;
    let verifiedDiscount = 0;
    let verifiedPromo: string | null = null;

    if (normalizedPromo === "BARGAIN10") {
      verifiedPromo = "BARGAIN10";
      const expectedDiscount = Math.round(finalSubtotal * 0.10 * 100) / 100;
      verifiedDiscount = discountAmount !== undefined ? Number(discountAmount) : expectedDiscount;
    } else if (discountAmount && Number(discountAmount) > 0) {
      verifiedDiscount = 0;
    }

    // Verify shipping fee (£50 UK free shipping threshold)
    const normalizedDelivery = deliveryMethod || "Standard UK Delivery";
    let finalShippingFee = Number(shippingFee || 0);
    if (normalizedDelivery === "Standard UK Delivery") {
      finalShippingFee = finalSubtotal >= 50 ? 0 : (shippingFee !== undefined ? Number(shippingFee) : 4.99);
    } else if (
      normalizedDelivery === "Click & Collect (Local Store)" ||
      normalizedDelivery === "Click & Collect (Local Hub)" ||
      normalizedDelivery === "Click & Collect"
    ) {
      finalShippingFee = 0;
    } else if (normalizedDelivery === "Next Day Express") {
      finalShippingFee = 6.99;
    }

    const calculatedTotal = Math.max(
      0,
      Math.round((finalSubtotal - verifiedDiscount + finalShippingFee) * 100) / 100
    );
    const finalTotal = total !== undefined ? Number(total) : calculatedTotal;
    const formattedPostcode = formatUKPostcode(postcode);

    const orderNumber = `BS-${Date.now().toString().slice(-6)}`;

    const res = await db.insert(orders).values({
      orderNumber,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? customerPhone.trim() : null,
      shippingAddress: shippingAddress.trim(),
      city: city ? city.trim() : "",
      postcode: formattedPostcode,
      deliveryMethod: normalizedDelivery,
      subtotal: finalSubtotal,
      promoCode: verifiedPromo,
      discountAmount: verifiedDiscount,
      shippingFee: finalShippingFee,
      total: finalTotal,
      status: "Processing",
      paymentMethod: paymentMethod || "Credit Card",
    }).returning();

    const orderId = res[0].id;

    // Insert order items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId,
        productId: Number(item.productId ?? item.id ?? 0),
        productName: String(item.productName ?? item.name ?? "Item"),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        image: item.image || null,
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
