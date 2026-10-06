"use client";

import React, { useState } from "react";
import { Order } from "@/lib/types";
import { Package, Check, Loader2 } from "lucide-react";

export default function AdminOrderTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert("Failed to update order status.");
      }
    } catch (err) {
      alert("Error updating order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-100/70 text-gray-600 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4">Delivery & Destination</th>
              <th className="py-3 px-4">Total Paid</th>
              <th className="py-3 px-4">Dispatch Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No orders placed yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-navy">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{o.customerName}</div>
                    <div className="text-gray-500">{o.customerEmail}</div>
                    {o.customerPhone && (
                      <div className="text-[10px] text-gray-400">{o.customerPhone}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800">{o.deliveryMethod}</div>
                    <div className="text-gray-500">
                      {o.shippingAddress}, {o.city} {o.postcode}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-black text-brand-navy">
                    £{o.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : o.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-800 focus:outline-none focus:border-brand-navy"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      {updatingId === o.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-navy" />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
