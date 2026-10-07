import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(SITE_URL).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/feeds/", "/llms.txt"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/orders",
          "/api/turso",
          "/api/promotions",
        ],
        crawlDelay: 2,
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Slurp",
          "DuckDuckBot",
          "Baiduspider",
          "YandexBot",
        ],
        allow: ["/", "/api/feeds/", "/llms.txt"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/orders",
          "/api/turso",
          "/api/promotions",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Anthropic-AI",
          "CCBot",
          "Applebot-Extended",
        ],
        allow: ["/", "/llms.txt", "/api/feeds/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/orders",
          "/api/turso",
          "/api/promotions",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host,
  };
}
