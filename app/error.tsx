"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <span className="text-sm font-bold text-[#e30613] uppercase tracking-wider block mb-2">
        Something Went Wrong
      </span>
      <h1 className="text-3xl font-black text-brand-navy mb-4">Error Loading Page</h1>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        An unexpected error occurred while loading this page. Please try refreshing or return to the homepage.
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
