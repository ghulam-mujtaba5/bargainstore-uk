import React from "react";
import { getAllOrdersWithItems } from "@/lib/data";
import AdminOrderTable from "@/components/AdminOrderTable";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersWithItems();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Customer Orders & Dispatch</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review placed customer orders, inspect purchased line items, generate packing slips, and update dispatch statuses in the Turso edge database.
        </p>
      </div>

      <AdminOrderTable initialOrders={orders} />
    </div>
  );
}
