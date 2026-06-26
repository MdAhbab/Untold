import json

from .database import engine, Base, SessionLocal
from . import models

# ---------------------------------------------------------------------------
# Static reference data
# ---------------------------------------------------------------------------
TAG_GROUPS = [
    {"group": "Read", "tags": ["Horror fiction", "Poetry", "Sci-fi", "Art books", "Indie zines"]},
    {"group": "Taste", "tags": ["Spicy snacks", "Single-origin coffee", "Botanical tea", "Dark chocolate", "Fermented & funky"]},
    {"group": "Make", "tags": ["Desk gadgets", "Stationery", "Ceramics", "Analog photography", "Tiny tools"]},
    {"group": "Wear", "tags": ["Fragrance", "Hand-poured candles", "Silver trinkets", "Enamel pins"]},
    {"group": "Vibe", "tags": ["Cozy & dim", "Maximalist", "Minimal & quiet", "Vintage", "Late-night"]},
]

# Live inventory the curation engine assembles from. `nogo` tags (Nuts, Dairy,
# Scented, Caffeine, Alcohol, Latex) are attached where real so exclude/allergy
# constraints are demonstrable.
CATALOG = [
    # Make
    {"id": "i1", "name": "Obsidian Ink — Nightshade Pen", "category": "Make", "tags": ["Desk gadgets", "Stationery", "Late-night"], "cost": 18, "retail_value": 32, "rarity": "rare", "reason": "You lean late-night and analog — a brass pen weighted for long, dim writing sessions."},
    {"id": "i7", "name": "Field Notes — Dusk Edition", "category": "Make", "tags": ["Stationery", "Minimal & quiet"], "cost": 8, "retail_value": 14, "rarity": "std", "reason": "Three pocket notebooks in fog grey — quiet paper for loud ideas."},
    {"id": "i8", "name": "Kaweco Brass Sharpener", "category": "Make", "tags": ["Tiny tools", "Desk gadgets", "Vintage"], "cost": 12, "retail_value": 22, "rarity": "rare", "reason": "A pocket tool that ages to a warm patina — small, perfect, forever."},
    {"id": "i9", "name": "Stoneware Pinch Cup", "category": "Make", "tags": ["Ceramics", "Cozy & dim", "Minimal & quiet"], "cost": 16, "retail_value": 28, "rarity": "std", "reason": "Hand-pinched and unglazed at the rim — built for slow morning hands."},
    {"id": "i10", "name": "Cyanotype Print Kit", "category": "Make", "tags": ["Analog photography", "Art books", "Maximalist"], "cost": 19, "retail_value": 34, "rarity": "rare", "reason": "Sun-print your own blueprints — chemistry, paper, and a little patience."},

    # Taste
    {"id": "i2", "name": "Ember & Ash — Smoked Chili Crisp", "category": "Taste", "tags": ["Spicy snacks", "Fermented & funky", "Nuts"], "cost": 9, "retail_value": 16, "rarity": "std", "reason": "Your spice tag plus a funky-ferment streak — small batch, dangerously good on everything."},
    {"id": "i11", "name": "Slowpour — Single-Origin Sampler", "category": "Taste", "tags": ["Single-origin coffee", "Late-night", "Caffeine"], "cost": 14, "retail_value": 24, "rarity": "rare", "reason": "Three micro-lots, roasted last week — the cellar of a tiny Lisbon roaster."},
    {"id": "i12", "name": "Botanica — Night Bloom Tea", "category": "Taste", "tags": ["Botanical tea", "Cozy & dim", "Minimal & quiet"], "cost": 11, "retail_value": 19, "rarity": "std", "reason": "Chamomile, lavender, a whisper of fig — a cup for the lights-down hour."},
    {"id": "i13", "name": "Cacao Negro — 88% Tasting Bars", "category": "Taste", "tags": ["Dark chocolate", "Vintage", "Dairy"], "cost": 13, "retail_value": 23, "rarity": "rare", "reason": "Four origins, near-black — bitter, bright, and built for slow squares."},
    {"id": "i14", "name": "Funke — Wild Ferment Trio", "category": "Taste", "tags": ["Fermented & funky", "Spicy snacks"], "cost": 15, "retail_value": 27, "rarity": "rare", "reason": "Kimchi, kraut, and a smoked hot honey — living jars for a funky palate."},

    # Read
    {"id": "i3", "name": "The Quiet Room — Letterpress Poems", "category": "Read", "tags": ["Poetry", "Minimal & quiet"], "cost": 14, "retail_value": 24, "rarity": "std", "reason": "A hush to balance the heat. Twelve short poems, pressed by hand on cotton paper."},
    {"id": "i5", "name": "Foxglove Press — Risograph Zine", "category": "Read", "tags": ["Indie zines", "Art books", "Maximalist"], "cost": 11, "retail_value": 19, "rarity": "rare", "reason": "Because you keep the maximalist and zine tags lit — three-color riso, ink still smells fresh."},
    {"id": "i15", "name": "Vellum & Void — Horror Novella", "category": "Read", "tags": ["Horror fiction", "Late-night"], "cost": 12, "retail_value": 20, "rarity": "std", "reason": "A slim, mean little book for one sleepless sitting. Sleep optional."},
    {"id": "i16", "name": "Orbital — Sci-fi Triple", "category": "Read", "tags": ["Sci-fi", "Minimal & quiet"], "cost": 16, "retail_value": 28, "rarity": "rare", "reason": "Three novellas of quiet space — no lasers, all longing."},
    {"id": "i17", "name": "Pressed Light — Art Book", "category": "Read", "tags": ["Art books", "Analog photography", "Vintage"], "cost": 24, "retail_value": 44, "rarity": "legendary", "reason": "A clothbound monograph of darkroom work — the kind you keep on the table, not the shelf."},

    # Wear
    {"id": "i4", "name": "Halcyon No. 7 — Vetiver & Smoke", "category": "Wear", "tags": ["Fragrance", "Cozy & dim", "Scented", "Alcohol"], "cost": 28, "retail_value": 58, "rarity": "legendary", "reason": "Cozy-and-dim is your home base — a vetiver smolder from a maker who blends only 200 a year."},
    {"id": "i18", "name": "Tonka & Leather Candle", "category": "Wear", "tags": ["Hand-poured candles", "Cozy & dim", "Scented"], "cost": 17, "retail_value": 30, "rarity": "rare", "reason": "Hand-poured tonka over a soft leather base — 50 hours of low amber light."},
    {"id": "i19", "name": "Silver Moth Pin", "category": "Wear", "tags": ["Silver trinkets", "Enamel pins", "Vintage"], "cost": 13, "retail_value": 24, "rarity": "rare", "reason": "A cast-silver moth for a lapel or a notebook — patina encouraged."},
    {"id": "i20", "name": "Nocturne — Enamel Pin Set", "category": "Wear", "tags": ["Enamel pins", "Maximalist", "Late-night"], "cost": 10, "retail_value": 18, "rarity": "std", "reason": "Four hard-enamel night creatures — small, loud, collectible."},
    {"id": "i21", "name": "Moonstone Signet", "category": "Wear", "tags": ["Silver trinkets", "Minimal & quiet"], "cost": 26, "retail_value": 52, "rarity": "legendary", "reason": "A single moonstone in brushed silver — quiet, heavy, the one you never take off."},

    # Vibe-led crossovers
    {"id": "i22", "name": "Lamplight — Velvet Eye Pillow", "category": "Wear", "tags": ["Cozy & dim", "Minimal & quiet", "Latex"], "cost": 15, "retail_value": 26, "rarity": "std", "reason": "Lavender-free, weighted velvet for the lights-down ritual."},
    {"id": "i23", "name": "Maximalist — Sticker Hoard", "category": "Make", "tags": ["Maximalist", "Stationery", "Indie zines"], "cost": 7, "retail_value": 13, "rarity": "std", "reason": "Forty die-cut stickers from a dozen indie artists — cover everything."},
    {"id": "i24", "name": "Vintage Brass Compass", "category": "Make", "tags": ["Vintage", "Tiny tools", "Desk gadgets"], "cost": 22, "retail_value": 40, "rarity": "legendary", "reason": "A working pocket compass with a sapphire bearing — old-world weight in the hand."},
]

TASTE_NODES = [
    {"tag": "Cozy & dim", "weight": 0.92},
    {"tag": "Spicy snacks", "weight": 0.81},
    {"tag": "Poetry", "weight": 0.74},
    {"tag": "Fragrance", "weight": 0.69},
    {"tag": "Late-night", "weight": 0.66},
    {"tag": "Indie zines", "weight": 0.55},
    {"tag": "Single-origin coffee", "weight": 0.48},
    {"tag": "Ceramics", "weight": 0.40},
]

COLLECTION = [
    {"id": "c1", "name": "Halcyon No. 7", "date": "Jun 2026", "rarity": "legendary", "golden": True},
    {"id": "c2", "name": "Nightshade Pen", "date": "Jun 2026", "rarity": "rare"},
    {"id": "c3", "name": "Smoked Chili Crisp", "date": "May 2026", "rarity": "std"},
    {"id": "c4", "name": "Tonka Candle", "date": "May 2026", "rarity": "rare"},
    {"id": "c5", "name": "Letterpress Poems", "date": "Apr 2026", "rarity": "std"},
    {"id": "c6", "name": "Risograph Zine", "date": "Apr 2026", "rarity": "rare"},
    {"id": "c7", "name": "Cyanotype Print", "date": "Mar 2026", "rarity": "std"},
    {"id": "c8", "name": "Brass Compass", "date": "Mar 2026", "rarity": "legendary", "golden": True},
]

TRADES = [
    {"id": "t1", "item": "Tonka & Leather Candle", "from": "ember_ash", "rarity": "rare", "wants": ["Single-origin coffee", "Stationery"]},
    {"id": "t2", "item": "Sci-fi Triple Novella", "from": "void_reader", "rarity": "std", "wants": ["Poetry", "Indie zines"]},
    {"id": "t3", "item": "Silver Moth Pin", "from": "nocturne", "rarity": "legendary", "wants": ["Fragrance"]},
    {"id": "t4", "item": "Single-origin Sampler", "from": "slowpour", "rarity": "rare", "wants": ["Botanical tea", "Dark chocolate"]},
]


def seed(db) -> None:
    """Replace all reference data with the canonical seed set (idempotent)."""
    db.query(models.Item).delete()
    db.query(models.TagGroup).delete()
    db.query(models.TradeListing).delete()
    db.query(models.CollectionItem).delete()
    db.query(models.TasteNode).delete()

    for tg in TAG_GROUPS:
        db.add(models.TagGroup(group_name=tg["group"], tags_json=json.dumps(tg["tags"])))

    for it in CATALOG:
        # Scarcity by rarity: legendaries are rationed, standards overstocked.
        # This gives the inventory-balancing agent real signal to work with.
        default_stock = {"legendary": 12, "rare": 60, "std": 150}.get(it["rarity"], 100)
        db.add(models.Item(
            id=it["id"], name=it["name"], category=it["category"],
            tags_json=json.dumps(it["tags"]), cost=it["cost"],
            retail_value=it["retail_value"], rarity=it["rarity"],
            reason=it["reason"], is_golden=False, stock=it.get("stock", default_stock),
        ))

    for tn in TASTE_NODES:
        db.add(models.TasteNode(tag=tn["tag"], weight=tn["weight"]))

    for c in COLLECTION:
        db.add(models.CollectionItem(
            id=c["id"], name=c["name"], date=c["date"],
            rarity=c["rarity"], golden=c.get("golden", False),
        ))

    for t in TRADES:
        db.add(models.TradeListing(
            id=t["id"], box_item_id=t["id"], item_name=t["item"],
            from_user=t["from"], rarity=t["rarity"],
            want_tags_json=json.dumps(t["wants"]), status="open",
        ))

    db.commit()


def init_db(force: bool = True) -> None:
    """Create tables and seed. With force=False, seeds only when empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if force or db.query(models.TagGroup).first() is None:
            seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_db(force=True)
    print("Database seeded successfully.")
