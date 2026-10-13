# Mobil PH website — Dev handoff (13 Oct 2026)

Figma file: `tpr6QkR9bSDpt0Kvkqnnyu` (Mobil Website). Everything below is already in the file. This note tells you where to look and what changed.

---

## 1. Figma file structure (cleaned up today)

| Page | What it is | Build from it? |
|---|---|---|
| Cover | Cover only | No |
| 01 Website — Desktop | All desktop screens | **Yes** |
| 02 Website — Mobile | All mobile screens | **Yes** |
| 03 Design System | Components (Button, Select, Product card, Header, Footer, etc.) | Reference |
| 04 Foundations | Colour, type, spacing tokens | Reference |
| 05 Sitemap & Status | Page map | Reference |
| 06 Social Posts (not website) | Social media graphics | No |
| 07 Explorations (not final) | Hero v2 sketches | No |

On pages 01 and 02 there is a yellow **READ ME — for dev** note at the top-left of the canvas. Read it first.

**Final screens live inside the section named `CURRENT SCREENS — Desktop (final for dev)` / `CURRENT SCREENS — Mobile (final for dev)`.** Frames in that section:

- 10 — Products (desktop) / 12 — Products — Mobile
- 11a–11e — Product Detail (one per product family: Mobil 1, Mobil Super, Mobil Delvac, Mobil Super Moto, Fluids/ATF) / 13a–13e on mobile
- 12 — Service Centers / 18 — Service Centers — Mobile
- 15 — About / 14 — About — Mobile

Frames **outside** the section are also current: Homepage, Driver Profile (all steps), Engine Stress, Search, Legal, Contact, and the `Overlay — …` frames (modals and drawers).

Ignore anything named `Local/…` — those are prototype-only component sets (accordion states, header hover, AI assistant launcher). Do not build them as pages.

Old frames (10A–10D category pages, the 9-product Products page, old Product Detail, old Service Centers, old About, the Archive page) were **deleted**. If you had them bookmarked, the links are dead on purpose.

---

## 2. Products page — now an accordion by category

Replaces the single long list. Same cards, same data, grouped.

**Structure**
```
Catalogue hero (navy)  →  Toolbar ("31 products" + "Filter" button)
→ "All Mobil products" H2
→ Category accordion (4 items, 1px top border)
    ├ Cars & light vehicles (12)      — open by default
    ├ Commercial vehicles & trucks (5) — closed
    ├ Motorcycles & scooters (6)       — closed
    └ Fluids, gear oils & greases (8)  — closed
→ "Not sure which oil fits?" CTA block
```

**Accordion item spec**
- Header row: full content width (1248 desktop / 350 mobile), 1px bottom border `#E0E0E0`, padding 24px top/bottom desktop, 20px mobile. The **whole header row is the click target**, not just the chevron.
- Left: category title (EMprint Semibold 28px desktop / 24px mobile, navy `#001450`) + count ("12 products", EMprint Regular 16px / 14px, `#5A5A5A`), baseline-aligned, 12px gap.
- Right: chevron 14×9, 2px stroke `#001450`, round caps. Points **down** when closed, rotates 180° when open. 300ms ease-in-out.
- Body: padding 32px top / 40px bottom desktop (20 / 32 mobile), contains the existing product grid (3 columns desktop, 2 columns mobile, 20px gap desktop / 12px mobile).
- Items are independent (opening one does not close the others). Desktop and mobile behave the same.
- Use `<button aria-expanded>` on the header and `role="region"` on the body. Respect `prefers-reduced-motion` (no rotate/slide animation).

In Figma: each category is a component set `Local/Accordion — <category>` with `State=Expanded` / `State=Collapsed`. Click the header in Present mode to see the toggle.

---

## 3. Product filter — fields changed

The old filter (Fuel type, Driving conditions, Viscosity, Oil technology) had fields with no column in the product masterlist. Replaced with fields that map 1:1 to masterlist data:

| Field | Options come from | Default label |
|---|---|---|
| Product category | The 4 accordion categories | All categories |
| Viscosity grade | SAE Rating column (0W-20, 0W-30, 0W-40, 5W-30, 5W-40, 5W-50, 10W-30, 10W-40, 15W-40, 20W-50, 75W-90, 80W-90; ATF/CVT have none) | All viscosity grades |
| Performance standard | API / ACEA / ILSAC columns (e.g. API SQ, API CI-4, API GL-5, ACEA C3, ILSAC GF-7A) | All standards |
| Pack size | Parsed from SKU names (0.8L, 1L, 4L, 5L, 20L pail, 208L drum, 120ml, 500ml, 1 QT, 0.39kg cartridge) | All pack sizes |

- Multi-select where it makes sense. Results update on confirm ("Show 31 products" button; count must be live).
- "Reset filters" clears all four.
- The toolbar button is now just **"Filter"** (there are no sort controls, so "Filter & sort" was wrong).
- Same overlay on desktop (`Overlay — Products Filter — Desktop`, 400×760 side panel) and mobile (`Overlay — Products Filter — Mobile`, full-width bottom sheet).
- Hero intro copy was updated to match: "Browse by category, viscosity grade, performance standard, or pack size…"

---

## 4. Product data — 31 products from 55 SKUs

Source of truth: `MOBIL PRODUCT MASTERLIST.xlsx`, sheet **Product List**. 55 SKU rows collapse to 31 products (pack sizes merge into one product). Two naming corrections made in the design, apply them in data too:

| Masterlist says | Use this name | Why |
|---|---|---|
| MOBIL SUPER MOTO SCOOTER GO 20X120ML | Mobil Super Moto™ Scooter Gear Oil (120ml) | "GO" = Gear Oil. Confirmed against Mobil PH product data sheet and Lazada TH listing. 80W-90, API GL-4. |
| Mobilube 1 SHC 75W-90 (PDS code) | Mobil 1™ Syn Gear Lube LS 75W-90 | The SKU name is the product; the PDS code is the EU equivalent. |

**Still "Description pending" (masterlist has no description/features for these 7):** ESP 0W-30, Friction Fighter 15W-40, Super Moto 20W-50, Scooter Gear Oil, Mobilgrease XHP 222, Brake Fluid DOT 4, Delvac 1 (partial). The cards show an orange "DATA PENDING" eyebrow and placeholder benefit copy. Ask Allied for these; do not invent.

---

## 5. Packshots — use the normalized set

Folder: `output/packshots-oct2026/`

- `normalized/` — **use these.** All 31 products, 1000×1000 transparent PNG, bottle sits on a shared shelf line (bottom at 90% of canvas). Visual-size rule is already baked in: 1L bottles 72% height, 800ml 68%, 500ml 60%, 120ml 56%, 4L jugs and 20L pails 80% (padded, never edge to edge), grease cartridge 76%. Drop them into the card's image slot with `object-fit: contain` on the grey `#F6F6F6` background and they line up.
- `_contact-sheet.png` — all 31 side by side for a quick check.
- Root of the folder — the 14 raw source images for the products that were missing, plus `SOURCES.md` listing where each came from.

Card image slot: 403×320 desktop, 169×169 mobile, background `#F6F6F6`, no white box behind the bottle (the PNGs are transparent).

**Quality caveats, hand these to Allied:**
- 319px originals (fine on cards, soft at retina/detail size): ESP 5W-30, ESP 0W-30, Delvac Legend Complete Defense, Scooter Gear Oil, Dexron-VI, Scooter 10W-40, Racing 4T.
- Retailer photos, not official packshots: CVTF Multi-Vehicle, Brake Fluid DOT 4.
- Shown as 4L jug but the SKU list also has 1L: ESP 5W-30, ESP 0W-30, AIO 0W-20, Friction Fighter 5W-30, Friction Fighter 15W-40. If a pure 1L shelf is wanted, these five need 1L shots.
- Mobilube HD shown as 20L pail; the PH SKU is 1L. No clean 1L shot exists online.

---

## 6. About page — Allied Lubrication section

Desktop section is 1440×766 (was 884). Two-column: navy `#001450` text panel 720px + photo panel 720px with 36px padding and 24px radius.

**Text column** (padding 96 top/bottom, 120 left, 96 right, 28px gap, vertically centred):
1. Eyebrow — "ABOUT ALLIED LUBRICATION", EMprint Semibold 12px, letter-spacing 8%, white 72%
2. Heading — "Official Mobil products, supported locally.", EMprint Semibold 44px, line-height 1.1, letter-spacing -2%, white
3. Lead — EMprint Regular 18px, line-height 1.5, white 92%
4. Hairline — 1px white 24%
5. Two columns, 40px gap: VISION / MISSION — label as eyebrow style, body EMprint Regular 15px line-height 1.5 white 92%
6. Hairline
7. HEAD OFFICE — label + address, phone on its own line

**Photo**: the source image is landscape (1672×941). Crop is anchored to the **right edge** so both people are in frame. CSS: `object-fit: cover; object-position: 98% 50%`.

**Mobile**: same copy and label treatment, stacked, on the light `#F6F7F9` background with navy/grey text.

Final copy (use verbatim):

> **Official Mobil products, supported locally.**
> Allied Lubrication Supply Corp. (ALSC), an affiliate of Juliana Holdings Inc., is the authorized distributor of Mobil products to the consumer market in Luzon and Visayas: Mobil 1, Mobil Super, Mobil Delvac, and Mobil Super Moto.
> **Vision** — To be the leading distributor of premium lubricants in the Philippines, recognized for excellence, innovation, and sustainability.
> **Mission** — To provide the highest quality lubricants and exceptional service, so our customers’ vehicles and machinery perform longer.
> **Head office** — 538 Jenny’s Avenue, Brgy. Maybunga, Pasig City 1607, Metro Manila · Tel. 8395-1771

---

## 7. Open items

- [ ] Allied: descriptions for the 7 "Data pending" products
- [ ] Allied / ExxonMobil asset library: hi-res packshots for the 7 low-res items and the 2 retailer photos
- [ ] Decide: 1L shots for the five 4L-jug products, or keep jugs
- [ ] Dev: the Live Server devtunnel (`hnr4cdn3-5500…`) was dead when checked; share a fresh link when you want a QA pass on the build
