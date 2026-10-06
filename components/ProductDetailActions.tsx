"use client";

import React, { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Plus, Minus, Check } from "lucide-react";

export default function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-700">Quantity:</label>
        <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 hover:bg-gray-200 text-gray-700 transition-colors rounded-l"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-2 hover:bg-gray-200 text-gray-700 transition-colors rounded-r"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
          isAdded
            ? "bg-brand-green text-white"
            : "bg-brand-navy hover:bg-brand-navyLight text-white hover:shadow-lg"
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-5 h-5" />
            <span>Added {quantity} to Basket!</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            <span>Add to Basket — £{(product.price * quantity).toFixed(2)}</span>
          </>
        )}
      </button>
    </div>
  );
}
