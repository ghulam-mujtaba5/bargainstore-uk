import { NextResponse } from "next/server";
import { client } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
    const isCloud = rawUrl.startsWith("libsql://") || rawUrl.includes("turso.io");
    const hasAuthToken = Boolean(process.env.TURSO_AUTH_TOKEN);

    // Fetch table stats
    const [pCountRes, cCountRes, oCountRes, oiCountRes] = await Promise.all([
      client.execute("SELECT COUNT(*) as c FROM products;"),
      client.execute("SELECT COUNT(*) as c FROM categories;"),
      client.execute("SELECT COUNT(*) as c FROM orders;"),
      client.execute("SELECT COUNT(*) as c FROM order_items;"),
    ]);

    const productCount = Number(pCountRes.rows[0]?.c || 0);
    const categoryCount = Number(cCountRes.rows[0]?.c || 0);
    const orderCount = Number(oCountRes.rows[0]?.c || 0);
    const orderItemCount = Number(oiCountRes.rows[0]?.c || 0);

    return NextResponse.json({
      connected: true,
      status: "connected",
      databaseUrl: rawUrl.startsWith("libsql://")
        ? rawUrl.replace(/:[^:]*@/, ":***@")
        : rawUrl,
      isCloud,
      hasAuthToken,
      counts: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        order_items: orderItemCount,
      },
      tursoDashboardUrl: "https://app.turso.tech/ghulam--mujtaba",
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      status: "error",
      error: err.message,
      databaseUrl: process.env.TURSO_DATABASE_URL || "file:local.db",
      counts: {
        products: 0,
        categories: 0,
        orders: 0,
        order_items: 0,
      },
      tursoDashboardUrl: "https://app.turso.tech/ghulam--mujtaba",
    });
  }
}
