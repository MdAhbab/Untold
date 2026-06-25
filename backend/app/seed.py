import json
from .database import engine, Base, SessionLocal
from . import models

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear old data
    db.query(models.Item).delete()
    db.query(models.TagGroup).delete()
    db.query(models.TradeListing).delete()
    db.query(models.CollectionItem).delete()
    db.query(models.TasteNode).delete()

    # Data from data.ts
    TAG_GROUPS = [
        {"group": "Read", "tags": ["Horror fiction", "Poetry", "Sci-fi", "Art books", "Indie zines"]},
        {"group": "Taste", "tags": ["Spicy snacks", "Single-origin coffee", "Botanical tea", "Dark chocolate", "Fermented & funky"]},
        {"group": "Make", "tags": ["Desk gadgets", "Stationery", "Ceramics", "Analog photography", "Tiny tools"]},
        {"group": "Wear", "tags": ["Fragrance", "Hand-poured candles", "Silver trinkets", "Enamel pins"]},
        {"group": "Vibe", "tags": ["Cozy & dim", "Maximalist", "Minimal & quiet", "Vintage", "Late-night"]},
    ]

    for tg in TAG_GROUPS:
        db.add(models.TagGroup(group_name=tg["group"], tags_json=json.dumps(tg["tags"])))

    SAMPLE_BOX = [
        {"id": "i1", "name": "Obsidian Ink — Nightshade Pen", "category": "Make", "tags": ["Desk gadgets", "Stationery", "Late-night"], "cost": 18, "retail_value": 32, "rarity": "rare", "reason": "You lean late-night and analog — a brass pen weighted for long, dim writing sessions."},
        {"id": "i2", "name": "Ember & Ash — Smoked Chili Crisp", "category": "Taste", "tags": ["Spicy snacks", "Fermented & funky"], "cost": 9, "retail_value": 16, "rarity": "std", "reason": "Your spice tag plus a funky-ferment streak — small batch, dangerously good on everything."},
        {"id": "i3", "name": "The Quiet Room — Letterpress Poems", "category": "Read", "tags": ["Poetry", "Minimal & quiet"], "cost": 14, "retail_value": 24, "rarity": "std", "reason": "A hush to balance the heat. Twelve short poems, pressed by hand on cotton paper."},
        {"id": "i4", "name": "Halcyon No. 7 — Vetiver & Smoke", "category": "Wear", "tags": ["Fragrance", "Cozy & dim"], "cost": 28, "retail_value": 58, "rarity": "legendary", "reason": "Cozy-and-dim is your home base — a vetiver smolder from a maker who blends only 200 a year.", "is_golden": True},
        {"id": "i5", "name": "Foxglove Press — Risograph Zine", "category": "Read", "tags": ["Indie zines", "Art books", "Maximalist"], "cost": 11, "retail_value": 19, "rarity": "rare", "reason": "Because you keep the maximalist and zine tags lit — three-color riso, ink still smells fresh."},
    ]

    for i in SAMPLE_BOX:
        db.add(models.Item(
            id=i["id"],
            name=i["name"],
            category=i["category"],
            tags_json=json.dumps(i["tags"]),
            cost=i["cost"],
            retail_value=i["retail_value"],
            rarity=i["rarity"],
            reason=i["reason"],
            is_golden=i.get("is_golden", False),
            stock=100
        ))

    TASTE_NODES = [
        {"tag": "Cozy & dim", "weight": 0.92},
        {"tag": "Spicy snacks", "weight": 0.81},
        {"tag": "Poetry", "weight": 0.74},
        {"tag": "Fragrance", "weight": 0.69},
        {"tag": "Late-night", "weight": 0.66},
        {"tag": "Indie zines", "weight": 0.55},
        {"tag": "Single-origin coffee", "weight": 0.48},
        {"tag": "Ceramics", "weight": 0.4},
    ]

    for tn in TASTE_NODES:
        db.add(models.TasteNode(tag=tn["tag"], weight=tn["weight"]))

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

    for c in COLLECTION:
        db.add(models.CollectionItem(
            id=c["id"],
            name=c["name"],
            date=c["date"],
            rarity=c["rarity"],
            golden=c.get("golden", False)
        ))

    TRADES = [
        {"id": "t1", "item": "Tonka & Leather Candle", "from": "ember_ash", "rarity": "rare", "wants": ["Coffee", "Stationery"]},
        {"id": "t2", "item": "Sci-fi Triple Novella", "from": "void_reader", "rarity": "std", "wants": ["Poetry", "Zines"]},
        {"id": "t3", "item": "Silver Moth Pin", "from": "nocturne", "rarity": "legendary", "wants": ["Fragrance"]},
        {"id": "t4", "item": "Single-origin Sampler", "from": "slowpour", "rarity": "rare", "wants": ["Tea", "Chocolate"]},
    ]

    for t in TRADES:
        db.add(models.TradeListing(
            id=t["id"],
            box_item_id=t["id"],
            item_name=t["item"],
            from_user=t["from"],
            rarity=t["rarity"],
            want_tags_json=json.dumps(t["wants"]),
            status="open"
        ))

    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    init_db()
