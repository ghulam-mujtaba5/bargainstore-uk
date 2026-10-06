import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description:
    "256-Bit SSL encrypted UK checkout. Royal Mail Tracked 48, DPD Express, and free Click & Collect at Cowdenbeath.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
