"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Star, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const saving = product.savingAmount || (product.comparePrice ? product.comparePrice - product.price : 0);

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full relative">
      {/* Product Image + Pill Badge */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Savings Pill Badge (Direct replica of Home Hardware Direct style) */}
        {saving > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            You save £{saving.toFixed(2)}
          </span>
        )}

        {product.isDealOfTheDay === 1 && (
          <span className="absolute top-2.5 right-2.5 bg-brand-yellow text-brand-navy text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-sm">
            Top Deal
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-semibold text-brand-heading hover:text-brand-navy line-clamp-2 leading-snug mb-2 group-hover:underline"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Competitor Price Comparison (Signature conversion element) */}
          {product.comparePrice && (
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span>{product.competitorName || "Amazon"}:</span>
              <del className="text-gray-400">£{product.comparePrice.toFixed(2)}</del>
            </div>
          )}

          {/* Active Selling Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-black text-brand-navy">
              £{product.price.toFixed(2)}
            </span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] text-red-600 font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isAdded
                ? "bg-brand-green text-white shadow-sm"
                : "bg-brand-navy text-white hover:bg-brand-navyLight shadow-sm hover:shadow"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Basket!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Basket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
