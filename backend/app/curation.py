"""Untold — deterministic curation engine.

This is the "hard, interesting part" from the README: a budget-constrained,
taste-scored, variety-aware box assembler. It is intentionally dependency-free
(pure Python + a seeded RNG) so it is fast, reproducible, and explainable.

The solver enforces the *hard* constraints itself (never over budget, never out
of stock, strictly respects exclude/allergy tags, no-repeat) and *scores* the
soft objectives (taste match, theme coherence, perceived value, inventory
balance). A run is fully determined by its `seed`, so any assembled box can be
reproduced and audited.
"""
from __future__ import annotations

import hashlib
import random
from dataclasses import dataclass, field
from typing import Iterable

RARITY_RANK = {"std": 0, "rare": 1, "legendary": 2}

# Allergy / attribute tags exist only so exclude constraints can bite; they are
# never taste signals and must never surface in a theme line.
ATTRIBUTE_TAGS = {"Nuts", "Dairy", "Scented", "Caffeine", "Alcohol", "Latex"}

# Per-tier policy: guaranteed value floor (× price), disclosed golden odds, the
# rarities a tier may draw, and the item-count window.
TIER_CONFIG: dict[str, dict] = {
    "std":       {"value_floor": 1.10, "golden_odds": 1 / 80, "rarities": {"std", "rare"},               "count": (3, 5)},
    "rare":      {"value_floor": 1.25, "golden_odds": 1 / 30, "rarities": {"std", "rare", "legendary"},  "count": (3, 6)},
    "legendary": {"value_floor": 1.40, "golden_odds": 1 / 9,  "rarities": {"std", "rare", "legendary"},  "count": (4, 6)},
}

MAX_PER_CATEGORY = 2  # variety guard: don't send 3+ near-identical items


@dataclass
class CandidateItem:
    id: str
    name: str
    category: str
    tags: list[str]
    cost: float
    retail_value: float
    stock: int
    rarity: str
    reason: str = ""
    image: str | None = None


@dataclass
class AssembledItem:
    id: str
    name: str
    category: str
    tags: list[str]
    cost: float
    retailValue: float
    rarity: str
    reason: str
    isGolden: bool = False
    image: str | None = None


@dataclass
class AssembledBox:
    items: list[AssembledItem]
    theme: str
    value_total: float
    value_floor: float
    cost_total: float
    tier: str
    spoiler: str
    seed: int
    confidence: float
    notes: list[str] = field(default_factory=list)


def seed_from(*parts: object) -> int:
    """Stable integer seed from arbitrary inputs (so a preference → a box)."""
    digest = hashlib.sha256("|".join(map(str, parts)).encode()).hexdigest()
    return int(digest[:12], 16)


def _score(item: CandidateItem, include: set[str], taste: dict[str, float],
           weights: dict[str, float], picked_tags: dict[str, int]) -> float:
    tags = set(item.tags)
    tag_match = len(tags & include)
    taste_pull = sum(taste.get(t, 0.0) for t in tags)
    value_ratio = item.retail_value / max(item.cost, 1.0)
    rarity_bonus = RARITY_RANK.get(item.rarity, 0) * 0.35
    # theme coherence: reward tags already represented in the box so it reads
    # as one idea, not a random pile.
    coherence = sum(picked_tags.get(t, 0) for t in tags) * 0.25
    # inventory balance: gentle nudge from the inventory agent's weights.
    balance = sum(weights.get(t, 0.0) for t in tags)
    return (tag_match * 2.0 + taste_pull * 1.2 + value_ratio * 0.6
            + rarity_bonus + coherence + balance)


def _reason_for(item: CandidateItem, include: set[str], taste: dict[str, float]) -> str:
    if item.reason:
        return item.reason
    hit = next((t for t in item.tags if t in include), None)
    if hit:
        return f"You leaned {hit.lower()} — {item.name} sits right on that thread."
    lean = max(item.tags, key=lambda t: taste.get(t, 0.0), default=None)
    if lean and taste.get(lean, 0.0) > 0.3:
        return f"Your taste tilts {lean.lower()}; this rides quietly alongside it."
    return f"A counterpoint for variety — a little {item.category.lower()} to round the box."


def assemble(
    catalog: Iterable[CandidateItem],
    *,
    include_tags: list[str] | None = None,
    exclude_tags: list[str] | None = None,
    budget: float = 75.0,
    tier: str = "rare",
    taste: dict[str, float] | None = None,
    past_ids: Iterable[str] | None = None,
    inventory_weights: dict[str, float] | None = None,
    seed: int | None = None,
) -> AssembledBox:
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["rare"])
    include = set(include_tags or [])
    exclude = set(exclude_tags or [])
    taste = taste or {}
    weights = inventory_weights or {}
    past = set(past_ids or [])
    if seed is None:
        seed = seed_from(sorted(include), sorted(exclude), budget, tier)
    rng = random.Random(seed)

    # Hard constraints first: in stock, no excluded/allergy tag, no-repeat,
    # rarity permitted by tier.
    candidates = [
        c for c in catalog
        if c.stock > 0
        and not (set(c.tags) & exclude)
        and c.id not in past
        and c.rarity in cfg["rarities"]
    ]

    min_n, max_n = cfg["count"]
    picks: list[CandidateItem] = []
    picked_tags: dict[str, int] = {}
    spent = 0.0
    cat_count: dict[str, int] = {}
    notes: list[str] = []

    def take(item: CandidateItem) -> None:
        nonlocal spent
        picks.append(item)
        spent += item.cost
        cat_count[item.category] = cat_count.get(item.category, 0) + 1
        for t in item.tags:
            picked_tags[t] = picked_tags.get(t, 0) + 1

    # Greedy pass: re-score each round so theme coherence compounds.
    pool = list(candidates)
    while len(picks) < max_n:
        affordable = [c for c in pool if spent + c.cost <= budget
                      and cat_count.get(c.category, 0) < MAX_PER_CATEGORY]
        if not affordable:
            break
        affordable.sort(key=lambda c: (_score(c, include, taste, weights, picked_tags), c.id),
                        reverse=True)
        chosen = affordable[0]
        take(chosen)
        pool.remove(chosen)

    # Relax the variety cap if we couldn't reach the minimum count.
    if len(picks) < min_n:
        for c in sorted(pool, key=lambda c: (_score(c, include, taste, weights, picked_tags), c.id),
                        reverse=True):
            if len(picks) >= min_n:
                break
            if spent + c.cost <= budget:
                take(c)
                pool.remove(c)
        if len(picks) < min_n:
            notes.append("Budget was tight — fewer items, each one carries more.")

    # Value floor: try to swap a cheap pick for a higher-value spare to honor the
    # disclosed floor without going over budget.
    floor_target = budget * cfg["value_floor"]
    value_total = sum(p.retail_value for p in picks)
    if value_total < floor_target and pool:
        for cheap in sorted(picks, key=lambda p: p.retail_value):
            spare = max(
                (s for s in pool
                 if spent - cheap.cost + s.cost <= budget
                 and s.retail_value > cheap.retail_value),
                key=lambda s: s.retail_value, default=None,
            )
            if spare:
                spent += spare.cost - cheap.cost
                picks[picks.index(cheap)] = spare
                pool.remove(spare)
                value_total = sum(p.retail_value for p in picks)
                if value_total >= floor_target:
                    break

    # Golden pull: a legendary in the box can become golden at the disclosed odds.
    golden_id: str | None = None
    legendaries = [p for p in picks if p.rarity == "legendary"]
    if legendaries and rng.random() < cfg["golden_odds"]:
        golden_id = rng.choice(legendaries).id

    items = [
        AssembledItem(
            id=p.id, name=p.name, category=p.category, tags=list(p.tags),
            cost=p.cost, retailValue=p.retail_value, rarity=p.rarity,
            reason=_reason_for(p, include, taste), isGolden=p.id == golden_id,
            image=p.image,
        )
        for p in picks
    ]

    return AssembledBox(
        items=items,
        theme=_theme_for(picked_tags, include),
        value_total=round(value_total, 2),
        value_floor=round(floor_target, 2),
        cost_total=round(spent, 2),
        tier=tier,
        spoiler="teased",
        seed=seed,
        confidence=_confidence(picks, include, value_total, floor_target, min_n),
        notes=notes,
    )


def _theme_for(picked_tags: dict[str, int], include: set[str]) -> str:
    themeable = {t: n for t, n in picked_tags.items() if t not in ATTRIBUTE_TAGS}
    if not themeable:
        return "A quiet, well-made secret"
    ranked = sorted(themeable, key=lambda t: (themeable[t], t in include, t), reverse=True)
    top = ranked[:2]
    if len(top) == 2:
        return f"{top[0]} meets {top[1].lower()}"
    return f"An ode to {top[0].lower()}"


def _confidence(picks, include: set[str], value_total: float,
                floor_target: float, min_n: int) -> float:
    if not picks:
        return 0.0
    covered = len({t for p in picks for t in p.tags} & include)
    tag_cov = covered / max(len(include), 1) if include else 0.7
    floor_ok = 1.0 if value_total >= floor_target else value_total / max(floor_target, 1)
    count_ok = min(len(picks) / min_n, 1.0)
    return round(0.45 * tag_cov + 0.35 * floor_ok + 0.20 * count_ok, 2)
