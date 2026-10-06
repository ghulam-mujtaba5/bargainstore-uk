import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({ url, authToken });

async function seed() {
  console.log("Connecting to database at:", url);

  // 1. Create tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      image TEXT,
      featured INTEGER DEFAULT 1,
      item_count INTEGER DEFAULT 0,
      subcategories TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      brand TEXT NOT NULL,
      description TEXT NOT NULL,
      specs TEXT,
      price REAL NOT NULL,
      compare_price REAL,
      competitor_name TEXT DEFAULT 'Amazon',
      saving_amount REAL,
      badge TEXT,
      image TEXT NOT NULL,
      additional_images TEXT,
      stock INTEGER DEFAULT 25,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 18,
      is_staff_pick INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_deal_of_the_day INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postcode TEXT NOT NULL,
      delivery_method TEXT DEFAULT 'Standard UK Delivery',
      subtotal REAL NOT NULL,
      shipping_fee REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Processing',
      payment_method TEXT DEFAULT 'Card',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT
    );
  `);

  // Clear existing
  await client.execute(`DELETE FROM categories;`);
  await client.execute(`DELETE FROM products;`);
  await client.execute(`DELETE FROM orders;`);
  await client.execute(`DELETE FROM order_items;`);

  console.log("Inserting real categories with Home Hardware Direct assets...");

  const categoriesData = [
    {
      slug: "garden-growing",
      name: "Garden & Growing",
      description: "Lawnmowers, garden tools, planters, compost and outdoor care.",
      icon: "Sprout",
      image: "/assets/categories/garden-growing.webp",
      featured: 1,
      itemCount: 42,
      subcategories: JSON.stringify(["Garden Power Tools", "Garden Tools", "Growing & Planting", "Landscaping", "Pest Control", "Watering Systems"])
    },
    {
      slug: "outdoor-living",
      name: "Outdoor Living",
      description: "Barbecues, garden furniture, patio heaters and bird care.",
      icon: "Flame",
      image: "/assets/categories/outdoor-living.webp",
      featured: 1,
      itemCount: 28,
      subcategories: JSON.stringify(["Barbecues & Burners", "Bird & Pet Care", "Camping & Picnic", "Garden Furniture", "Garden Lighting & Decor"])
    },
    {
      slug: "diy-decorating",
      name: "DIY & Decorating",
      description: "Paints, power tools, hand tools, fixings and preparation sundries.",
      icon: "Hammer",
      image: "/assets/categories/diy-decorating.webp",
      featured: 1,
      itemCount: 65,
      subcategories: JSON.stringify(["Paint & Varnish", "Decorating Tools", "Hand Tools", "Power Tools", "Screws & Fixings", "Building & Plumbing"])
    },
    {
      slug: "electricals",
      name: "Electricals",
      description: "Heaters, fans, kitchen appliances, lighting and smart home accessories.",
      icon: "Zap",
      image: "/assets/categories/electricals.webp",
      featured: 1,
      itemCount: 39,
      subcategories: JSON.stringify(["Small Kitchen Appliances", "Heating & Cooling", "Lighting", "Electrical Accessories", "Personal Care"])
    },
    {
      slug: "housewares",
      name: "Housewares",
      description: "Pots, pans, dinnerware, food storage, organisers and homeware.",
      icon: "Home",
      image: "/assets/categories/housewares.webp",
      featured: 1,
      itemCount: 54,
      subcategories: JSON.stringify(["Cookware & Bakeware", "Kitchenware", "Tableware & Dining", "Storage & Organisation", "Furnishings"])
    },
    {
      slug: "laundry-utility",
      name: "Laundry & Utility",
      description: "Airers, ironing boards, cleaning liquids, mops and fireside sundries.",
      icon: "Sparkles",
      image: "/assets/categories/laundry-utility.webp",
      featured: 1,
      itemCount: 31,
      subcategories: JSON.stringify(["Cleaning Equipment", "Cleaning Supplies", "Clothing Care & Airers", "Fireside Accessories", "Winter Essentials"])
    }
  ];

  for (const c of categoriesData) {
    await client.execute({
      sql: `INSERT INTO categories (slug, name, description, icon, image, featured, item_count, subcategories)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [c.slug, c.name, c.description, c.icon, c.image, c.featured, c.itemCount, c.subcategories]
    });
  }

  console.log("Inserting authentic products with real extracted imagery...");

  const productsData = [
    {
      slug: "dulux-matt-pure-brilliant-white-7l",
      name: "Dulux Matt Pure Brilliant White 7L",
      categorySlug: "diy-decorating",
      brand: "Dulux",
      description: "Dulux Matt is a wipeable, smooth and creamy emulsion paint for use on walls and ceilings which gives a modern, flat finish. Excellent opacity and coverage across interior plasterboard and masonry surfaces.",
      specs: JSON.stringify({ "Finish": "Matt", "Capacity": "7 Litres", "Coverage": "Up to 13m² per litre", "Drying Time": "2-4 hours", "Application": "Brush or Roller" }),
      price: 19.99,
      comparePrice: 25.65,
      competitorName: "Amazon",
      savingAmount: 5.66,
      badge: "You save £5.66",
      image: "/assets/products/dulux-paint.webp",
      stock: 34,
      rating: 4.9,
      reviewCount: 42,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 1
    },
    {
      slug: "black-decker-mt280ba-oscillating-multitool",
      name: "Black+Decker MT280BA Oscillating Multi-Tool 280W",
      categorySlug: "diy-decorating",
      brand: "Black+Decker",
      description: "The Black+Decker 280W Multi-Tool is an all-in-one power tool for sanding, plunge cutting, rasping and scraping across wood, metal, plastic and tile grout. Tool-free accessory quick-change system.",
      specs: JSON.stringify({ "Power": "280W", "Variable Speed": "10,000 - 22,000 opm", "Accessories": "12-piece pack included", "Cord Length": "3m" }),
      price: 49.99,
      comparePrice: 59.87,
      competitorName: "Amazon",
      savingAmount: 9.88,
      badge: "You save £9.88",
      image: "/assets/products/black-decker-multitool.webp",
      stock: 16,
      rating: 4.8,
      reviewCount: 29,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 0
    },
    {
      slug: "dr-beckmann-magic-leaves-non-bio",
      name: "Dr Beckmann Magic Leaves Non - Bio",
      categorySlug: "laundry-utility",
      brand: "Dr Beckmann",
      description: "Effortlessly clean laundry with feather-light soluble detergent sheets. Dissolves in hot or cold wash cycles in seconds. Easy to carry, plastic-free packaging, dermatologist tested non-bio formula.",
      specs: JSON.stringify({ "Washes": "25 Washes", "Type": "Non-Bio", "Temperature": "20°C - 60°C", "Eco": "Plastic-free cardboard box" }),
      price: 3.99,
      comparePrice: 5.00,
      competitorName: "Amazon",
      savingAmount: 1.01,
      badge: "You save £1.01",
      image: "/assets/products/dr-beckmann.webp",
      stock: 85,
      rating: 4.7,
      reviewCount: 56,
      isStaffPick: 0,
      isFeatured: 1,
      isDealOfTheDay: 0
    },
    {
      slug: "joseph-joseph-duo-washing-up-bowl-with-plug",
      name: "Joseph Joseph Duo Washing Up Bowl with Plug",
      categorySlug: "housewares",
      brand: "Joseph Joseph",
      description: "Smart washing up bowl features a removable straining plug that catches food particles, preventing sink blockages. Steep sides keep water inside, while large carry handles make emptying easy.",
      specs: JSON.stringify({ "Brand": "Joseph Joseph", "Feature": "Removable draining plug", "Handles": "Dual carry handles", "Material": "BPA-Free Polypropylene" }),
      price: 14.99,
      comparePrice: 24.00,
      competitorName: "Argos",
      savingAmount: 9.01,
      badge: "You save £9.01",
      image: "/assets/products/joseph-bowl.webp",
      stock: 24,
      rating: 4.8,
      reviewCount: 33,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 1
    },
    {
      slug: "good-food-digital-blender",
      name: "Good Food Digital Blender 1000W with Glass Jug",
      categorySlug: "electricals",
      brand: "Good Food",
      description: "Powerful 1000W motor with 6 stainless steel ice-crushing blades. Pre-programmed digital settings for smoothies, crushed ice, purees and pulse functions with 1.5L thermal shock-resistant glass jug.",
      specs: JSON.stringify({ "Power": "1000W", "Capacity": "1.5 Litres", "Controls": "Digital Touch Screen", "Blades": "6-Point Serrated Steel" }),
      price: 49.99,
      comparePrice: 70.00,
      competitorName: "Amazon",
      savingAmount: 20.01,
      badge: "You save £20.01",
      image: "/assets/products/digital-blender.webp",
      stock: 15,
      rating: 4.9,
      reviewCount: 47,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 0
    },
    {
      slug: "joseph-joseph-duo-extending-steel-dishrack",
      name: "Joseph Joseph Duo Extending Steel Dishrack",
      categorySlug: "housewares",
      brand: "Joseph Joseph",
      description: "Extends to hold more items when needed. Features a movable cutlery drainer, raised ribs to prevent water being trapped under glasses, and an integrated spout that drains water straight into the sink.",
      specs: JSON.stringify({ "Design": "Extendable 2-part tray", "Drainage": "Integrated spout", "Material": "Stainless Steel & ABS", "Cutlery": "Movable pot included" }),
      price: 19.99,
      comparePrice: 27.59,
      competitorName: "B&Q",
      savingAmount: 7.60,
      badge: "You save £7.60",
      image: "/assets/products/joseph-dishrack.webp",
      stock: 30,
      rating: 4.8,
      reviewCount: 26,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 0
    },
    {
      slug: "karcher-k3-power-control-pressure-washer",
      name: "Kärcher K3 Power Control High Pressure Washer 120 Bar",
      categorySlug: "garden-growing",
      brand: "Kärcher",
      description: "The Kärcher K3 Power Control pressure washer lets you determine the right pressure for any surface. Simply twist the Vario Power spray lance to select SOFT, MEDIUM, or HARD pressure.",
      specs: JSON.stringify({ "Max Pressure": "120 Bar", "Water Flow": "380 L/h", "Hose Length": "7m", "Motor": "1600W Air-Cooled" }),
      price: 119.99,
      comparePrice: 144.99,
      competitorName: "B&Q",
      savingAmount: 25.00,
      badge: "You save £25.00",
      image: "/assets/categories/garden-growing.webp",
      stock: 12,
      rating: 4.9,
      reviewCount: 38,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 1
    },
    {
      slug: "stanley-fatmax-tape-measure-8m",
      name: "Stanley FatMax Tape Measure 8m / 26ft Extra Wide Blade",
      categorySlug: "diy-decorating",
      brand: "Stanley",
      description: "Class II accuracy tape with 32mm wide blade providing up to 3.3m standout for solo measuring. BladeArmor coating on first 150mm reduces fracture risk by 95%.",
      specs: JSON.stringify({ "Length": "8 Metres (26ft)", "Blade Width": "32mm", "Casing": "Impact-resistant bi-material", "Lock": "Cushioned slide lock" }),
      price: 18.99,
      comparePrice: 24.50,
      competitorName: "Amazon",
      savingAmount: 5.51,
      badge: "You save £5.51",
      image: "/assets/brands/stanley.webp",
      stock: 45,
      rating: 4.9,
      reviewCount: 71,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 0
    },
    {
      slug: "hozelock-compact-reel-25m-hose",
      name: "Hozelock Compact Free Standing Reel with 25m Hose & Fittings",
      categorySlug: "garden-growing",
      brand: "Hozelock",
      description: "Enclosed freestanding hose reel protects your garden hose against everyday wear and tear. Comes complete with 25m multi-purpose hose, spray nozzle and tap connectors.",
      specs: JSON.stringify({ "Hose Length": "25 Metres", "Includes": "Nozzle & Connectors", "Design": "Freestanding carrying handle" }),
      price: 34.99,
      comparePrice: 44.99,
      competitorName: "Screwfix",
      savingAmount: 10.00,
      badge: "You save £10.00",
      image: "/assets/brands/hozelock.webp",
      stock: 22,
      rating: 4.8,
      reviewCount: 19,
      isStaffPick: 0,
      isFeatured: 1,
      isDealOfTheDay: 0
    },
    {
      slug: "tower-vortx-compact-air-fryer-4l",
      name: "Tower Vortx 4L Digital Air Fryer with Rapid Air Circulation",
      categorySlug: "electricals",
      brand: "Tower",
      description: "Cook crispy golden meals using 99% less oil. Tower's rapid Vortx airflow technology cooks 30% faster than conventional ovens with 8 one-touch presets for chips, chicken, and baking.",
      specs: JSON.stringify({ "Capacity": "4 Litres", "Power": "1400W", "Temperature": "80°C - 200°C", "Timer": "60 Minutes", "Basket": "Non-stick dishwasher safe" }),
      price: 39.99,
      comparePrice: 54.99,
      competitorName: "Argos",
      savingAmount: 15.00,
      badge: "You save £15.00",
      image: "/assets/brands/tower.webp",
      stock: 28,
      rating: 4.8,
      reviewCount: 64,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 1
    },
    {
      slug: "heavy-duty-5-tier-garage-shelving-unit",
      name: "BargainStore Heavy Duty 5-Tier Boltless Garage Shelving Unit 175kg/Shelf",
      categorySlug: "housewares",
      brand: "BargainStore Pro",
      description: "Sturdy galvanised steel frame with 5 moisture-resistant MDF shelves. Quick boltless snap-together assembly. Each shelf holds up to 175kg evenly distributed (875kg total capacity).",
      specs: JSON.stringify({ "Dimensions": "180cm (H) x 90cm (W) x 40cm (D)", "Max Load": "875kg total (175kg per tier)", "Assembly": "Boltless slot-in", "Finish": "Corrosion resistant zinc" }),
      price: 27.99,
      comparePrice: 34.99,
      competitorName: "Screwfix",
      savingAmount: 7.00,
      badge: "Product of the Week",
      image: "/assets/categories/diy-decorating.webp",
      stock: 35,
      rating: 4.9,
      reviewCount: 88,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 1
    },
    {
      slug: "flymo-simpliglide-300-hover-lawnmower",
      name: "Flymo SimpliGlide 300 Hover Lawnmower 1700W 30cm",
      categorySlug: "garden-growing",
      brand: "Flymo",
      description: "Designed for small to medium gardens, the SimpliGlide 300 floats on a cushion of air and cuts easily in any direction. Lightweight and foldable with dual lever handles for compact storage.",
      specs: JSON.stringify({ "Cutting Width": "30cm", "Power": "1700W", "Cutting Heights": "4 Steps (10-30mm)", "Cable Length": "10m" }),
      price: 79.99,
      comparePrice: 94.99,
      competitorName: "Amazon",
      savingAmount: 15.00,
      badge: "You save £15.00",
      image: "/assets/brands/flymo.webp",
      stock: 18,
      rating: 4.8,
      reviewCount: 52,
      isStaffPick: 1,
      isFeatured: 1,
      isDealOfTheDay: 0
    }
  ];

  for (const p of productsData) {
    await client.execute({
      sql: `INSERT INTO products (slug, name, category_slug, brand, description, specs, price, compare_price, competitor_name, saving_amount, badge, image, stock, rating, review_count, is_staff_pick, is_featured, is_deal_of_the_day)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.slug, p.name, p.categorySlug, p.brand, p.description, p.specs, p.price, p.comparePrice, p.competitorName, p.savingAmount, p.badge, p.image, p.stock, p.rating, p.reviewCount, p.isStaffPick, p.isFeatured, p.isDealOfTheDay]
    });
  }

  console.log("Inserting sample orders with real product thumbnails...");

  const sampleOrders = [
    {
      orderNumber: "BS-2026-1049",
      customerName: "David Henderson",
      customerEmail: "david.h@example.co.uk",
      customerPhone: "07700 900123",
      shippingAddress: "42 High Street, Flat 2B",
      city: "Manchester",
      postcode: "M4 1HQ",
      deliveryMethod: "Express Next Day",
      subtotal: 69.98,
      shippingFee: 6.99,
      total: 76.97,
      status: "Shipped",
      paymentMethod: "Credit Card",
    },
    {
      orderNumber: "BS-2026-1050",
      customerName: "Sarah Jenkins",
      customerEmail: "s.jenkins@example.co.uk",
      customerPhone: "07800 900456",
      shippingAddress: "15 Victoria Road",
      city: "Birmingham",
      postcode: "B15 2TT",
      deliveryMethod: "Standard UK Delivery (Free over £50)",
      subtotal: 119.99,
      shippingFee: 0.00,
      total: 119.99,
      status: "Processing",
      paymentMethod: "PayPal Pay in 3",
    },
    {
      orderNumber: "BS-2026-1051",
      customerName: "Oliver Clarke",
      customerEmail: "oliver.c@example.co.uk",
      customerPhone: "07900 900789",
      shippingAddress: "8 Church Lane",
      city: "Edinburgh",
      postcode: "EH2 2EQ",
      deliveryMethod: "Click & Collect (Local Store)",
      subtotal: 19.99,
      shippingFee: 0.00,
      total: 19.99,
      status: "Delivered",
      paymentMethod: "Apple Pay",
    }
  ];

  for (const o of sampleOrders) {
    const res = await client.execute({
      sql: `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, city, postcode, delivery_method, subtotal, shipping_fee, total, status, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [o.orderNumber, o.customerName, o.customerEmail, o.customerPhone, o.shippingAddress, o.city, o.postcode, o.deliveryMethod, o.subtotal, o.shippingFee, o.total, o.status, o.paymentMethod]
    });

    const orderId = Number(res.lastInsertRowid);
    await client.execute({
      sql: `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [orderId, 1, "Dulux Matt Pure Brilliant White 7L", 19.99, 1, "/assets/products/dulux-paint.webp"]
    });
  }

  console.log("Database seeded successfully with authentic UK assets!");
}

seed().catch(console.error);
