# Untold — the curated mystery-box engine

> *"You set the budget and the vibe. We decide the rest."* The product **is** the surprise.
> A buyer sets a budget and a few **taste tags** ("horror books," "spicy snacks," "desk
> gadgets"); a recommendation engine assembles a **coherent themed box** from live inventory;
> and a **scroll-driven 3D reveal** delivers a satisfying unboxing — physical and digital.

**Type:** embeddable **module** (drop-in checkout + curation API + reveal widget) **and** a
standalone demo store.
**Stack:** FastAPI · SQLite · React + Vite · Three.js · GSAP · Lenis.

---

## 1. The problem & the wedge

Mystery boxes are a large, fast-growing category — **~$13.5B in 2024, projected ~$31B by
2031**. The leaders teach two lessons: **FabFitFun** turns passive subscribers into active ones
with a **seasonal choice window**; **Loot Crate** wins on **packaging that builds tension** —
layers and secret compartments. But most boxes are either (a) a fixed monthly drop everyone
gets, or (b) "random filler" with weak personalization.

**Untold's two engineering bets — and its wedges:**

1. **Preference → inventory matching is the product.** Not a fixed box: a **constraint solver +
   taste model** assembles each box live to satisfy budget + tags + variety while clearing the
   right inventory. Quality of match is the moat.
2. **The reveal is a designed experience.** A **scroll-scrubbed 3D unboxing** (ribbon unties,
   lid lifts, light spills, items rise) — with **spoiler control** (choose how much to know) —
   makes the digital moment as good as the physical one.
3. **It's a module.** Any store can add "build me a mystery box" checkout via a drop-in widget +
   API, white-labeled — and it **composes with DuskDrop's** Surprise Surplus Bags.

### Benchmark

| Capability | FabFitFun | Loot Crate | Generic mystery box | **Untold** |
|---|---|---|---|---|
| Themed curation | ✅ | ✅ (fandom) | partial | ✅ |
| **Per-user preference matching** | partial (choice window) | ❌ | ❌ | ✅ **engine** |
| Budget-driven assembly | ❌ | ❌ | partial | ✅ **knapsack solver** |
| **Designed digital reveal** | photos | packaging | ❌ | ✅ **3D scroll reveal** |
| Spoiler control | ❌ | ❌ | ❌ | ✅ |
| Embeddable into other stores | ❌ | ❌ | ❌ | ✅ **module** |

---

## 2. Users & core journeys

**Buyer**
1. **Taste quiz / tag picker** + **budget slider** + cadence (one-off or subscription) + rarity
   tier.
2. The **curation engine** assembles a box (hidden); buyer sees theme + value range + spoiler
   level they chose.
3. Checkout (mock pay in dev). On ship/open: the **reveal experience** unboxes it.
4. **Rate items** → taste model improves the next box. Optionally **trade/regift** duplicates.

**Merchant / host (module mode)**
- Maps their catalog into Untold's taggable inventory; embeds the "build a mystery box"
  widget + reveal; receives webhooks; white-labels the theme.

---

## 3. Feature set

### 3.1 Core
- **Preference capture:** tag picker (categories, vibes, no-go tags/allergies), budget slider,
  cadence, rarity tier.
- **Curation engine:** assembles a box from live inventory honoring budget, tags, variety, and
  no-repeat-from-past constraints. Deterministic + explainable (so the reveal can say *why*).
- **Checkout & fulfillment:** order, pick/pack list, shipping (mock in dev).
- **Reveal experience:** the 3D scroll unboxing + item cards.
- **Ratings & taste profile:** feed back into future curation.

### 3.2 ✨ New / signature features

1. **Scroll-driven 3D reveal with spoiler control** — the box unwraps as you scroll (ribbon,
   lid, light, items rise). Buyer pre-chooses spoiler level: **Sealed** (zero hints until
   delivery), **Teased** (category silhouettes), or **Glimpse** (one item shown). The reveal
   respects it.

2. **Taste graph that learns** — ratings, keeps, and returns update a per-user **taste
   embedding**; the **Taste-Learning agent** nudges future boxes toward what landed and away
   from misses, while preserving surprise (it won't just send the same thing twice).

3. **Rarity tiers & "golden item" chase** — boxes have tiers (Standard / Rare / Legendary) with
   a small chance of a **golden item**; a collection/streak page and shareable pulls drive
   the FabFitFun-style engagement and Loot-Crate tension — without becoming a loot-box gamble
   (value floor guaranteed; odds disclosed).

4. **Trade & regift marketplace** — got a duplicate or a miss? List it for **trade** with other
   subscribers or **regift** it (re-route, no reshipping to you). Closes the loop and reduces
   waste (and composes neatly with DuskDrop's ethos).

### 3.3 Module / embeddability
- **Drop-in widget:** `<div data-untold="builder|reveal">` + `<script>`, themeable via CSS vars.
- **Curation API + webhooks:** `assemble`, `order`, `reveal-config`; webhooks `box.assembled`,
  `box.shipped`, `box.opened`, `item.rated`.
- **White-label** theme tokens; can be mounted on any existing storefront.

---

## 4. The curation engine (the hard, interesting part)

A box is a **constrained selection problem**:

- **Inputs:** budget `B`, include-tags, exclude-tags/allergies, target item count range, rarity
  tier, user taste embedding, no-repeat set (past items), per-item cost + value + stock.
- **Objective:** maximize *taste match + theme coherence + perceived value* subject to
  `Σ cost ≤ B`, variety (don't send 4 near-identical items), stock availability, and
  inventory-balancing weights (gently favor overstock, ration scarce items).
- **Method (dev):** a **greedy + knapsack-style** solver over tagged inventory, scored by
  cosine similarity to the taste embedding and theme cohesion, with diversity and
  inventory-balance penalties; seedable for reproducibility. Pluggable for a stronger optimizer
  later. The selection is **explainable** (per-item reason), which powers both the reveal
  narrative and trust.

---

## 5. Data model (SQLite dev)

```
Item(id, name, category, tags_json, cost, retail_value, stock, rarity(enum: std|rare|legendary),
     image, attributes_json)
Box(id, user_id, status(enum: assembling|assembled|shipped|opened|rated),
    budget, tier, spoiler_level(enum: sealed|teased|glimpse), theme, value_total, created_at)
BoxItem(id, box_id, item_id, reason, is_golden(bool))
TasteProfile(user_id, embedding_json, liked_tags_json, disliked_tags_json, updated_at)
Preference(id, user_id, include_tags_json, exclude_tags_json, budget, cadence, tier)
Rating(id, user_id, item_id, score(1-5), kept(bool), created_at)
TradeListing(id, user_id, box_item_id, want_tags_json, status(enum: open|matched|closed))
HostSite(id, name, api_key, theme_tokens_json, webhook_url)        # module mode
```

## 6. API surface (selected)

```
POST /api/preferences        { include_tags, exclude_tags, budget, cadence, tier, spoiler }
POST /api/boxes/assemble     { preference_id } -> assembled box (respecting spoiler level)
GET  /api/boxes/{id}/reveal  -> reveal config (item order, spoiler rules, narrative)
POST /api/boxes/{id}/order
POST /api/ratings            { item_id, score, kept }
GET  /api/taste/me
POST /api/trades             { box_item_id, want_tags }     ·   GET /api/trades?match=me
# Agentic
POST /api/agents/curate          { preference_id } -> assembled box + per-item reasons
POST /api/agents/taste-update    { user_id }       -> refreshed taste embedding
GET  /api/agents/inventory-plan                    -> overstock/scarcity weights
POST /api/agents/reveal-story    { box_id }        -> personalized reveal narrative + card
# Module
GET  /api/host/widget-config  ·  POST /api/host/webhooks/test
```

OpenAPI docs at `/docs`.

## 7. Agentic layer (Gemma) — summary

Full spec in [`AGENTS.md`](AGENTS.md). Four agents:

1. **Curation Agent** — assembles the box from inventory honoring budget/tags/variety/no-repeat;
   produces per-item reasons.
2. **Taste-Learning Agent** — updates the user's taste embedding from ratings/keeps/returns;
   improves the next box while preserving surprise.
3. **Inventory-Balancing Agent** — computes overstock/scarcity weights so curation clears the
   right stock without starving popular tags.
4. **Reveal-Narrative Agent** — writes the personalized unboxing story/card ("why we picked
   this for you").

## 8. Milestones
- **M0** Specs & design (this repo).
- **M1** Inventory + tags + preference capture (quiz, budget, tier, spoiler).
- **M2** **Curation engine** (solver) + explainable selection + checkout (mock).
- **M3** **3D scroll reveal** + spoiler control + item cards.
- **M4** Ratings + **taste graph** + rarity/golden-item + collection page.
- **M5** Gemma agents (curation, taste, inventory, reveal-story).
- **M6** **Trade/regift** marketplace.
- **M7** **Module mode**: widget, curation API, webhooks, white-label; compose with DuskDrop.

## 9. Run (once implemented)
```bash
cd backend && uv sync && uvicorn app.main:app --reload     # http://localhost:8000/docs
cd frontend && npm install && npm run dev                  # http://localhost:5173
```

See [`DESIGN-INSTRUCTIONS.md`](DESIGN-INSTRUCTIONS.md) and [`AGENTS.md`](AGENTS.md).

---

### Sources (benchmark)
- Mystery-box market size & 2031 projection; FabFitFun seasonal customization; Loot Crate
  tension-building unboxing — overview: https://cravin.com/blog/what-is-a-mystery-box-everything-you-need-to-know
- Loot Crate: https://lootcrate.com/
