"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Store,
  Tag,
} from "lucide-react";

export default function BasketPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalSavings,
    cartCount,
    promoCode: appliedPromoCode,
    discountPercent,
    discountAmount,
    applyPromo,
    removePromo,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  const freeDeliveryThreshold = 50;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  let deliveryFee = 0;
  if (deliveryMethod === "standard") {
    deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 4.99;
  } else if (deliveryMethod === "express") {
    deliveryFee = 6.99;
  } else if (deliveryMethod === "collect") {
    deliveryFee = 0;
  }

  const finalTotal = Math.max(0, Number((subtotal - discountAmount + deliveryFee).toFixed(2)));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyPromo(inputCode);
    setPromoFeedback(res);
    if (res.success) {
      setInputCode("");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-softBlue rounded-full flex items-center justify-center mx-auto mb-4 text-brand-navy">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-brand-heading mb-2">
          Your Shopping Basket is Empty
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
          Browse through our extensive selection of DIY tools, paints, gardening essentials and housewares at guaranteed low prices.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-sm rounded-xl transition-colors inline-block"
        >
          Explore All Bargains
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-heading">
          Your Shopping Basket ({cartCount} {cartCount === 1 ? "Item" : "Items"})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review your items and proceed through our encrypted checkout.
        </p>
      </div>

      {/* Free Delivery Tracker */}
      <div className="bg-brand-softBlue p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-navy">
          <Truck className="w-5 h-5 text-brand-green flex-shrink-0" />
          {remainingForFree === 0 ? (
            <span>🎉 You have qualified for <strong>FREE Standard UK Delivery</strong>!</span>
          ) : (
            <span>Spend <strong>£{remainingForFree.toFixed(2)}</strong> more to unlock <strong>FREE UK Delivery</strong>!</span>
          )}
        </div>
        <div className="w-full sm:w-48 bg-blue-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-green h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Items Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.brand}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    <Link href={`/product/${item.slug}`} className="hover:text-brand-navy">
                      {item.name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-extrabold text-brand-navy">
                      £{item.price.toFixed(2)}
                    </span>
                    {item.comparePrice && (
                      <span className="text-xs text-gray-400 line-through">
                        Amazon: £{item.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity and Row Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-700 transition-colors rounded-l"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-700 transition-colors rounded-r"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <div className="text-sm font-black text-brand-navy">
                      £{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-brand-red transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
            <button
              onClick={clearCart}
              className="text-gray-400 hover:text-brand-red transition-colors font-semibold"
            >
              Clear Entire Basket
            </button>
            <Link href="/shop" className="text-brand-navy hover:underline font-bold">
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Delivery Selector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-heading border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            {/* Delivery Method Selection */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-gray-700 block">Select UK Delivery:</label>

              <label
                onClick={() => setDeliveryMethod("standard")}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  deliveryMethod === "standard"
                    ? "border-brand-navy bg-brand-softBlue/40 text-brand-navy font-semibold"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-navy" />
                  <span>Standard UK (2-3 Days)</span>
                </div>
                <span>{subtotal >= 50 ? "FREE" : "£4.99"}</span>
              </label>

              <label
                onClick={() => setDeliveryMethod("express")}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  deliveryMethod === "express"
                    ? "border-brand-navy bg-brand-softBlue/40 text-brand-navy font-semibold"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-navy" />
                  <span>Next Day Express</span>
                </div>
                <span>£6.99</span>
              </label>

              <label
                onClick={() => setDeliveryMethod("collect")}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  deliveryMethod === "collect"
                    ? "border-brand-navy bg-brand-softBlue/40 text-brand-navy font-semibold"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-brand-green" />
                  <span>Click & Collect (Local Hub)</span>
                </div>
                <span className="text-green-700 font-bold">FREE</span>
              </label>
            </div>

            {/* Promo Code Section */}
            {appliedPromoCode ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-green-800 font-bold">
                  <Tag className="w-4 h-4 text-brand-green" />
                  <span>Voucher &apos;{appliedPromoCode}&apos; Applied ({discountPercent}%)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removePromo();
                    setPromoFeedback(null);
                  }}
                  className="text-brand-red hover:underline font-bold text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Promotional Code:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. BARGAIN10"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs uppercase focus:outline-none focus:border-brand-navy"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <div
                    className={`text-[11px] font-medium pt-1 ${
                      promoFeedback.success ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {promoFeedback.message}
                  </div>
                )}
              </form>
            )}

            {/* Pricing breakdown */}
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">£{subtotal.toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-brand-red font-bold">
                  <span>Price Match Savings:</span>
                  <span>-£{totalSavings.toFixed(2)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Voucher Discount ({appliedPromoCode || "BARGAIN10"} - {discountPercent}%):</span>
                  <span>-£{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery:</span>
                <span>{deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-base font-black text-brand-navy pt-2 border-t border-gray-200">
                <span>Total to Pay:</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Proceed to checkout CTA */}
            <Link
              href="/checkout"
              className="w-full py-3.5 px-4 bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>256-Bit Encrypted Secure UK Checkout</span>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
              <img src="/assets/payment/visa.webp" alt="Visa" className="h-5 w-8 object-contain bg-white rounded border border-gray-200 p-0.5" />
              <img src="/assets/payment/mastercard.webp" alt="Mastercard" className="h-5 w-8 object-contain bg-white rounded border border-gray-200 p-0.5" />
              <img src="/assets/payment/paypal.webp" alt="PayPal" className="h-5 w-8 object-contain bg-white rounded border border-gray-200 p-0.5" />
              <img src="/assets/payment/apple-pay.webp" alt="Apple Pay" className="h-5 w-8 object-contain bg-white rounded border border-gray-200 p-0.5" />
              <img src="/assets/payment/google-pay.webp" alt="Google Pay" className="h-5 w-8 object-contain bg-white rounded border border-gray-200 p-0.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
