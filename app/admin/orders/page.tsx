import React from "react";
import { getAllOrders } from "@/lib/data";
import AdminOrderTable from "@/components/AdminOrderTable";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Customer Orders</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review placed customer orders and update dispatch statuses in the Turso database.
        </p>
      </div>

      <AdminOrderTable initialOrders={orders} />
    </div>
  );
}
