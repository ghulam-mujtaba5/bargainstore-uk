import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Basket",
  description:
    "Review items in your shopping basket. Fast UK dispatch with Royal Mail & DPD, plus free 2-hour Click & Collect at Cowdenbeath.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BasketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
