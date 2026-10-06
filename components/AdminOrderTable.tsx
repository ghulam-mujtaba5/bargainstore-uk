"use client";

import React, { useState, useMemo } from "react";
import { Order } from "@/lib/types";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  Printer,
  Mail,
  Phone,
  MapPin,
  Tag,
  Loader2,
  X,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useAdminToast } from "./AdminToast";

interface AdminOrderTableProps {
  initialOrders: Order[];
}

export default function AdminOrderTable({ initialOrders }: AdminOrderTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { showToast } = useAdminToast();

  // Metrics
  const totalOrders = orders.length;
  const processingCount = orders.filter((o) => o.status === "Processing").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.total : 0), 0);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch =
        q === "" ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.postcode.toLowerCase().includes(q);

      const matchesStatus =
        statusTab === "all" || o.status.toLowerCase() === statusTab.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusTab]);

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
        showToast(`Order status updated to "${newStatus}"`, "success");
      } else {
        showToast("Failed to update order status.", "error");
      }
    } catch {
      showToast("Error updating order status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Orders
          </div>
          <div className="text-2xl font-black text-brand-navy mt-0.5">{totalOrders}</div>
          <div className="text-[10px] text-gray-400 mt-1">Recorded in Turso DB</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{processingCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-1">Awaiting dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-0.5">{shippedCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-1">In transit via carrier</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{deliveredCount}</div>
          <div className="text-[10px] text-emerald-600/80 mt-1">Completed orders</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Total Sales Value</span>
          </div>
          <div className="text-2xl font-black text-brand-navy mt-0.5">
            £{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Active store revenue</div>
        </div>
      </div>

      {/* Main Orders Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Toolbar: Search & Tabs */}
        <div className="p-4 border-b border-gray-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ref (BS-...), customer, email, postcode..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-gray-200/80 p-1 rounded-xl text-xs font-semibold">
              {[
                { id: "all", label: "All Orders", count: totalOrders },
                { id: "processing", label: "Processing", count: processingCount },
                { id: "shipped", label: "Shipped", count: shippedCount },
                { id: "delivered", label: "Delivered", count: deliveredCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    statusTab === tab.id
                      ? "bg-white text-brand-navy shadow-xs font-bold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      statusTab === tab.id ? "bg-brand-navy text-white" : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Showing <strong className="text-gray-900">{filteredOrders.length}</strong> orders
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Order Ref & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Dispatch Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-gray-300" />
                    <div>No customer orders found matching your search.</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isExpanded = expandedOrderId === o.id;
                  const isUpdating = updatingId === o.id;
                  const itemsCount = o.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                  return (
                    <React.Fragment key={o.id}>
                      <tr
                        className={`transition-colors ${
                          isExpanded ? "bg-amber-50/40" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Order Ref & Date */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-brand-navy text-sm">
                            {o.orderNumber}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{o.customerName}</div>
                          <div className="text-gray-500 text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{o.customerEmail}</span>
                          </div>
                          {o.customerPhone && (
                            <div className="text-gray-400 text-[10px] flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-gray-400" />
                              <span>{o.customerPhone}</span>
                            </div>
                          )}
                        </td>

                        {/* Destination */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-800">{o.deliveryMethod}</div>
                          <div className="text-gray-500 text-[11px] truncate max-w-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span>
                              {o.shippingAddress}, {o.city} <strong>{o.postcode}</strong>
                            </span>
                          </div>
                        </td>

                        {/* Items preview */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : o.id)
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Package className="w-3.5 h-3.5 text-brand-navy" />
                            <span>
                              {itemsCount > 0
                                ? `${itemsCount} ${itemsCount === 1 ? "item" : "items"}`
                                : "View items"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-brand-navy text-sm">
                            £{o.total.toFixed(2)}
                          </div>
                          {o.promoCode && (
                            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{o.promoCode} (-£{o.discountAmount?.toFixed(2)})</span>
                            </div>
                          )}
                        </td>

                        {/* Dispatch Status */}
                        <td className="py-3.5 px-4">{getStatusBadge(o.status)}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Status Change Selector */}
                            <select
                              value={o.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy cursor-pointer disabled:opacity-50"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            {isUpdating && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-navy" />
                            )}

                            {/* Print Packing Slip */}
                            <button
                              type="button"
                              onClick={() => setPrintingOrder(o)}
                              className="p-1.5 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
                              title="Print Packing Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Order Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-gray-200">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-2xs">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Purchased Line Items ({o.items?.length || 0} unique items)
                                  </h4>
                                </div>
                                <span className="text-[11px] text-gray-400">
                                  Order Reference: <strong className="font-mono text-brand-navy">{o.orderNumber}</strong>
                                </span>
                              </div>

                              {/* Items Table */}
                              {o.items && o.items.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-gray-500 font-semibold uppercase text-[10px]">
                                      <tr>
                                        <th className="py-2 px-3">Product Name</th>
                                        <th className="py-2 px-3 text-center">Quantity</th>
                                        <th className="py-2 px-3 text-right">Unit Price</th>
                                        <th className="py-2 px-3 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {o.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                          <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-2.5">
                                              {item.image ? (
                                                <img
                                                  src={item.image}
                                                  alt={item.productName}
                                                  className="w-9 h-9 object-contain bg-gray-50 rounded-lg border border-gray-200 p-0.5"
                                                />
                                              ) : (
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                  <Package className="w-4 h-4" />
                                                </div>
                                              )}
                                              <div>
                                                <div className="font-bold text-gray-900">
                                                  {item.productName}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                  Product ID: #{item.productId}
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                                            {item.quantity}x
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-medium text-gray-600">
                                            £{item.price.toFixed(2)}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-bold text-brand-navy">
                                            £{(item.price * item.quantity).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 py-3 text-center">
                                  No line items recorded for this order.
                                </div>
                              )}

                              {/* Order Financial & Delivery Breakdown */}
                              <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
                                <div className="space-y-1.5 text-gray-600">
                                  <div className="font-bold text-gray-900 mb-1">
                                    Delivery & Contact Information
                                  </div>
                                  <div>Recipient: <strong>{o.customerName}</strong></div>
                                  <div>Address: {o.shippingAddress}, {o.city} {o.postcode}</div>
                                  <div>Delivery: <strong>{o.deliveryMethod}</strong></div>
                                  <div>Payment: {o.paymentMethod || "Credit/Debit Card"}</div>
                                </div>

                                <div className="space-y-1.5 sm:text-right text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-100">
                                  <div className="flex justify-between sm:justify-end gap-4">
                                    <span>Subtotal:</span>
                                    <strong>£{o.subtotal.toFixed(2)}</strong>
                                  </div>
                                  {o.discountAmount ? (
                                    <div className="flex justify-between sm:justify-end gap-4 text-emerald-700">
                                      <span>Voucher ({o.promoCode}):</span>
                                      <strong>-£{o.discountAmount.toFixed(2)}</strong>
                                    </div>
                                  ) : null}
                                  <div className="flex justify-between sm:justify-end gap-4">
                                    <span>Delivery Fee:</span>
                                    <span>
                                      {o.shippingFee === 0 ? "FREE" : `£${o.shippingFee.toFixed(2)}`}
                                    </span>
                                  </div>
                                  <div className="flex justify-between sm:justify-end gap-4 text-sm font-black text-brand-navy border-t border-gray-200 pt-1.5">
                                    <span>Grand Total:</span>
                                    <span>£{o.total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Packing Slip Modal */}
      {printingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-yellow text-brand-navy flex items-center justify-center font-black text-lg">
                  B
                </div>
                <div>
                  <h3 className="text-lg font-black text-brand-navy">BargainStore.uk</h3>
                  <div className="text-xs text-gray-400">Official UK Warehouse Packing Slip</div>
                </div>
              </div>
              <button
                onClick={() => setPrintingOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Meta */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 uppercase font-bold text-[10px] block">Order Ref</span>
                <span className="font-mono font-black text-base text-brand-navy">{printingOrder.orderNumber}</span>
                <span className="text-gray-500 block mt-1">
                  Date: {new Date(printingOrder.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-bold text-[10px] block">Shipping Destination</span>
                <div className="font-bold text-gray-900">{printingOrder.customerName}</div>
                <div className="text-gray-600">{printingOrder.shippingAddress}</div>
                <div className="text-gray-600 font-bold">{printingOrder.city} {printingOrder.postcode}</div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-700 uppercase">Items to Pack:</div>
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-600 font-bold">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {printingOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{item.productName}</td>
                      <td className="py-2.5 px-3 text-center font-black text-brand-navy">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">£{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-xs">
              <div className="text-gray-500">
                Method: <strong>{printingOrder.deliveryMethod}</strong> | Status: <strong>{printingOrder.status}</strong>
              </div>
              <div className="text-base font-black text-brand-navy">
                Total: £{printingOrder.total.toFixed(2)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-brand-navy hover:bg-brand-navyLight text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
