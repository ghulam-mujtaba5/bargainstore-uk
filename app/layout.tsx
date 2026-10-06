import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { getAllCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "BargainStore.uk | Trusted UK Brands At Low Prices",
  description: "BargainStore.uk — Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getAllCategories();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-brand-slate selection:bg-brand-navy selection:text-white">
        <CartProvider>
          <Navbar categories={categories} />
          <CartDrawer />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
