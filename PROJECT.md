# Project: BargainStore.uk Launch Readiness

## Architecture
- **Framework & Runtime**: Next.js 15.1 (App Router), React 19, Node.js 22
- **Styling & Assets**: Tailwind CSS 3.4, Lucide React icons, real WebP assets in `public/assets/`
- **Database & ORM**: Turso libSQL SQLite client (`@libsql/client`), Drizzle ORM (`drizzle-orm`) with dual support for local SQLite (`file:local.db`) and Turso Cloud (`libsql://...`)
- **State Management**: React Context (`lib/cart-context.tsx`) with localStorage persistence for cart items and discount codes
- **Layout Architecture**:
  - Storefront: 3-tier header (`TopBar`, `MainHeader` with autocomplete search & cart drawer trigger, `CategoryNav` mega-menu), main content, UK trust `Footer`
  - Admin Portal: Dedicated admin layout suppressing storefront navbar/footer, sidebar navigation, real-time metrics, product management, order status updater, and Turso Edge DB console

## Code Layout
- `app/layout.tsx` — Global root layout, global fonts, base SEO metadata
- `app/admin/layout.tsx` — Admin layout suppressing storefront header/footer, providing admin navigation
- `app/admin/page.tsx` — Admin dashboard (sales revenue, order counts, catalog totals, low-stock alerts)
- `app/admin/products/page.tsx` — Product catalog manager with search and real-time deletion
- `app/admin/products/new/page.tsx` — New product creation form
- `app/admin/orders/page.tsx` — Customer orders table with status updater (Processing, Shipped, Delivered)
- `app/admin/turso/page.tsx` — Turso Edge DB console & metrics with link to Turso dashboard
- `app/api/search/route.ts` — Autocomplete search endpoint (< 300ms SLA)
- `app/api/orders/route.ts` — Order placement endpoint with UK postcode validation & DB persistence
- `app/api/orders/[id]/route.ts` — Order status update endpoint (PATCH)
- `app/api/turso/route.ts` — Turso connection and metrics endpoint (aliased to /api/turso-status)
- `app/basket/page.tsx` — Dedicated basket page (£50 free shipping threshold & BARGAIN10 voucher)
- `app/checkout/page.tsx` — Two-step checkout with UK postcode validation & persistent voucher
- `app/order-confirmation/[orderNumber]/page.tsx` — Live order summary from Turso DB
- `app/product/[slug]/page.tsx` — Product detail page with dynamic SEO metadata & JSON-LD
- `app/category/[slug]/page.tsx` — Category page with subcategory filtering & dynamic SEO
- `app/sitemap.ts` & `app/robots.ts` — Search engine discovery configuration
- `components/Navbar.tsx` & `components/Footer.tsx` — Storefront navigation, mega-menu, search, UK trust credentials
- `components/CartDrawer.tsx` — Slide-out basket drawer
- `lib/cart-context.tsx` — Unified cart & discount voucher state management
- `lib/validation.ts` — UK postcode regex and data sanitization
- `tests/` — Automated test suites (Tiers 1-5)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Real Asset Integration | 6 brand logos & 5 payment badges in authentic WebP format in public/assets | M1 | survey |
| 2 | Responsive 3-Tier Navigation | Top bar, main header with search & basket drawer trigger, category mega-menu | M1 | survey |
| 3 | Autocomplete Search SLA | Debounced search at /api/search?q=... returning matching products < 300ms | M1 | survey |
| 4 | Basket Math & Voucher Persistence | £50 UK free delivery threshold and BARGAIN10 (10% off) preserved across basket, checkout, and DB | M1 | survey |
| 5 | UK Postcode Regex Validation | Validation of UK postcodes on checkout form and /api/orders endpoint | M1 | survey |
| 6 | Persistent Order Creation | Insertion into orders and order_items tables in Turso SQLite | M1 | survey |
| 7 | Live Order Confirmation | Order confirmation page displaying live details fetched from database | M1 | survey |
| 8 | Category Subcategory Filter | Filter products by ?sub=... on /category/[slug] | M1 | survey |
| 9 | Informational & Route Fallbacks | Routes/redirects for /cart, /terms, /privacy, /cookies, /about | M1 | survey |
| 10 | Admin Layout Isolation | Isolate /admin routes so public storefront Navbar and Footer do not wrap them | M2 | survey |
| 11 | Admin Dashboard Overview | Revenue, order count, catalog count, low-stock inventory alerts at /admin | M2 | survey |
| 12 | Admin Catalog Management | Search, view, and delete products in real-time at /admin/products | M2 | survey |
| 13 | Admin Product Creation | Create product at /admin/products/new with instant storefront appearance | M2 | survey |
| 14 | Admin Order Status Updater | Customer order fulfillment status (Processing, Shipped, Delivered) persisting to DB | M2 | survey |
| 15 | Turso Console & Route | /admin/turso live table metrics, /api/turso endpoint, and link to https://app.turso.tech/ghulam--mujtaba | M2 | survey |
| 16 | Root & Dynamic SEO Metadata | metadataBase, titles, descriptions, OpenGraph, Twitter tags for all routes | M3 | survey |
| 17 | JSON-LD Structured Data | UK schema.org JSON-LD for Product, BreadcrumbList, Organization | M3 | survey |
| 18 | Sitemap & Robots Discovery | app/sitemap.ts and app/robots.ts generating clean XML/robots endpoints | M3 | survey |
| 19 | UK Retail Trust Signals | VAT registration number, Company number, registered office, Royal Mail/DPD terms in Footer | M3 | survey |
| 20 | E2E Test Suite (Tiers 1-4) | Comprehensive opaque-box test suite verifying all features derived from requirements | E2E Track | survey |
| 21 | Final E2E Pass & Tier 5 Hardening | 100% pass rate on E2E test suite + white-box adversarial coverage hardening | M4 | survey |
| 22 | Clean Production Build & Run | npm run build exit code 0, clean TypeScript check, and port 3000 local server validation | M4 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Storefront Core & Checkout Integration | CartContext voucher persistence, UK postcode validation, order flow, subcategory filter, route fallbacks | none | IN_PROGRESS |
| M2 | Admin Suite & Turso Connectivity | Admin layout isolation, /api/turso endpoint, order status updater, live metrics, Turso link | M1 contracts | IN_PROGRESS |
| M3 | SEO, JSON-LD & UK Trust Signals | MetadataBase, OpenGraph, schema.org JSON-LD, sitemap, robots, UK VAT/company trust in Footer | none | IN_PROGRESS |
| E2E | E2E Testing Suite (Parallel Track) | Design & implement opaque-box test harness and test suite (Tiers 1-4), publish TEST_READY.md | none | IN_PROGRESS |
| M4 | Final Verification & Hardening | Pass 100% of E2E tests, Tier 5 adversarial hardening, zero-error production build, local server run | M1, M2, M3, E2E | PLANNED |

## Interface Contracts
### CartContext ↔ Basket & Checkout
- `CartContext` exports:
  - `promoCode: string | null`
  - `discountPercent: number`
  - `discountAmount: number`
  - `applyPromo: (code: string) => { success: boolean; message: string }`
  - `removePromo: () => void`
  - `subtotal: number`
  - `shippingFee: number` (0 if subtotal >= 50 else 4.99)
  - `grandTotal: number` (subtotal - discountAmount + shippingFee)
- Voucher `BARGAIN10`: applies 10% discount to `subtotal`.

### Checkout Form ↔ `/api/orders`
- Payload:
  ```json
  {
    "customerName": "string (min 2 chars)",
    "customerEmail": "valid email regex",
    "customerPhone": "string",
    "shippingAddress": "string",
    "city": "string",
    "postcode": "valid UK postcode regex: /^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$/i",
    "deliveryMethod": "string",
    "items": [{ "productId": 1, "quantity": 1, "price": 19.99 }],
    "promoCode": "BARGAIN10 | null",
    "discountAmount": 0.00,
    "paymentMethod": "Credit Card | PayPal | Apple Pay | Google Pay"
  }
  ```
- Response: `{ "success": true, "orderNumber": "BS-XXXXXX", "orderId": number }`

### Admin Orders ↔ `/api/orders/[id]`
- Method: `PATCH`
- Payload: `{ "status": "Processing" | "Shipped" | "Delivered" }`
- Response: `{ "success": true, "order": { "id": number, "status": string } }`

### Admin / Turso ↔ `/api/turso`
- Method: `GET`
- Response:
  ```json
  {
    "status": "connected",
    "databaseUrl": "file:local.db" | "libsql://...",
    "counts": { "products": number, "categories": number, "orders": number, "order_items": number },
    "tursoDashboardUrl": "https://app.turso.tech/ghulam--mujtaba"
  }
  ```
