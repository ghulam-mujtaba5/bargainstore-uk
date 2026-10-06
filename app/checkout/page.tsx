"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { isValidUKPostcode, formatUKPostcode, isValidEmail } from "@/lib/validation";
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Store,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    clearCart,
    promoCode,
    discountPercent,
    discountAmount,
  } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    deliveryMethod: "Standard UK Delivery",
    paymentMethod: "Credit / Debit Card",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [postcodeError, setPostcodeError] = useState("");

  const freeDeliveryThreshold = 50;
  let shippingFee = 0;
  if (formData.deliveryMethod === "Standard UK Delivery") {
    shippingFee = subtotal >= freeDeliveryThreshold ? 0 : 4.99;
  } else if (formData.deliveryMethod === "Next Day Express") {
    shippingFee = 6.99;
  } else {
    shippingFee = 0; // Click & Collect
  }

  const grandTotal = Math.max(0, Number((subtotal - discountAmount + shippingFee).toFixed(2)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address || !formData.postcode) {
      setError("Please fill out all required shipping fields.");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidUKPostcode(formData.postcode)) {
      setPostcodeError("Please enter a valid UK postcode (e.g. SW1A 1AA or M1 1AE).");
      setError("Please provide a valid UK postcode to proceed.");
      return;
    }

    if (items.length === 0) {
      setError("Your basket is empty.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setPostcodeError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name.trim(),
          customerEmail: formData.email.trim(),
          customerPhone: formData.phone ? formData.phone.trim() : null,
          shippingAddress: formData.address.trim(),
          city: formData.city.trim(),
          postcode: formatUKPostcode(formData.postcode),
          deliveryMethod: formData.deliveryMethod,
          paymentMethod: formData.paymentMethod,
          items,
          subtotal,
          promoCode: promoCode || null,
          discountAmount,
          shippingFee,
          total: grandTotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        clearCart();
        router.push(`/order-confirmation/${data.orderNumber}`);
      } else {
        setError(data.error || "Failed to process order. Please try again.");
      }
    } catch (err: any) {
      setError("Network error while submitting order. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Basket is empty</h1>
        <p className="text-xs text-gray-500 mb-6">Please add items to your basket before checking out.</p>
        <Link href="/shop" className="px-6 py-2.5 bg-brand-navy text-white text-xs font-bold rounded-lg">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <Link href="/basket" className="text-xs text-brand-navy hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to basket</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-heading">
            Secure Checkout
          </h1>
        </div>
        <div className="flex items-center gap-1 text-xs text-brand-green font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Shipping info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-brand-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Contact & Delivery Address</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john.smith@example.co.uk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Phone (for delivery SMS)</label>
                <input
                  type="tel"
                  placeholder="07700 900000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">UK Postcode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SW1A 1AA"
                  value={formData.postcode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData({ ...formData, postcode: val });
                    if (postcodeError && isValidUKPostcode(val)) {
                      setPostcodeError("");
                    }
                  }}
                  onBlur={() => {
                    if (formData.postcode.trim() && !isValidUKPostcode(formData.postcode)) {
                      setPostcodeError("Please enter a valid UK postcode (e.g. SW1A 1AA).");
                    } else {
                      setPostcodeError("");
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg uppercase focus:outline-none ${
                    postcodeError ? "border-red-500 bg-red-50/20" : "border-gray-300 focus:border-brand-navy"
                  }`}
                />
                {postcodeError && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{postcodeError}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House number and street name"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Town / City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London, Manchester, Glasgow"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-brand-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Delivery Option</span>
            </h2>

            <div className="space-y-2 text-xs">
              <label
                onClick={() => setFormData({ ...formData, deliveryMethod: "Standard UK Delivery" })}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  formData.deliveryMethod === "Standard UK Delivery"
                    ? "border-brand-navy bg-brand-softBlue/40 font-semibold text-brand-navy"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-brand-navy" />
                  <div>
                    <div>Standard UK Courier (2-3 working days)</div>
                    <div className="text-[10px] text-gray-500 font-normal">Tracked Royal Mail or DPD</div>
                  </div>
                </div>
                <span>{subtotal >= 50 ? "FREE" : "£4.99"}</span>
              </label>

              <label
                onClick={() => setFormData({ ...formData, deliveryMethod: "Next Day Express" })}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  formData.deliveryMethod === "Next Day Express"
                    ? "border-brand-navy bg-brand-softBlue/40 font-semibold text-brand-navy"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-brand-navy" />
                  <div>
                    <div>Next Working Day Priority Dispatch</div>
                    <div className="text-[10px] text-gray-500 font-normal">Order before 2pm</div>
                  </div>
                </div>
                <span>£6.99</span>
              </label>

              <label
                onClick={() => setFormData({ ...formData, deliveryMethod: "Click & Collect (Local Store)" })}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  formData.deliveryMethod === "Click & Collect (Local Store)"
                    ? "border-brand-navy bg-brand-softBlue/40 font-semibold text-brand-navy"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-brand-green" />
                  <div>
                    <div>Free Click & Collect at High Street Hub</div>
                    <div className="text-[10px] text-gray-500 font-normal">Ready within 2 hours</div>
                  </div>
                </div>
                <span className="text-brand-green font-bold">FREE</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-brand-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Payment Method</span>
            </h2>

            <div className="space-y-2 text-xs">
              {[
                { name: "Credit / Debit Card", icon: "/assets/payment/visa.webp", alt: "Visa & Mastercard" },
                { name: "PayPal Pay in 3 (Split across 3 months)", icon: "/assets/payment/paypal.webp", alt: "PayPal" },
                { name: "Apple Pay / Google Pay", icon: "/assets/payment/apple-pay.webp", alt: "Apple Pay & Google Pay" },
              ].map((method) => (
                <label
                  key={method.name}
                  onClick={() => setFormData({ ...formData, paymentMethod: method.name })}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    formData.paymentMethod === method.name
                      ? "border-brand-navy bg-brand-softBlue/40 font-semibold text-brand-navy"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={method.icon}
                      alt={method.alt}
                      className="w-8 h-5 object-contain bg-white rounded border border-gray-200 p-0.5"
                    />
                    <span>{method.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {method.name.includes("Card") && (
                      <div className="flex gap-1">
                        <img src="/assets/payment/visa.webp" alt="Visa" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                        <img src="/assets/payment/mastercard.webp" alt="Mastercard" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                      </div>
                    )}
                    {method.name.includes("Apple") && (
                      <div className="flex gap-1">
                        <img src="/assets/payment/apple-pay.webp" alt="Apple Pay" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                        <img src="/assets/payment/google-pay.webp" alt="Google Pay" className="h-4 w-7 object-contain bg-white rounded border border-gray-200 p-0.5" />
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-green flex-shrink-0" />
              <span>Simulated payment test mode enabled. No real money will be charged.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-brand-heading border-b border-gray-100 pb-3">
              Order Review ({items.length} {items.length === 1 ? "Product" : "Products"})
            </h2>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-brand-navy">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-200 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">£{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Voucher Discount ({promoCode} - {discountPercent}%):</span>
                  <span>-£{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery ({formData.deliveryMethod}):</span>
                <span>{shippingFee === 0 ? "FREE" : `£${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-brand-navy pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? "Creating Order in Turso DB..." : `Place Order — £${grandTotal.toFixed(2)}`}
            </button>

            <div className="text-center text-[10px] text-gray-400">
              By placing your order you agree to BargainStore.uk terms of service.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
