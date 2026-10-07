import type { MetadataRoute } from "next";
import { getAllCategories, getAllProducts } from "@/lib/data";
import { SITE_URL, getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date();

  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/basket`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/ideas-advice`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => {
    const images: string[] = [];
    if (c.image) images.push(getAbsoluteUrl(c.image));
    return {
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
      ...(images.length > 0 && { images }),
    };
  });

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => {
    const images: string[] = [];
    if (p.image) images.push(getAbsoluteUrl(p.image));
    if (p.additionalImages) {
      try {
        const extra = JSON.parse(p.additionalImages);
        if (Array.isArray(extra)) {
          for (const img of extra) {
            if (typeof img === "string" && img.trim()) {
              images.push(getAbsoluteUrl(img.trim()));
            }
          }
        }
      } catch (_) {}
    }

    let lastmod = now;
    if (p.createdAt) {
      const parsed = new Date(p.createdAt);
      if (!isNaN(parsed.getTime())) {
        lastmod = parsed;
      }
    }

    return {
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: lastmod,
      changeFrequency: "daily" as const,
      priority: 0.8,
      ...(images.length > 0 && { images }),
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
