"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    cartCount,
    subtotal,
    totalSavings,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 50;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-brand-navy text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="text-base font-bold">Your Basket ({cartCount} {cartCount === 1 ? "item" : "items"})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 hover:bg-brand-navyLight rounded-lg transition-colors text-gray-300 hover:text-white"
              aria-label="Close basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          <div className="bg-brand-softBlue px-4 py-2.5 border-b border-blue-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy mb-1.5">
              <Truck className="w-4 h-4 text-brand-green" />
              {remainingForFreeDelivery === 0 ? (
                <span className="text-green-700">Congratulations! You qualify for <strong>FREE UK Delivery</strong>!</span>
              ) : (
                <span>Add <strong>£{remainingForFreeDelivery.toFixed(2)}</strong> more for <strong>FREE UK Delivery</strong>!</span>
              )}
            </div>
            <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-green h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Your basket is currently empty</h3>
                <p className="text-xs text-gray-500 mb-6">Discover thousands of UK discount DIY and garden bargains today.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Start Shopping Now
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-500">{item.brand}</div>
                    <h4 className="text-xs font-semibold text-gray-900 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-brand-navy">
                        £{(item.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-gray-400">
                          (£{item.price.toFixed(2)} each)
                        </span>
                      )}
                    </div>

                    {/* Quantity controls & Delete */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded-md bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 text-gray-600 rounded-l"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 text-gray-600 rounded-r"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              {totalSavings > 0 && (
                <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-red">Your Total Savings:</span>
                  <span className="font-black text-brand-red text-sm">£{totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold text-gray-900 text-base">£{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Estimated Delivery:</span>
                <span>{subtotal >= 50 ? "FREE" : "£3.99"}</span>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/basket"
                  onClick={() => setIsCartOpen(false)}
                  className="py-2.5 px-3 border border-brand-navy text-brand-navy hover:bg-brand-navy/5 text-xs font-bold rounded-lg text-center transition-colors"
                >
                  View Basket
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="py-2.5 px-3 bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1 transition-colors shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                <span>Encrypted 256-bit Secure Checkout</span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 border-t border-gray-200">
                <img src="/assets/payment/visa.webp" alt="Visa" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                <img src="/assets/payment/mastercard.webp" alt="Mastercard" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                <img src="/assets/payment/paypal.webp" alt="PayPal" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                <img src="/assets/payment/apple-pay.webp" alt="Apple Pay" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                <img src="/assets/payment/google-pay.webp" alt="Google Pay" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
