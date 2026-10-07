import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BargainStore.uk — Trusted UK Brands At Low Prices",
    short_name: "BargainStore.uk",
    description:
      "Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#001642",
    theme_color: "#001642",
    categories: ["shopping", "lifestyle", "business"],
    icons: [
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable" as unknown as "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable" as unknown as "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
