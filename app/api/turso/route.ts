import { NextResponse } from "next/server";
import { client } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
    const databaseUrl = rawUrl.startsWith("libsql://")
      ? rawUrl.replace(/:[^:]*@/, ":***@")
      : rawUrl;

    const [pRes, cRes, oRes, oiRes] = await Promise.all([
      client.execute("SELECT COUNT(*) as c FROM products;"),
      client.execute("SELECT COUNT(*) as c FROM categories;"),
      client.execute("SELECT COUNT(*) as c FROM orders;"),
      client.execute("SELECT COUNT(*) as c FROM order_items;"),
    ]);

    const counts = {
      products: Number(pRes.rows[0]?.c || 0),
      categories: Number(cRes.rows[0]?.c || 0),
      orders: Number(oRes.rows[0]?.c || 0),
      order_items: Number(oiRes.rows[0]?.c || 0),
    };

    return NextResponse.json({
      status: "connected",
      databaseUrl,
      counts,
      tursoDashboardUrl: "https://app.turso.tech/ghulam--mujtaba",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
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
      },
      { status: 500 }
    );
  }
}
