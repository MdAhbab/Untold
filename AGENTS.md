# Untold — Agentic Layer (Gemma)

Untold ships **four Gemma-powered agents** around the curation engine. The deterministic
solver (budget/knapsack/variety constraints) does the hard combinatorial work; **Gemma adds
the judgment, the learning, and the voice**: interpreting fuzzy taste, deciding *why* an item
fits the theme, balancing inventory, and writing the reveal narrative. Agents never charge a
card or ship a box on their own — assembly produces a box the buyer confirms at checkout.

**Runtime:** system prompt + tool registry + I/O schema per agent; FastAPI workers in dev.
Every run logged to `AgentRun(id, agent, input, output, confidence, ts)`. Curation
is **seedable** so a given box is reproducible and explainable.

> **Implementation status (dev).** The deterministic core is real and shipping:
> [`backend/app/curation.py`](backend/app/curation.py) enforces budget / stock /
> exclude-tags / no-repeat and scores taste + theme + value + inventory balance, seeded and
> explainable. The four agents below run today as **deterministic Python** (the Curation Agent
> *is* the solver; Taste-Learning nudges weights from stored ratings; Inventory-Balancing reads
> live stock; Reveal-Narrative composes grounded copy from real per-item reasons). Swapping the
> judgment/voice layer for an LLM (Gemma) behind the same I/O schema is the roadmap — the
> deterministic guardrails stay regardless.

---

## Shared tool registry

| Tool | Signature | Notes |
|------|-----------|-------|
| `inv.search` | `(tags?, exclude?, budget?, in_stock=true) -> Item[]` | Tagged inventory query. |
| `inv.weights` | `() -> {overstock[], scarce[]}` | Inventory-balancing signals. |
| `solver.assemble` | `(constraints, scored_items, seed) -> {items[], value, slack}` | Deterministic budget/variety solver. |
| `taste.embed` | `(user_id) -> embedding` | Current taste vector. |
| `taste.score` | `(items, embedding) -> scores[]` | Cosine match per item. |
| `history.past_items` | `(user_id) -> item_ids[]` | No-repeat set. |
| `content.write` | `(facts, tone) -> copy` | Short, grounded narrative copy. |

The agents **score and reason**; `solver.assemble` enforces the hard constraints (never over
budget, never out of stock, respects excludes). No fabricated items or prices — everything is
drawn from `inv.search`.

---

## Agent 1 — Curation Agent
**Job:** assemble a box that *feels handpicked* — satisfying budget + tags + variety +
no-repeat, with a clear reason per item.

- **Trigger:** "assemble my box" (from a saved preference) or merchant API call.
- **Tools:** `inv.search`, `taste.embed`, `taste.score`, `history.past_items`, `inv.weights`,
  `solver.assemble`.
- **Output:** `{ items[]{item_id, reason}, theme, value_total, tier, spoiler_level, seed,
  confidence }`.
- **Guardrails:** hard constraints enforced by the solver (≤ budget, in stock, **respects
  exclude/allergy tags strictly**, no-repeat); guarantees the disclosed **value floor**; honors
  the chosen spoiler level (assembles fully but the reveal config controls what's shown). No
  fabricated items.
- **UI surface:** the assembled box (hidden per spoiler level); per-item reasons feed the reveal.

## Agent 2 — Taste-Learning Agent
**Job:** keep each user's taste embedding fresh from ratings/keeps/returns — improving fit while
**protecting surprise**.

- **Trigger:** after ratings, periodically.
- **Tools:** `taste.embed`, `taste.score`, `history.past_items`.
- **Output:** `{ updated_embedding, liked_tags[], disliked_tags[], exploration_rate }`.
- **Guardrails:** maintains an **exploration rate** so boxes don't collapse into the same few
  items (surprise is the product); never hard-excludes a category from a single bad rating;
  disliked/allergy tags from preferences always win.
- **UI surface:** the "taste constellation" page; invisibly improves next curation.

## Agent 3 — Inventory-Balancing Agent
**Job:** compute weights so curation **clears overstock and rations scarce items** without
hurting match quality.

- **Trigger:** scheduled; before large assembly batches.
- **Tools:** `inv.search`, `inv.weights`.
- **Output:** `{ overstock_boost[], scarcity_penalty[], rationale }` consumed by the Curation
  agent's scoring.
- **Guardrails:** balancing is a **gentle nudge**, capped so a box is never stuffed with
  unwanted overstock just to clear it; scarce-item rationing is fair across users; match quality
  has priority.
- **UI surface:** none buyer-facing; a merchant inventory view shows current weights.

## Agent 4 — Reveal-Narrative Agent
**Job:** write the **personalized unboxing story** and per-item "why we picked this," grounded
in the actual curation reasons.

- **Trigger:** on reveal config / `box.opened`.
- **Tools:** `content.write` (fed the Curation agent's per-item reasons + the user's tags).
- **Output:** `{ intro_line, per_item_blurbs[], share_card_copy }` — short, warm, honest, on the
  boutique tone.
- **Guardrails:** narrative is **grounded in real reasons** (no invented backstory about the
  item); respects spoiler level (no spoilers in pre-delivery copy); brand-safe tone; concise.
- **UI surface:** the reveal page item cards + shareable pull card.

---

## Cross-cutting guardrails
- **Hard constraints are deterministic:** budget, stock, exclude/allergy tags, no-repeat, and the
  value floor are enforced by the solver — Gemma can't override them.
- **Surprise is protected:** an exploration rate keeps boxes from converging; learning improves
  fit without making boxes predictable.
- **Ethical "surprise," not gambling:** rarity **odds and the value floor are disclosed**; the
  golden-item chase never lets perceived value drop below what was paid.
- **Grounded copy:** narratives use only real curation reasons and item facts; no fabrication.
- **No autonomous spending/shipping:** agents assemble; the buyer confirms at checkout.
- **Reproducible & auditable:** seeded assembly + `AgentRun` logs make any box explainable.
