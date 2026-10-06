import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/data";
import { CheckCircle2, Truck, ArrowRight, Package, Calendar, MapPin } from "lucide-react";

interface OrderConfirmationProps {
  params: Promise<{ orderNumber: string }>;
}

export const revalidate = 0;

export default async function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success Badge */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 bg-green-100 text-brand-green rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-heading">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-md mx-auto">
          We have sent an order receipt and dispatch tracking details to <strong>{order.customerEmail}</strong>.
        </p>

        <div className="inline-block bg-brand-softBlue px-4 py-2 rounded-lg text-xs font-bold text-brand-navy border border-blue-100">
          Order Reference: <span className="font-mono text-brand-red">{order.orderNumber}</span>
        </div>
      </div>

      {/* Order Status & Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-navy" />
            <h2 className="text-base font-bold text-gray-900">Current Status: {order.status}</h2>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {order.status}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 font-bold uppercase tracking-wider block">
              Delivery Address:
            </span>
            <div className="font-semibold text-gray-800">{order.customerName}</div>
            <div className="text-gray-600">{order.shippingAddress}</div>
            <div className="text-gray-600">{order.city}, {order.postcode}</div>
          </div>

          <div className="space-y-1 p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 font-bold uppercase tracking-wider block">
              Shipping Method:
            </span>
            <div className="font-semibold text-gray-800">{order.deliveryMethod}</div>
            <div className="text-gray-600">Payment: {order.paymentMethod}</div>
            {order.promoCode && (
              <div className="text-green-700 font-bold text-[11px]">
                Voucher Applied: {order.promoCode}
              </div>
            )}
            <div className="text-gray-500 text-[10px]">Saved to Turso Database</div>
          </div>
        </div>

        {/* Ordered items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Items Ordered ({order.items.length})
            </h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                      <span className="text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-brand-navy">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing summary */}
        <div className="pt-4 border-t border-gray-200 space-y-1 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>£{order.subtotal.toFixed(2)}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 ? (
            <div className="flex justify-between text-green-700 font-bold">
              <span>Voucher Discount {order.promoCode ? `(${order.promoCode})` : ""}:</span>
              <span>-£{order.discountAmount.toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-gray-600">
            <span>Shipping:</span>
            <span>{order.shippingFee === 0 ? "FREE" : `£${order.shippingFee.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-base font-black text-brand-navy pt-2 border-t border-gray-200">
            <span>Total Paid:</span>
            <span>£{order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/shop"
            className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <span>Continue Shopping Bargains</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
