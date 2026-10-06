"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "./types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  totalSavings: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  promoCode: string | null;
  discountPercent: number;
  discountAmount: number;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  shippingFee: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bargainstore_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else if (parsed && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          if (parsed.promoCode && parsed.promoCode.trim().toUpperCase() === "BARGAIN10") {
            setPromoCode("BARGAIN10");
            setDiscountPercent(10);
          }
        }
      }
      const savedPromo = localStorage.getItem("bargainstore_promo");
      if (savedPromo && savedPromo.trim().toUpperCase() === "BARGAIN10") {
        setPromoCode("BARGAIN10");
        setDiscountPercent(10);
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("bargainstore_cart", JSON.stringify(items));
        if (promoCode) {
          localStorage.setItem("bargainstore_promo", promoCode);
        } else {
          localStorage.removeItem("bargainstore_promo");
        }
      } catch (e) {
        console.error("Failed to save cart to storage", e);
      }
    }
  }, [items, promoCode, isLoaded]);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price,
          comparePrice: product.comparePrice || undefined,
          savingAmount: product.savingAmount || undefined,
          image: product.image,
          quantity,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode(null);
    setDiscountPercent(0);
  };

  const applyPromo = (code: string): { success: boolean; message: string } => {
    const trimmed = (code || "").trim().toUpperCase();
    if (!trimmed) {
      return { success: false, message: "Please enter a promotional code." };
    }
    if (trimmed === "BARGAIN10") {
      setPromoCode("BARGAIN10");
      setDiscountPercent(10);
      return { success: true, message: "Voucher applied: 10% discount!" };
    }
    return { success: false, message: "Invalid code. Try using 'BARGAIN10' for 10% off!" };
  };

  const removePromo = () => {
    setPromoCode(null);
    setDiscountPercent(0);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalSavings = items.reduce((sum, item) => {
    if (item.comparePrice && item.comparePrice > item.price) {
      return sum + (item.comparePrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const discountAmount = Number(
    ((subtotal * discountPercent) / 100).toFixed(2)
  );

  const shippingFee = items.length === 0 ? 0 : (subtotal >= 50 ? 0 : 4.99);

  const grandTotal = Number(
    Math.max(0, subtotal - discountAmount + shippingFee).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        totalSavings,
        isCartOpen,
        setIsCartOpen,
        promoCode,
        discountPercent,
        discountAmount,
        applyPromo,
        removePromo,
        shippingFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
