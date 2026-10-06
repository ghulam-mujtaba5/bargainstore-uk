import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategory, getAllCategories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, ArrowLeft, SlidersHorizontal, Tag } from "lucide-react";
import { Product } from "@/lib/types";

const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  // Garden & Growing
  "Garden Power Tools": ["lawnmower", "mower", "pressure washer", "strimmer", "chainsaw", "hedge trimmer", "power", "washer", "1700w", "1600w"],
  "Garden Tools": ["garden tool", "spade", "fork", "shears", "rake", "trowel", "lawnmower", "pressure washer", "reel", "hose"],
  "Growing & Planting": ["plant", "seed", "planter", "pot", "compost", "grow", "fertiliser"],
  "Landscaping": ["paving", "edging", "fencing", "gravel", "turf", "stone"],
  "Pest Control": ["pest", "repeller", "killer", "insect", "slug", "rodent"],
  "Watering Systems": ["water", "watering", "hose", "reel", "nozzle", "sprinkler", "connector", "tap"],

  // DIY & Decorating
  "Paint & Varnish": ["paint", "varnish", "emulsion", "gloss", "primer", "undercoat", "dulux", "masonry", "matt"],
  "Decorating Tools": ["brush", "roller", "tape", "tray", "scraper", "filler", "sandpaper", "measure"],
  "Hand Tools": ["hand tool", "tape measure", "hammer", "screwdriver", "pliers", "wrench", "saw", "level", "stanley"],
  "Power Tools": ["power tool", "multi-tool", "drill", "saw", "sander", "grinder", "black+decker", "cordless", "280w"],
  "Screws & Fixings": ["screw", "fixing", "nail", "bolt", "anchor", "plug", "bracket"],
  "Building & Plumbing": ["plumbing", "pipe", "cement", "silicone", "sealant", "insulation"],

  // Electricals
  "Small Kitchen Appliances": ["blender", "air fryer", "fryer", "toaster", "kettle", "microwave", "food processor", "slow cooker"],
  "Heating & Cooling": ["heater", "fan", "radiator", "cooling", "air conditioner", "convector"],
  "Lighting": ["light", "bulb", "lamp", "led", "torch", "spotlight"],
  "Electrical Accessories": ["socket", "cable", "lead", "extension", "plug", "adapter", "battery"],
  "Personal Care": ["shaver", "hairdryer", "groomer", "toothbrush"],

  // Housewares
  "Cookware & Bakeware": ["pan", "pot", "baking", "tray", "casserole", "roaster", "skillet"],
  "Kitchenware": ["kitchen", "bowl", "dishrack", "utensil", "knife", "chopping board", "washing up"],
  "Tableware & Dining": ["plate", "dinnerware", "cutlery", "glass", "mug", "bowl"],
  "Storage & Organisation": ["storage", "shelving", "shelf", "rack", "organiser", "organizer", "box", "dishrack"],
  "Furnishings": ["cushion", "curtain", "rug", "throw", "blind"],

  // Laundry & Utility
  "Cleaning Equipment": ["mop", "bucket", "vacuum", "broom", "duster", "brush"],
  "Cleaning Supplies": ["clean", "detergent", "leaves", "bleach", "spray", "wash", "soap", "dr beckmann"],
  "Clothing Care & Airers": ["airer", "ironing", "iron", "laundry", "clothes", "detergent", "washing"],
  "Clothing Care": ["airer", "ironing", "iron", "laundry", "clothes", "detergent", "washing"],
  "Fireside Accessories": ["fire", "log", "coal", "companion set", "hearth"],
  "Winter Essentials": ["de-icer", "salt", "shovel", "insulation"],

  // Outdoor Living
  "Barbecues & Burners": ["bbq", "barbecue", "grill", "charcoal", "gas burner"],
  "Bird & Pet Care": ["bird", "feeder", "seed", "pet", "dog", "cat"],
  "Camping & Picnic": ["camping", "tent", "picnic", "coolbox", "chair", "sleeping bag"],
  "Garden Furniture": ["bench", "table", "chair", "parasol", "gazebo", "lounger"],
  "Garden Lighting & Decor": ["solar", "outdoor light", "lantern", "ornament", "statue"],
  "Garden Lighting": ["solar", "outdoor light", "lantern", "ornament"]
};

function matchesSubcategory(product: Product, subcategory: string): boolean {
  if (!subcategory || !subcategory.trim()) return true;

  const sub = subcategory.trim();
  const subLower = sub.toLowerCase();
  const subSingular = subLower.replace(/s\b/g, "").trim();

  const fullText = [
    product.name,
    product.brand,
    product.description,
    product.specs,
    product.categorySlug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // 1. Direct phrase match (plural or singular)
  if (fullText.includes(subLower) || (subSingular.length > 2 && fullText.includes(subSingular))) {
    return true;
  }

  // 2. Keyword taxonomy match
  const keywords = SUBCATEGORY_KEYWORDS[sub];
  if (keywords && keywords.some((k) => fullText.includes(k.toLowerCase()))) {
    return true;
  }

  // 3. Fallback token match
  const tokens = subLower
    .replace(/&/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !["and", "the", "for", "with"].includes(t));

  return tokens.some((token) => {
    const single = token.replace(/s$/, "");
    return fullText.includes(token) || (single.length > 2 && fullText.includes(single));
  });
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string | string[]; sort?: string | string[] }>;
}

export const revalidate = 0;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const searchParamsObj = await searchParams;
  const rawSub = searchParamsObj.sub;
  const sub = Array.isArray(rawSub) ? rawSub[0] : rawSub;
  const rawSort = searchParamsObj.sort;
  const sort = Array.isArray(rawSort) ? rawSort[0] : rawSort;

  const [category, allCategories, rawProducts] = await Promise.all([
    getCategoryBySlug(slug),
    getAllCategories(),
    getProductsByCategory(slug),
  ]);

  if (!category) {
    notFound();
  }

  const subcategories: string[] = category.subcategories
    ? JSON.parse(category.subcategories)
    : [];

  let products = [...rawProducts];

  // Filter by subcategory if present
  if (sub) {
    products = products.filter((p) => matchesSubcategory(p, sub));
  }

  // Optional sort
  if (sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === "saving") {
    products.sort((a, b) => (b.savingAmount || 0) - (a.savingAmount || 0));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-navy">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-brand-navy">{category.name}</span>
        {sub && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800">{sub}</span>
          </>
        )}
      </nav>

      {/* Category Header Banner */}
      <div className="bg-brand-softBlue/60 border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
            Department
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-heading">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-1 leading-relaxed">
            {category.description || "Discover verified UK hardware bargains with transparent price matching against Amazon and major retailers."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs text-xs font-semibold text-gray-700">
          <Tag className="w-4 h-4 text-brand-red" />
          <span>{products.length} Products Available</span>
        </div>
      </div>

      {/* Subcategory Pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={`/category/${category.slug}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              !sub
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy"
            }`}
          >
            All {category.name}
          </Link>
          {subcategories.map((item, i) => (
            <Link
              key={i}
              href={`/category/${category.slug}?sub=${encodeURIComponent(item)}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                sub === item
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>
      )}

      {/* Filter / Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-200 text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Showing <strong>{products.length}</strong> items</span>
        </div>

        {/* Sort links */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Sort by:</span>
          <Link
            href={`/category/${slug}?${sub ? `sub=${encodeURIComponent(sub)}&` : ""}sort=saving`}
            className={`px-2.5 py-1 rounded font-medium ${
              sort === "saving" ? "bg-brand-navy text-white" : "hover:text-brand-navy"
            }`}
          >
            Biggest Savings
          </Link>
          <Link
            href={`/category/${slug}?${sub ? `sub=${encodeURIComponent(sub)}&` : ""}sort=price-asc`}
            className={`px-2.5 py-1 rounded font-medium ${
              sort === "price-asc" ? "bg-brand-navy text-white" : "hover:text-brand-navy"
            }`}
          >
            Price: Low to High
          </Link>
          <Link
            href={`/category/${slug}?${sub ? `sub=${encodeURIComponent(sub)}&` : ""}sort=price-desc`}
            className={`px-2.5 py-1 rounded font-medium ${
              sort === "price-desc" ? "bg-brand-navy text-white" : "hover:text-brand-navy"
            }`}
          >
            Price: High to Low
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-base font-bold text-gray-800">
            {sub ? `No products found in "${sub}"` : "No products found in this category"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            {sub
              ? "Try resetting the subcategory filter or browse the entire department."
              : "Please check other departments or search the catalog."}
          </p>
          <div className="flex justify-center gap-3">
            {sub && (
              <Link
                href={`/category/${category.slug}`}
                className="px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-lg"
              >
                View All {category.name}
              </Link>
            )}
            <Link
              href="/shop"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
