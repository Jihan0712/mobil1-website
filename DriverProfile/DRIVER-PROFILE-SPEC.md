# Mobil Driver Profile: developer handover

Version 2026-10-13 · Octopus & Whale

This document is the single source of truth for building the Driver Profile quiz on the Mobil PH website. It replaces the logic sections of `Mobil-Driver-Profile-Lifestyle-First-Developer-Package.xlsx` wherever the two disagree.

## Files in this folder

| File | What it is | Use it for |
|---|---|---|
| `DRIVER-PROFILE-SPEC.md` | This document | Flow, copy, scoring, result assembly, states, QA |
| `persona-scoring.json` | Questions, answers, weights, stress tags, tie-break rules | Load directly as the scoring config |
| `Mobil-Driver-Profile-Final-Product-Map.xlsx` | 284 vehicle/engine rows, each with its Mobil product(s) | Vehicle dropdowns and the product lookup |

Figma: file `tpr6QkR9bSDpt0Kvkqnnyu`, page **01 Website — Desktop**, section **Driver Profile v2 — Lifestyle-first (Oct 2026)**. Frames `v2 / 01` to `v2 / 08`. Mobile screens are not designed yet.

---

## 1. The two rules that matter most

1. **The vehicle decides the oil. The persona decides the story.** Persona answers never change which product is shown. Products come only from the Final Product Map row for the owner's exact vehicle.
2. **Every vehicle returns a product.** All 284 rows have at least one Mobil product. There is no "no match" state for data. The only non-result state is a system error (request failed).

Never show SAE grades, API/ACEA specs, engine codes, oil capacity or the Better/Best source labels anywhere in the quiz. Product names may contain a grade (for example "Mobil 1™ 5W-30"), and that is fine.

---

## 2. Flow

```
Start → Q1 Vehicle → Q2 Pattern → Q3 Stress → Q4 Load → Q5 Care → Result
                                                                 ↘ Error (request failed)
```

Progress label reads `n of 5` on Q1–Q5. Back is available on every question. Answers persist when going back, and on the error screen.

| Step | Figma frame | Headline | Helper copy | Input | Rule | Primary button |
|---|---|---|---|---|---|---|
| Start | `v2 / 01 — Start` | What kind of driver are you when the road gets real? | Tell us what you drive and how you drive it. Five quick taps to find your driver profile and the Mobil oil made for your engine. | none | none | Find my profile |
| Q1 | `v2 / 02 — Q1 Vehicle` | First, what do you drive? | We match the Mobil oil to your engine. The next four questions are about you. | 3 dropdowns: Brand, Model, Engine | All required. Engine dropdown only when needed (see 4.2) | Continue |
| Q2 | `v2 / 03 — Q2 Pattern` | Every drive has a pattern. What's yours? | Choose the answer that best describes a normal week. | 4 image cards | Exactly 1 | Continue |
| Q3 | `v2 / 04 — Q3 Stress` | What puts the most pressure on your usual drive? | Choose up to two. | 4 image cards with checkbox | 1 or 2 | Continue |
| Q4 | `v2 / 05 — Q4 Load` | What does your car usually carry? | Think about most of your regular trips. | 4 image cards | Exactly 1 | Continue |
| Q5 | `v2 / 06 — Q5 Care` | How do you take care of what you worked hard for? | Choose the answer closest to your usual maintenance habit. | 4 image cards | Exactly 1 | See my driver profile |
| Result | `v2 / 07 — Result` | see section 6 | | | | View product |
| Error | `v2 / 08 — Result: connection error` | see section 7 | | | | Try again |

Continue stays disabled until the step's rule is met. On Q3, a third selection is blocked: show the third card as not selectable, or deselect the oldest choice. Pick one behaviour and keep it consistent.

If the website session already knows the owner's vehicle (for example from the product finder), pre-fill Q1. The owner still sees Q1 and can change it.

---

## 3. Answers, scores and stress tags

The full table is in `persona-scoring.json`. Persona IDs: `RITUALIST`, `VOYAGER`, `ESSENTIALIST`, `TACTICIAN`, `WORKHORSE`.

> `TACTICIAN` replaces `COMMUTER` from the original workbook. The scores are the same; only the name and copy changed.

| Answer ID | Card label | Support line | Ritualist | Voyager | Essentialist | Tactician | Workhorse | Stress tag |
|---|---|---|---|---|---|---|---|---|
| PATTERN_DAILY | The daily crawl | Short trips and stop-and-go traffic | | | | 4 | | Stop-and-go traffic |
| PATTERN_MIXED | A bit of both | City roads and expressways | | | 4 | | | Mixed city and highway use |
| PATTERN_OPEN | The open road | Highways and provincial routes | | 4 | | | | Long-distance driving |
| PATTERN_WORK | Working miles | Deliveries, fieldwork or rough roads | | | | | 4 | Demanding work use |
| STRESS_TRAFFIC | Heavy traffic | Frequent stopping and long idling | | | | 3 | | Heavy traffic and idling |
| STRESS_HEAT | Daily heat | Long hours under hot conditions | | | | | | Frequent heat |
| STRESS_ROUGH | Tougher roads | Dusty, rough or steep routes | | 1 | | | 3 | Rough, dusty or steep roads |
| STRESS_LONG | Long distances | Extended, uninterrupted drives | | 3 | | | 1 | Extended drives |
| LOAD_LIGHT | Just the essentials | Mostly me and a few belongings | | | 2 | | | Light everyday load |
| LOAD_PASSENGERS | A few passengers | Regular everyday trips | | | 1 | 1 | | Regular passengers |
| LOAD_FULL | A full cabin | Family, friends and their things | | | 1 | | 1 | Full cabin |
| LOAD_HEAVY | Heavy loads | Cargo, tools or work equipment | | | | | 3 | Cargo or heavy loads |
| CARE_AHEAD | I stay ahead | I track every PMS and oil change | 7 | | | | | Preventive maintenance |
| CARE_SCHEDULE | I stay on schedule | I rarely miss a service date | 3 | | 1 | | | Consistent maintenance |
| CARE_REMINDER | I need a reminder | I rely on my mechanic or notifications | | | 2 | | | Reminder-led maintenance |
| CARE_LOST | I've lost track | I honestly can't remember the last one | | | | | | Maintenance check needed |

The current Figma option cards show the label only. The support line is in the config so a later card variant can show it.

---

## 4. Logic

### 4.1 Persona scoring

Sum the scores of every selected answer (Q2 to Q5; Q1 is not scored). The highest total wins. On a tie, walk the tie-break rules in order and take the first rule whose persona is among the tied leaders and whose trigger answers include at least one selected answer:

| Order | Pick | If any of these were selected |
|---|---|---|
| 1 | RITUALIST | CARE_AHEAD |
| 2 | WORKHORSE | PATTERN_WORK, LOAD_HEAVY |
| 3 | VOYAGER | PATTERN_OPEN, STRESS_LONG |
| 4 | TACTICIAN | PATTERN_DAILY, STRESS_TRAFFIC |
| 5 | ESSENTIALIST | always (no trigger needed) |

If none apply, take the first tied persona in this order: RITUALIST, VOYAGER, ESSENTIALIST, TACTICIAN, WORKHORSE.

```ts
type PersonaId = 'RITUALIST' | 'VOYAGER' | 'ESSENTIALIST' | 'TACTICIAN' | 'WORKHORSE';

function scorePersona(selected: string[], config: ScoringConfig): PersonaId {
  const totals = Object.fromEntries(config.personas.map(p => [p, 0])) as Record<PersonaId, number>;
  const answers = new Map(config.questions.flatMap(q => q.answers).map(a => [a.id, a]));
  for (const id of selected) {
    for (const [p, v] of Object.entries(answers.get(id)!.scores)) totals[p as PersonaId] += v;
  }
  const max = Math.max(...Object.values(totals));
  const top = config.personas.filter(p => totals[p] === max);
  if (top.length === 1) return top[0];
  for (const rule of config.tie_break) {
    const triggered = rule.if_any_selected.length === 0 || rule.if_any_selected.some(a => selected.includes(a));
    if (top.includes(rule.pick) && triggered) return rule.pick;
  }
  return config.final_fallback_order.find(p => top.includes(p))!;
}
```

Every persona is reachable. Across all 640 possible answer combinations: Workhorse 27%, Ritualist 22%, Voyager 18%, Essentialist 16%, Tactician 16%.

### 4.2 Vehicle selection (Q1)

Source: the **Final Product Map** sheet.

1. **Brand** dropdown: distinct `Brand` values (27), sorted A to Z.
2. **Model** dropdown: rows for that brand, grouped by `Model` + `Generation / years`. Option label: `Model` alone when the model has one generation; otherwise `Model · Generation / years` (for example "Civic · 2016 – Present (FC, FE)").
3. **Engine** dropdown: rows in that brand + model + generation group, labelled with `engine_option_label`. When the group has only one row, hide the Engine dropdown and auto-select that row. 20 of 259 groups need it.
4. The selected row's `lookup_id` is the vehicle key for the rest of the session.

`engine_option_label` is already owner-friendly (displacement and fuel, no engine codes). Never show the raw `Engine` column to owners.

### 4.3 Product lookup

For the selected `lookup_id`:

| Field | Shown as | Rule |
|---|---|---|
| `final_primary_display` | Card under **Right for your vehicle** | Always present |
| `final_secondary_display` | Card under **Premium compatible option** | Hide the whole card when blank (81 rows are one-product) |
| `final_primary_key` / `final_secondary_key` | not shown | Join key to the CMS for packshot, product URL, SKU, benefit line |

`final_status` is `EXACT_TWO` or `EXACT_ONE` on every row. The **Product Catalogue** sheet lists the 13 product keys with display names; map each key to its CMS entry.

### 4.4 Stress tags

Collect the `stress_tag` of every selected answer from Q2 to Q5, in question order, and de-duplicate. That gives 4 or 5 tags. Show them as chips under "What your drive puts your engine through". If none were collected, show the persona's `default_tag`.

---

## 5. Persona content

| Field | THE TACTICIAN | THE VOYAGER | THE WORKHORSE | THE ESSENTIALIST | THE RITUALIST |
|---|---|---|---|---|---|
| `result_headline` | You're The Tactician. | You're The Voyager. | You're The Workhorse. | You're The Essentialist. | You're The Ritualist. |
| `full_description` | You know every shortcut and the exact minute to leave. But short trips, traffic, heat and constant stopping still add up. You need protection built for the daily grind. | Your car sees long stretches, changing roads and serious mileage. You prepare before every drive and expect protection that can keep up. | Your vehicle carries more, runs longer and works harder. Whether it is people, cargo or the job itself, you need protection that earns its place. | You keep car care practical and consistent. No unnecessary extras, no careless shortcuts, just the right protection to keep your car going longer. | You do not wait for problems to show. You track every PMS, choose every part carefully, and protect your car like the hard-earned asset it is. |
| `drive_truth` | You've mastered the route. Your engine still feels every stop. | The farther you go, the more dependable protection matters. | When your vehicle works for you, protection is part of the job. | Every choice must make sense today and protect your car's value tomorrow. | Proper maintenance is not an expense. It is proof you take care of what you own. |
| `default_tag` | Stop-and-go traffic | Long-distance driving | Heavy-duty use | Mixed everyday use | Preventive maintenance |
| `engine_context` | Frequent stopping, idling, short trips and daily heat create repeated engine stress, even when the distance looks ordinary. | Long, uninterrupted drives build mileage and sustained engine demand. Protection has to stay dependable across the distance. | Heavy loads, demanding routes and longer working hours raise the demands on your engine. Protection has to earn its place every day. | Mixed use puts different demands on your engine across traffic, open roads, passengers and routine trips. Consistency matters more than extras. | You stay ahead of wear instead of waiting for symptoms. Your driving conditions show where that protection matters most. |
| Banner image | Needs art direction | Needs art direction | Needs art direction | Workshop image in Figma | Needs art direction |

Shared copy for every persona:

- Eyebrow: `YOUR DRIVER PROFILE`
- Stress section heading: `WHAT YOUR DRIVE PUTS YOUR ENGINE THROUGH`
- Product heading: `Your Mobil recommendation`
- Primary label: `RIGHT FOR YOUR VEHICLE`
- Secondary label: `PREMIUM COMPATIBLE OPTION`
- Engine box heading: `What this means for your engine`
- Compatibility note: `Your driver profile tells the story of your drive. Your vehicle data makes sure the Mobil recommendation fits.`

---

## 6. Result page assembly

Order from top to bottom, matching `v2 / 07 — Result`:

1. Persona banner image
2. Eyebrow
3. `result_headline`
4. `full_description`
5. `drive_truth`, styled as a pull quote
6. Stress tag chips (section 4.4)
7. Product heading, then a small vehicle line: `Matched to your {Brand} {Model} {engine_option_label} · Change vehicle`. **Change vehicle** returns to Q1 with the Q2–Q5 answers kept.
8. Primary product card: packshot, name, benefit line. No viscosity or classification chips.
9. Secondary product card, only when `final_secondary_display` is present
10. Engine box: heading, `engine_context`, compatibility note
11. Buttons: **View product** (primary, links to the primary product's CMS URL) and **Retake the quiz** (secondary, back to Start with everything cleared)

When the primary product has no URL in the CMS yet, change the primary button to **Find a service center**.

---

## 7. Error state

Use this only when the product request fails or times out. It is never shown because of missing data.

- Keep the persona section (items 1–6) exactly as on the result page.
- Replace the product section with:
  - Heading: `We couldn't load your Mobil oil just now.`
  - Body: `Your answers are saved. Try again in a moment, and your recommendation will be right here.`
- Buttons: **Try again** retries the lookup without clearing answers. **Find a service center** is secondary.

---

## 8. Analytics events (suggested)

| Event | When | Properties |
|---|---|---|
| `dp_start` | Find my profile clicked | none |
| `dp_vehicle_selected` | Q1 Continue | `lookup_id`, `brand` |
| `dp_answer` | Each Q2–Q5 Continue | `question_id`, `answer_ids[]` |
| `dp_result_view` | Result shown | `persona_id`, `lookup_id`, `final_status` |
| `dp_product_click` | View product | `product_key`, `slot` (primary/secondary) |
| `dp_error` | Error state shown | `lookup_id`, error code |
| `dp_retake` | Retake the quiz | `persona_id` |

---

## 9. QA cases

### Scoring (verified against `persona-scoring.json`)

| # | Answers | Totals | Expected |
|---|---|---|---|
| 1 | PATTERN_DAILY, STRESS_TRAFFIC + STRESS_HEAT, LOAD_PASSENGERS, CARE_REMINDER | Tactician 8, Essentialist 3 | TACTICIAN |
| 2 | PATTERN_MIXED, STRESS_HEAT, LOAD_LIGHT, CARE_SCHEDULE | Essentialist 7, Ritualist 3 | ESSENTIALIST |
| 3 | PATTERN_OPEN, STRESS_LONG, LOAD_FULL, CARE_SCHEDULE | Voyager 7, Ritualist 3, Essentialist 2, Workhorse 2 | VOYAGER |
| 4 | PATTERN_WORK, STRESS_ROUGH, LOAD_HEAVY, CARE_LOST | Workhorse 10, Voyager 1 | WORKHORSE |
| 5 | PATTERN_DAILY, STRESS_TRAFFIC, LOAD_LIGHT, CARE_AHEAD | Ritualist 7, Tactician 7 (tie) | RITUALIST (tie-break rule 1) |
| 6 | PATTERN_DAILY, STRESS_HEAT, LOAD_LIGHT, CARE_SCHEDULE | Tactician 4, Ritualist 3, Essentialist 3 | TACTICIAN |
| 7 | PATTERN_OPEN, STRESS_ROUGH, LOAD_HEAVY, CARE_LOST | Workhorse 6, Voyager 5 | WORKHORSE |

### Vehicle and product

| Vehicle selection | Engine dropdown | Expected products |
|---|---|---|
| Toyota → Vios → 1.5L | shown (1.3L / 1.5L) | Mobil Super™ All-In-One Protection 5W-30 · Mobil 1™ 5W-30 |
| Toyota → Fortuner → 2.4L/2.8L Diesel | shown | Mobil Super™ Defense 15W-40 · Mobil Delvac 1™ 5W-40 |
| Honda → City · 2020 – Present (GN) | hidden (one row) | Mobil Super™ All-In-One Protection 0W-20 · Mobil 1™ 0W-20 |
| Mercedes → C-Class (W204/W205) | hidden | Mobil 1™ 0W-40 only; secondary card hidden |
| BYD → Dolphin / Atto 3 / Seal | hidden (EV, one row) | Mobil 1™ Synthetic Gear Lube LS 75W-90 only |
| Toyota → Hilux → 3.0L Diesel | shown (3 engines) | Mobil Super™ Defense 15W-40 · Mobil Delvac 1™ 5W-40 |

### Behaviour

- Q3 never accepts a third selection.
- Back from Result to Q5 keeps every answer selected.
- Change vehicle on Result returns to Q1 and keeps Q2–Q5 answers. The persona must not change; only the products may.
- Simulated API failure shows the error state with the persona intact. Try again recovers without re-answering.
- No SAE grade, spec code or engine code appears anywhere except inside product names.

---

## 10. Data notes and open risks

- **Where the product data came from.** 96 rows are unchanged from the client lube guide. The rest were corrected or filled by O&W from each engine's OEM grade and spec. Every changed row is highlighted yellow in the Final Product Map and has a rationale in the `Rationale` column.
- **Stock to confirm.** Mobil 1 0W-40, Mobil 1 ESP 5W-30 and Mobil 1 Synthetic Gear Lube are not in the client lube guide but appear in 67 product slots. Confirm they are sold in PH. If a product is not available, swap it in the Final Product Map, not in code.
- **Flagged rows.** 4 premium rows use the closest available Mobil 1, flagged `O&W: closest Mobil 1 (flag)`: BMW M S54/S65 (OEM 10W-60), Lamborghini Urus, Lamborghini Revuelto, Bentley Bentayga V8.
- **EVs.** The 3 EVs (BYD Dolphin / Atto 3 / Seal, Jetour Ice Cream EV, MG Cyberster) return gear lube for the reduction gearbox, because EVs have no engine oil. Their separate "reduction gearbox" source rows were merged into the EV row.
- **Rows merged or split.** Hilux and Strada were split into one row per engine (copied from Fortuner and Montero Sport). Nissan Patrol Y62's alternate 0W-20 row was merged into the 5.6L V8 row.
- **Copy change.** Tactician copy is new (renamed from Commuter). The other four personas use the workbook copy with light punctuation edits.
