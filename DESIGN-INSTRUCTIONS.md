# Untold — Front-End Design Brief (for Claude, in Claude Design)

**You are designing the complete front end of Untold from scratch.** Build **every page** here,
for **desktop and mobile**, in **light and dark themes**. The product is a curated mystery box,
so the design must feel **theatrical, luxe, and suspenseful** — a velvet-curtain reveal, not a
generic store grid. Use **React + Vite + Tailwind + Three.js + GSAP/ScrollTrigger + Lenis**.

Read fully, then build in the **step order** at the end.

---

## 0. North Star — "the moment before you open it"

Untold sells **anticipation**. The whole interface lives in the breath *before the reveal*:
dim light, a single spotlight, a wrapped box, a ribbon you can almost feel. The signature
idea: **as the user scrolls, the box opens** — the ribbon unties, the lid lifts, light spills
out from inside, and the contents rise into view, all **scrubbed to scroll** so the user
controls the suspense. Curation is invisible craft; the **reveal is the showpiece**.

Tone: **boutique, cinematic, a little mysterious** — like a high-end perfume house or a
magician's atelier. Premium tactility (velvet, foil, embossed paper, wax seal), generous dark
negative space, one dramatic spotlight per scene.

Avoid AI/template tells: no bright SaaS gradients, no card grids fading up, no confetti-spam,
no childish "loot box" casino vibe. This is **tasteful surprise**, not a slot machine.

---

## 1. Art direction

**Mood words:** suspense · velvet · spotlight · foil · ritual · reveal · boutique.

**Dual theme — the curtain is the switch.** Dark is the **default** (the theater, lights down).
Light is the **boutique by day** (ivory paper, ink, foil). The theme toggle is a small
**stage-light / curtain** control.

### Color tokens (CSS variables, both themes)

**Dark ("Theater")**
- `--bg`: `#0B0A0F` (near-black with a violet undertone) · `--bg-elev`: `#15121C`
- `--ink`: `#F2EAF2` · `--ink-dim`: `#A99FB4`
- `--violet`: `#7C4DFF` (primary — the "reveal" glow) · `--oxblood`: `#7A1F35` (deep luxe red)
- `--foil-gold`: `#D9B36A` · `--foil-rose`: `#E0A4A0` (metallic accents, foil-stamped)
- `--spot`: `#FFF4D6` (warm spotlight) · `--ok`: `#6FE0A8`
- A recurring **`--reveal-glow`** radial (violet→warm white) is the light that "spills" on open.

**Light ("Boutique")**
- `--bg`: `#F4EFE7` (bone / ivory paper) · `--bg-elev`: `#FFFFFF`
- `--ink`: `#16121A` · `--ink-dim`: `#5C5462`
- `--violet`: `#5B33D6` · `--oxblood`: `#8E2440`
- `--foil-gold`: `#B9892F` · `--foil-rose`: `#C98A86` · `--spot`: `#F6E6BE`

> Metallics are rendered as **foil**, not flat gold: use subtle gradient + a slow specular
> sweep on hover (a moving highlight), so seals and the wordmark feel stamped, not painted.

### Typography
- **Display / headlines:** a **high-contrast Didone** for drama — **Playfair Display** or
  **Fraunces** at its highest contrast (or a true Didone like **GT Sectra-style** via
  available alternatives). Big, elegant, mixed-case with italic for the teasing word
  ("what's *inside?*").
- **UI / body:** a clean, slightly refined sans — **Hanken Grotesk** or **Inter** — kept quiet
  so the display and the reveal carry the drama.
- **Numerals / price / odds:** tabular (Inter tabular). Rarity odds shown in small caps,
  honest and legible.
- Use **small caps + wide tracking** for labels ("THE REVEAL", "TIER: LEGENDARY") to get the
  boutique/playbill feel.

### Texture & lighting
- **Velvet** background texture (very subtle noise + soft directional sheen) in dark mode;
  **embossed paper** grain in light mode.
- **Volumetric spotlight** and god-rays around the box (Three.js — restrained bloom + a cone
  light). Deep, soft contact shadows.
- **Wax-seal / foil** motifs for CTAs and confirmations; a ribbon motif as a recurring divider.

---

## 2. Signature scroll & 3D reveal system (the showpiece)

Wire **Lenis → GSAP ScrollTrigger**. The user explicitly does **not** want generic reveal-on-
scroll cards. Build these specific, scrubbed, theatrical behaviors:

1. **The scroll-to-open box (hero + reveal page).** A Three.js **gift box** under a spotlight.
   Scroll progress drives a timeline: ribbon **unties** → lid **lifts and tilts** → a
   **`--reveal-glow` spills** from inside → items **rise** out and arrange on cards. Fully
   scrubbable both ways (scroll up to re-close). This is the emotional core — make it feel
   tactile and earned. (Reduced-motion: a tasteful static "opened" state + a tap-to-open.)

2. **Spoiler-aware reveal.** The same scene respects the buyer's **spoiler level**: *Sealed*
   (box never opens on-site; just glows, "wait for delivery"), *Teased* (lid lifts to show
   **silhouettes**), *Glimpse* (one item fully revealed, rest silhouetted). The motion adapts.

3. **Curtain / spotlight transitions between routes.** Page transitions are a **spotlight
   sweep** or a **velvet curtain** wipe — short, elegant, on-brand — instead of generic fades.

4. **Parallax in low light.** Dust motes drift in the spotlight beam (parallax depth); the box
   and its shadow move at different depths; a faint godray shifts as you scroll. Calm,
   cinematic, never busy.

5. **Foil specular on scroll/hover.** Seals, the wordmark, and tier badges catch a **moving
   highlight** as they enter view or on hover — the "metallic" tell that says premium.

6. **Tasteful number/odds motion.** Value totals and rarity odds roll up with tabular numerals;
   a "golden item" pull gets a single, restrained flare (not casino confetti).

> All marketing/reveal motion is **scroll-scrubbed & deterministic**; in-app interactions are
> input-driven & instant. Honor `prefers-reduced-motion` (static opened/closed states). One
> shared WebGL context; pause offscreen.

---

## 3. Pages to design (every one; desktop + mobile; light + dark)

### 3.1 Landing / Marketing home
- **Hero:** the spotlit box under a Didone headline — *"You set the vibe. We keep the secret."*
  with a single foil CTA "Build your box." Scroll begins to open it.
- **Sections:** (a) the scroll-to-open reveal demo; (b) "how curation works" told as craft
  (taste tags → a coherent box) without spoiling the magic; (c) rarity tiers showcase
  (Standard/Rare/Legendary) as three spotlit pedestals; (d) social proof as **tasteful pull
  cards** (what others unboxed), not a logo wall; (e) the trade/regift idea; (f) footer as a
  dim stage with a wax-seal sign-off.
- **Mobile:** box centered, scroll-to-open shortened; pedestals become a snap carousel.

### 3.2 Box builder (preference capture — make it feel like a ritual, not a form)
- A guided, **one-question-at-a-time** flow under the spotlight: **tag picker** (categories +
  vibes as elegant chips/tiles), **exclude/no-go** tags (allergies), **budget slider** (the box
  visibly "fills"/grows as budget rises), **cadence**, **rarity tier**, and **spoiler level**
  (Sealed / Teased / Glimpse — explained with a tiny live preview of how the reveal will
  behave). Progress feels like setting a stage, not filling a checkout.
- **Mobile:** full-screen steps, big tiles, thumb-friendly slider, sticky "assemble" CTA.

### 3.3 Assembling / interstitial
- A short, suspenseful "we're curating…" moment — the box wraps itself, ribbon ties — masking
  the curation compute. Tasteful, ~a few seconds, skippable to the reveal/checkout.

### 3.4 Reveal experience (the page everything builds to)
- The full scroll-to-open scene (2.1) honoring spoiler level, then **item cards** rising with
  name, a one-line **"why we picked this"** (from the Reveal-Narrative agent), value, and rarity.
  A **"golden item"** gets a single restrained flare. CTA to rate, trade, or reorder.

### 3.5 Item rating / taste
- After delivery: rate items (keep/return), shown as a quiet, classy flow that visibly "teaches
  the box." A **taste page** shows the user's evolving vibe (tags they lean toward) as an
  elegant constellation/graph — not a dashboard.

### 3.6 Collection / rarity & streak
- A **cabinet of curiosities**: items unboxed over time on lit shelves, rarity badges (foil),
  golden-item pulls, streaks. Shareable pull cards (render a foil-on-velvet image).

### 3.7 Trade & regift marketplace
- Browse others' duplicates/listings as spotlit cards; offer a trade (match on want-tags);
  regift flow (re-route, no reshipping). Keep it boutique, not flea-market.

### 3.8 Subscription / account
- Manage cadence, budget, tier, spoiler default, address, billing (mock in dev). Calm, clear.

### 3.9 Module / embed showcase
- Document the drop-in **builder** + **reveal** widgets: a live theme-token playground (drag →
  reskin the widget live), copyable snippet, API/webhook docs styled to match. Note how it
  composes with **DuskDrop's** Surprise Surplus Bags.

### 3.10 System / states
- Empty (no boxes yet → a wrapped box waiting under a dim spot), loading (a slow ribbon shimmer),
  errors, auth (magic-link with a wax-seal button), 404 (an empty pedestal, spotlight searching).

---

## 4. Components library
- `RevealScene` (shared Three.js box + spotlight + ribbon/lid/glow timeline, spoiler-aware).
- `BoxBuilderStep` (ritual one-question flow), `TagTile`, `BudgetSlider` (box-fills), `TierCard`,
  `SpoilerPicker` (with live mini-preview).
- `ItemCard` (reveal), `WhyWePicked` (narrative line), `RarityBadge` (foil), `GoldenFlare`.
- `FoilText` / `WaxSeal` (specular sweep), `CurtainTransition`, `SpotlightBg`, `DustMotes`.
- `TasteConstellation`, `CollectionShelf`, `PullCardShare`.
- `ThemeToggle` (stage-light/curtain), `NumberRoll`.

Tailwind extension `untold`: tokens via CSS vars (both themes), velvet/paper textures, foil
gradient utilities, the `--reveal-glow`, small-caps label helpers, cinematic eases
(`power3`/custom "reveal" ease).

---

## 5. Responsive & mobile
- The **reveal must be gorgeous on a phone** — it's the most-shared moment. Center the box,
  shorten the scroll timeline, keep the spotlight + glow, big tap targets in the builder.
- Heavy 3D degrades to a lighter box / pre-rendered reveal video on low-power devices (perf
  probe + `prefers-reduced-motion`), without losing the suspense beat.

## 6. Accessibility & performance
- AA contrast in both themes (violet/foil on near-black; ink on ivory). Visible focus (foil-gold).
- Reveal honors `prefers-reduced-motion` (static states + tap-to-open); never rely on color/glow
  alone — pair rarity with labels. **Odds and value floor disclosed** plainly (ethical surprise,
  not gambling).
- Lazy-load 3D; preload only the hero box; cap DPR; one WebGL context; pause offscreen; LCP <
  2.5s mid-mobile.

## 7. Build order
1. **Tokens & theming** (both themes, velvet/paper textures, foil utilities, `--reveal-glow`,
   small-caps labels, Didone + sans type) + `ThemeToggle`.
2. **Motion + 3D foundation:** Lenis ↔ ScrollTrigger; `RevealScene` (box + spotlight + ribbon/
   lid/glow timeline) with spoiler modes; `CurtainTransition`.
3. **Landing** with all scroll scenes (scroll-to-open, curation-as-craft, tier pedestals, pull
   cards, dim-stage footer).
4. **Box builder** ritual flow (tags, budget-fills slider, tier, spoiler picker w/ live preview).
5. **Assembling interstitial** → **Reveal experience** (spoiler-aware) with item cards +
   "why we picked this" + golden flare.
6. **Rating / taste constellation**, **Collection / rarity shelf**.
7. **Trade & regift**, **Subscription / account**.
8. **Module/embed showcase** with live theme-token playground.
9. **States** (empty/loading/error/auth/404) + accessibility + reduced-motion + ethics
   (odds/value-floor disclosure) + perf pass.

Deliver each page in **both themes** and **both breakpoints**, with the reveal and scroll
behaviors wired and annotated for engineers.
