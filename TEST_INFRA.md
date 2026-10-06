# E2E Test Infra: BargainStore.uk

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md` and user-facing specifications without dependence on internal module implementations.
- Systematic 4-tier methodology:
  - **Tier 1 — Feature Coverage (≥5 per feature)**: Isolated happy-path verification of all 22 features with representative inputs.
  - **Tier 2 — Boundary & Corner Cases (≥5 per feature)**: Limits, empty inputs, max inputs, zero/negative, malformed UK postcodes, voucher boundary thresholds (£49.99 vs £50.00).
  - **Tier 3 — Cross-Feature Combinations (Pairwise)**: State interactions (search -> add to basket -> apply voucher -> checkout -> order confirmation -> admin status update).
  - **Tier 4 — Real-World Application Scenarios (≥5 realistic workloads)**: Realistic end-to-end UK hardware customer and store admin journeys.

## Test Architecture
- Test runner: Node 22 native test runner (`node --test tests/**/*.test.mjs` or `tests/**/*.test.ts`)
- Test harness entry point: `npm test` script configured in `package.json`
- Directory layout:
  - `tests/tier1/` — Feature coverage tests
  - `tests/tier2/` — Boundary and edge case tests
  - `tests/tier3/` — Pairwise integration and state flow tests
  - `tests/tier4/` — Real-world customer & admin scenarios
- Pass/Fail semantics: Exit code 0, all assertions pass with zero failures.

## Feature Inventory Coverage Targets
| # | Feature | Requirement Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------------|:------:|:------:|:------:|:------:|
| 1 | Real Asset Integration | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ | ✓ |
| 2 | Responsive 3-Tier Navigation | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ | ✓ |
| 3 | Autocomplete Search (< 300ms) | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ | ✓ |
| 4 | Basket Math & Free Delivery (£50) | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ | ✓ |
| 5 | Voucher Calculation (BARGAIN10) | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ | ✓ |
| 6 | UK Postcode Regex Validation | ORIGINAL_REQUEST R1, AC | 5 | 5 | ✓ | ✓ |
| 7 | Persistent Order Creation (DB) | ORIGINAL_REQUEST R1, AC | 5 | 5 | ✓ | ✓ |
| 8 | Live Order Confirmation Page | ORIGINAL_REQUEST R1, AC | 5 | 5 | ✓ | ✓ |
| 9 | Category & Subcategory Filter | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ | ✓ |
| 10 | Route Fallbacks (/cart, /terms) | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ | ✓ |
| 11 | Admin Layout Isolation | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ | ✓ |
| 12 | Admin Dashboard Overview | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ | ✓ |
| 13 | Admin Catalog Management | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ | ✓ |
| 14 | Admin Product Creation | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ | ✓ |
| 15 | Admin Order Status Updater | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ | ✓ |
| 16 | Turso Console & Route | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ | ✓ |
| 17 | Root & Dynamic SEO Metadata | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ | ✓ |
| 18 | JSON-LD Structured Data | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ | ✓ |
| 19 | Sitemap & Robots Discovery | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ | ✓ |
| 20 | UK Retail Trust Signals | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ | ✓ |
| 21 | Zero-Error Production Build | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ | ✓ |
| 22 | Local Production Server Run | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ | ✓ |

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Complete Hardware Shopper Journey | F1, F2, F3, F4, F5, F6, F7, F8 | High |
| 2 | Discount Threshold Edge Journey | F4, F5, F6, F7, F8 | Medium |
| 3 | Admin Catalog & Stock Management | F11, F12, F13, F14, F15 | High |
| 4 | Order Fulfillment Lifecycle | F6, F7, F11, F14, F15 | High |
| 5 | UK Trust & SEO Audit Crawl | F1, F9, F10, F16, F17, F18, F19 | Medium |

## Coverage Thresholds
- Tier 1: ≥ 110 test cases (≥5 per feature across 22 features)
- Tier 2: ≥ 110 test cases (boundary, malformed inputs, edge values)
- Tier 3: ≥ 22 pairwise interaction test cases
- Tier 4: ≥ 5 realistic application-level scenarios
- Total test cases: ≥ 247 test cases
