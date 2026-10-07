import { getAllCategories, getAllProducts } from "@/lib/data";
import { SITE_URL, getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Sanitize CDATA payload to prevent premature CDATA closure.
 */
function sanitizeCdata(str: string | null | undefined): string {
  if (!str) return "";
  return String(str).replace(/]]>/g, "]]]]><![CDATA[>");
}

/**
 * Generates the full Google Merchant Center RSS 2.0 XML product feed.
 */
async function generateGoogleMerchantXml(): Promise<string> {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
  ]);

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    if (cat.slug && cat.name) {
      categoryMap.set(cat.slug, cat.name);
    }
  }

  const itemsXml = products
    .map((product) => {
      const id = product.id;
      const title = sanitizeCdata(product.name);
      const description = sanitizeCdata(product.description);
      const link = getAbsoluteUrl(`/product/${product.slug}`);
      const imageLink = getAbsoluteUrl(product.image);

      let additionalImagesXml = "";
      if (product.additionalImages) {
        try {
          const raw = String(product.additionalImages).trim();
          let parsedImages: unknown[] = [];
          try {
            const json = JSON.parse(raw);
            if (Array.isArray(json)) {
              parsedImages = json;
            }
          } catch {
            if (raw.includes(",")) {
              parsedImages = raw.split(",").map((s) => s.trim());
            } else if (raw) {
              parsedImages = [raw];
            }
          }

          for (const img of parsedImages) {
            if (typeof img === "string" && img.trim()) {
              additionalImagesXml += `      <g:additional_image_link>${getAbsoluteUrl(
                img.trim()
              )}</g:additional_image_link>\n`;
            }
          }
        } catch (_) {}
      }

      const availability =
        Number(product.stock) > 0 ? "in_stock" : "out_of_stock";
      const price = `${Number(product.price).toFixed(2)} GBP`;
      const brand = sanitizeCdata(product.brand || "BargainStore UK");
      const condition = "new";
      const shippingPrice =
        Number(product.price) >= 50 ? "0.00 GBP" : "4.95 GBP";
      const mpn = `BGS-${product.id}`;

      let categoryName = categoryMap.get(product.categorySlug);
      if (!categoryName) {
        categoryName = product.categorySlug
          ? product.categorySlug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "General Hardware";
      }
      const productType = sanitizeCdata(categoryName);

      return `    <item>
      <g:id>${id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
${additionalImagesXml}      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand><![CDATA[${brand}]]></g:brand>
      <g:condition>${condition}</g:condition>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Standard UK Delivery</g:service>
        <g:price>${shippingPrice}</g:price>
      </g:shipping>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${mpn}</g:mpn>
      <g:product_type><![CDATA[${productType}]]></g:product_type>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>BargainStore.uk Google Merchant Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Active UK DIY, garden tools, homewares and appliances catalogue</description>
${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    const xml = await generateGoogleMerchantXml();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Google Merchant Feed error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>BargainStore.uk Google Merchant Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Active UK DIY, garden tools, homewares and appliances catalogue</description>
  </channel>
</rss>`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
