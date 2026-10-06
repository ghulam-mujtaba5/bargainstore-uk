import React from "react";
import { client } from "@/db";
import { Database, ExternalLink, CheckCircle2, ShieldCheck, Terminal, Server, RefreshCw } from "lucide-react";
import TursoPingTester from "@/components/TursoPingTester";

export const revalidate = 0;

export default async function TursoManagerPage() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
  const hasToken = Boolean(process.env.TURSO_AUTH_TOKEN);
  const isCloud = tursoUrl.startsWith("libsql://") || tursoUrl.includes("turso.io");

  // Fetch counts from the active DB
  let counts = { products: 0, categories: 0, orders: 0, orderItems: 0 };
  let error: string | null = null;

  try {
    const p = await client.execute("SELECT COUNT(*) as c FROM products;");
    const c = await client.execute("SELECT COUNT(*) as c FROM categories;");
    const o = await client.execute("SELECT COUNT(*) as c FROM orders;");
    const oi = await client.execute("SELECT COUNT(*) as c FROM order_items;");

    counts = {
      products: Number(p.rows[0]?.c || 0),
      categories: Number(c.rows[0]?.c || 0),
      orders: Number(o.rows[0]?.c || 0),
      orderItems: Number(oi.rows[0]?.c || 0),
    };
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2.5">
          <Database className="w-7 h-7 text-purple-600" />
          <span>Turso Edge Database Manager</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          BargainStore.uk is powered by <strong>Turso</strong> (libSQL distributed edge SQLite) with <strong>Drizzle ORM</strong>.
        </p>
      </div>

      {/* Cloud Link Callout */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-purple-500/30 text-purple-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-400/20">
              Turso Cloud Account
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-2 font-mono">
              app.turso.tech/ghulam--mujtaba
            </h2>
            <p className="text-xs text-purple-200/80 max-w-xl mt-1 leading-relaxed">
              Supervise databases, create edge replicas, inspect schemas, rotate authentication tokens, and view edge metrics directly from your official Turso Cloud console.
            </p>
          </div>

          <a
            href="https://app.turso.tech/ghulam--mujtaba"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-2 flex-shrink-0"
          >
            <span>Open Turso Dashboard</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Interactive Ping & Latency Tester */}
      <TursoPingTester />

      {/* Current Connection Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-2xs">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          Active Database Connection Status
        </h2>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            Connection error: {error}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-gray-100">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                Connection Mode
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Server className="w-4 h-4 text-purple-600" />
                <span>{isCloud ? "Turso Cloud Edge" : "Local SQLite / LibSQL"}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                ● Live & Operational
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-gray-100">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                Database Target
              </span>
              <div className="text-xs font-mono font-bold text-gray-800 truncate" title={tursoUrl}>
                {tursoUrl}
              </div>
              <span className="text-[10px] text-gray-500 block">
                Auth Token: {hasToken ? "Configured (Securely Hidden)" : "Local mode (Not required)"}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-gray-100">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                Drizzle ORM Dialect
              </span>
              <div className="text-sm font-bold text-gray-900">
                Turso LibSQL SQLite
              </div>
              <span className="text-[10px] text-purple-700 font-semibold block">
                Zero latency edge queries
              </span>
            </div>
          </div>
        )}

        {/* Database Tables & Record Counts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Database Tables & Record Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 text-center">
              <div className="text-2xl font-black text-brand-navy">{counts.products}</div>
              <div className="text-xs font-bold text-gray-900 mt-1">products</div>
              <div className="text-[10px] text-gray-400">Hardware & DIY items</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 text-center">
              <div className="text-2xl font-black text-brand-navy">{counts.categories}</div>
              <div className="text-xs font-bold text-gray-900 mt-1">categories</div>
              <div className="text-[10px] text-gray-400">Retail departments</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 text-center">
              <div className="text-2xl font-black text-brand-navy">{counts.orders}</div>
              <div className="text-xs font-bold text-gray-900 mt-1">orders</div>
              <div className="text-[10px] text-gray-400">Customer checkouts</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 text-center">
              <div className="text-2xl font-black text-brand-navy">{counts.orderItems}</div>
              <div className="text-xs font-bold text-gray-900 mt-1">order_items</div>
              <div className="text-[10px] text-gray-400">Line item associations</div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Connect Turso Cloud Instructions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-gray-900">
          How to Connect Your Remote Turso Cloud Database
        </h2>
        <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>
            The project is architected with dual compatibility. To point this store to your cloud Turso database created at <strong>app.turso.tech/ghulam--mujtaba</strong>:
          </p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Log in to{" "}
              <a
                href="https://app.turso.tech/ghulam--mujtaba"
                target="_blank"
                rel="noreferrer"
                className="text-brand-navy font-bold hover:underline"
              >
                https://app.turso.tech/ghulam--mujtaba
              </a>{" "}
              and click <strong>Create Database</strong> (name it e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">bargainstore-db</code>).
            </li>
            <li>
              Copy your database URL (format: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">libsql://bargainstore-db-ghulam--mujtaba.turso.io</code>) and generate an Auth Token.
            </li>
            <li>
              Open your <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">.env.local</code> file and set:
              <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded-lg font-mono text-[11px] overflow-x-auto">
{`TURSO_DATABASE_URL="libsql://your-db-ghulam--mujtaba.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"`}
              </pre>
            </li>
            <li>
              Run <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">node scripts/seed.mjs</code> in terminal to initialize tables and populate your cloud database with all UK hardware products!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
