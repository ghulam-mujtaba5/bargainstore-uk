import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <span className="text-sm font-bold text-[#e30613] uppercase tracking-wider block mb-2">
        Page Not Found
      </span>
      <h1 className="text-4xl font-black text-brand-navy mb-4">404 - Hardware Not Found</h1>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        We couldn&apos;t find the product or page you were looking for. It may have been moved, renamed, or is currently out of stock.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-xs rounded-xl transition-colors"
        >
          Return to Homepage
        </Link>
        <Link
          href="/shop"
          className="px-6 py-3 bg-[#ffd100] hover:bg-[#e6bd00] text-brand-navy font-bold text-xs rounded-xl transition-colors"
        >
          Browse All Products
        </Link>
      </div>
    </div>
  );
}
