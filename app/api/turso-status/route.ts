import { NextResponse } from "next/server";
import { client } from "@/db";

export async function GET() {
  try {
    const rawUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
    const isCloud = rawUrl.startsWith("libsql://") || rawUrl.includes("turso.io");
    const hasAuthToken = Boolean(process.env.TURSO_AUTH_TOKEN);

    // Fetch table stats
    const pCountRes = await client.execute("SELECT COUNT(*) as c FROM products;");
    const cCountRes = await client.execute("SELECT COUNT(*) as c FROM categories;");
    const oCountRes = await client.execute("SELECT COUNT(*) as c FROM orders;");

    const productCount = Number(pCountRes.rows[0]?.c || 0);
    const categoryCount = Number(cCountRes.rows[0]?.c || 0);
    const orderCount = Number(oCountRes.rows[0]?.c || 0);

    return NextResponse.json({
      connected: true,
      databaseUrl: rawUrl.startsWith("libsql://")
        ? rawUrl.replace(/:[^:]*@/, ":***@")
        : rawUrl,
      isCloud,
      hasAuthToken,
      counts: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
      },
      tursoDashboardUrl: "https://app.turso.tech/ghulam--mujtaba",
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message,
      databaseUrl: process.env.TURSO_DATABASE_URL || "file:local.db",
      tursoDashboardUrl: "https://app.turso.tech/ghulam--mujtaba",
    });
  }
}
