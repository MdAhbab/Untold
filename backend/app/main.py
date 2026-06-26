import json
import uuid
from contextlib import asynccontextmanager
from dataclasses import asdict
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, curation
from .database import get_db
from .seed import init_db

DEMO_USER = "u-demo"

# Curated default preference behind the marketing sample box on `/api/data`.
SAMPLE_PREF = dict(
    include_tags=["Cozy & dim", "Late-night", "Poetry", "Spicy snacks", "Fragrance"],
    exclude_tags=[], budget=95, tier="legendary", seed=7,
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create tables and (re)seed reference data so a fresh clone runs with no
    # manual steps. User-generated boxes/preferences/ratings are preserved.
    init_db(force=True)
    yield


app = FastAPI(title="Untold Mystery Box API", version="1.0.0", lifespan=lifespan)

# Credentials cannot be combined with a "*" origin, so list the dev origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:4173", "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _catalog(db: Session) -> list[curation.CandidateItem]:
    return [
        curation.CandidateItem(
            id=it.id, name=it.name, category=it.category,
            tags=json.loads(it.tags_json), cost=it.cost,
            retail_value=it.retail_value, stock=it.stock or 0,
            rarity=it.rarity, reason=it.reason or "", image=it.image,
        )
        for it in db.query(models.Item).all()
    ]


def _taste_weights(db: Session) -> dict[str, float]:
    return {tn.tag: tn.weight for tn in db.query(models.TasteNode).all()}


def _inventory_weights(db: Session) -> dict[str, float]:
    """Overstock tags get a small boost; scarce tags a small penalty."""
    weights: dict[str, float] = {}
    for it in db.query(models.Item).all():
        stock = it.stock or 0
        w = 0.15 if stock > 120 else -0.2 if stock < 25 else 0.0
        for t in json.loads(it.tags_json):
            weights[t] = weights.get(t, 0.0) + w
    return weights


def _recent_item_ids(db: Session, limit_boxes: int = 1) -> list[str]:
    """No-repeat set: items from the user's most recent box(es)."""
    boxes = (
        db.query(models.Box)
        .filter(models.Box.user_id == DEMO_USER)
        .order_by(models.Box.created_at.desc())
        .limit(limit_boxes)
        .all()
    )
    ids = [b.id for b in boxes]
    if not ids:
        return []
    rows = db.query(models.BoxItem).filter(models.BoxItem.box_id.in_(ids)).all()
    return [r.item_id for r in rows]


def _log_run(db: Session, agent: str, payload: dict, output: dict, confidence: float) -> None:
    db.add(models.AgentRun(
        agent=agent, input_json=json.dumps(payload),
        output_json=json.dumps(output), confidence=confidence, created_at=_now(),
    ))


# ---------------------------------------------------------------------------
# Bootstrap data
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"name": "Untold Mystery Box API", "docs": "/docs"}


@app.get("/api/data", response_model=schemas.InitializeResponse)
def get_initial_data(db: Session = Depends(get_db)):
    tag_groups = [
        {"group": tg.group_name, "tags": json.loads(tg.tags_json)}
        for tg in db.query(models.TagGroup).all()
    ]

    # The hero/sample box is a real solver run (not hand-placed), with the one
    # legendary surfaced as a golden pull for the marketing moment.
    sample = curation.assemble(
        _catalog(db), taste=_taste_weights(db),
        inventory_weights=_inventory_weights(db), **SAMPLE_PREF,
    )
    sample_box = [asdict(i) for i in sample.items]
    for i in sample_box:
        i.pop("image", None)
    legendary = next((i for i in sample_box if i["rarity"] == "legendary"), None)
    if legendary:
        legendary["isGolden"] = True

    taste_nodes = [{"tag": tn.tag, "weight": tn.weight} for tn in db.query(models.TasteNode).all()]
    collection = [
        {"id": c.id, "name": c.name, "date": c.date, "rarity": c.rarity, "golden": c.golden}
        for c in db.query(models.CollectionItem).all()
    ]
    trades = [
        {"id": t.id, "item": t.item_name, "from_user": t.from_user,
         "rarity": t.rarity, "wants": json.loads(t.want_tags_json)}
        for t in db.query(models.TradeListing).all()
    ]

    return {
        "sampleBox": sample_box,
        "tagGroups": tag_groups,
        "tasteNodes": taste_nodes,
        "collection": collection,
        "trades": trades,
    }


# ---------------------------------------------------------------------------
# Preferences + curation
# ---------------------------------------------------------------------------
@app.post("/api/preferences", response_model=schemas.PreferenceResponse)
def save_preferences(pref: schemas.PreferenceBase, db: Session = Depends(get_db)):
    pref_id = "p-" + uuid.uuid4().hex[:8]
    db.add(models.Preference(
        id=pref_id, user_id=DEMO_USER,
        include_tags_json=json.dumps(pref.include_tags),
        exclude_tags_json=json.dumps(pref.exclude_tags),
        budget=pref.budget, cadence=pref.cadence, tier=pref.tier, spoiler=pref.spoiler,
    ))
    db.commit()
    return {"id": pref_id}


def _resolve_pref(req: schemas.AssembleRequest, db: Session):
    if req.preference_id:
        pref = db.query(models.Preference).filter_by(id=req.preference_id).first()
        if not pref:
            raise HTTPException(status_code=404, detail="preference not found")
        return (json.loads(pref.include_tags_json), json.loads(pref.exclude_tags_json),
                pref.budget, pref.tier, pref.spoiler)
    return (req.include_tags or [], req.exclude_tags or [],
            req.budget or 75.0, req.tier or "rare", req.spoiler or "teased")


@app.post("/api/boxes/assemble", response_model=schemas.AssembledBoxResponse)
def assemble_box(req: schemas.AssembleRequest, db: Session = Depends(get_db)):
    include, exclude, budget, tier, spoiler = _resolve_pref(req, db)
    box = curation.assemble(
        _catalog(db), include_tags=include, exclude_tags=exclude, budget=budget,
        tier=tier, taste=_taste_weights(db), past_ids=_recent_item_ids(db),
        inventory_weights=_inventory_weights(db), seed=req.seed,
    )
    box.spoiler = spoiler
    if not box.items:
        raise HTTPException(status_code=422, detail="No items match those constraints — loosen the budget or no-go tags.")

    box_id = "b-" + uuid.uuid4().hex[:8]
    db.add(models.Box(
        id=box_id, user_id=DEMO_USER, status="assembled", budget=budget, tier=tier,
        spoiler_level=spoiler, theme=box.theme, value_total=box.value_total, created_at=_now(),
    ))
    for it in box.items:
        db.add(models.BoxItem(
            id=uuid.uuid4().hex[:10], box_id=box_id, item_id=it.id,
            reason=it.reason, is_golden=it.isGolden,
        ))
    payload = {"include": include, "exclude": exclude, "budget": budget, "tier": tier}
    _log_run(db, "curation", payload, {"box_id": box_id, "theme": box.theme}, box.confidence)
    db.commit()

    return {"id": box_id, "items": [asdict(i) for i in box.items], "theme": box.theme,
            "value_total": box.value_total, "value_floor": box.value_floor,
            "cost_total": box.cost_total, "tier": box.tier, "spoiler": box.spoiler,
            "seed": box.seed, "confidence": box.confidence, "notes": box.notes}


def _box_items(db: Session, box_id: str):
    box = db.query(models.Box).filter_by(id=box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="box not found")
    items = []
    for bi in db.query(models.BoxItem).filter_by(box_id=box_id).all():
        it = db.query(models.Item).filter_by(id=bi.item_id).first()
        if not it:
            continue
        items.append({
            "id": it.id, "name": it.name, "category": it.category,
            "tags": json.loads(it.tags_json), "cost": it.cost,
            "retailValue": it.retail_value, "rarity": it.rarity,
            "reason": bi.reason or it.reason, "isGolden": bool(bi.is_golden),
        })
    return box, items


@app.get("/api/boxes/{box_id}", response_model=schemas.AssembledBoxResponse)
def get_box(box_id: str, db: Session = Depends(get_db)):
    box, items = _box_items(db, box_id)
    cfg = curation.TIER_CONFIG.get(box.tier, curation.TIER_CONFIG["rare"])
    return {"id": box.id, "items": items, "theme": box.theme,
            "value_total": box.value_total, "value_floor": round(box.budget * cfg["value_floor"], 2),
            "cost_total": sum(i["cost"] for i in items), "tier": box.tier,
            "spoiler": box.spoiler_level, "seed": 0, "confidence": 0.0, "notes": []}


def _reveal_story(box, items: list[dict]) -> dict:
    kept = [i for i in items if i.get("isGolden")] or items[:1]
    lead = kept[0]["name"] if kept else "your box"
    intro = f"{box.theme}. We wrapped the loud around the quiet — and tucked {lead} where you'd least expect it."
    blurbs = [{"item_id": i["id"], "blurb": i["reason"]} for i in items]
    share = f"I unboxed “{box.theme}” on Untold — {len(items)} things, one idea."
    return {"intro_line": intro, "per_item_blurbs": blurbs, "share_card_copy": share}


@app.get("/api/boxes/{box_id}/reveal", response_model=schemas.RevealResponse)
def get_reveal(box_id: str, db: Session = Depends(get_db)):
    box, items = _box_items(db, box_id)
    spoiler = box.spoiler_level
    out = []
    for idx, it in enumerate(items):
        if spoiler == "sealed":
            shown = "hidden"
        elif spoiler == "teased":
            shown = "revealed" if idx == 0 else "silhouette"
        else:
            shown = "revealed"
        out.append({**it, "shown": shown})
    return {"id": box.id, "tier": box.tier, "spoiler": spoiler,
            "value_total": box.value_total, "items": out,
            "narrative": _reveal_story(box, items)}


@app.post("/api/boxes/{box_id}/order")
def place_order(box_id: str, db: Session = Depends(get_db)):
    box = db.query(models.Box).filter_by(id=box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="box not found")
    box.status = "ordered"
    db.commit()
    return {"status": "ok", "box_id": box_id}


# ---------------------------------------------------------------------------
# Ratings + taste
# ---------------------------------------------------------------------------
@app.post("/api/ratings")
def submit_rating(rating: schemas.RatingRequest, db: Session = Depends(get_db)):
    db.add(models.Rating(
        id=uuid.uuid4().hex[:10], user_id=DEMO_USER, item_id=rating.item_id,
        score=rating.score, kept=rating.kept, created_at=_now(),
    ))
    db.commit()
    return {"status": "ok"}


@app.get("/api/taste/me")
def get_taste(db: Session = Depends(get_db)):
    nodes = [{"tag": tn.tag, "weight": tn.weight} for tn in db.query(models.TasteNode).all()]
    return {"nodes": nodes, "exploration_rate": 0.2}


@app.post("/api/agents/taste-update")
def agent_taste_update(db: Session = Depends(get_db)):
    """Nudge taste weights from stored ratings, protecting exploration."""
    nodes = {tn.tag: tn for tn in db.query(models.TasteNode).all()}
    changed = 0
    for r in db.query(models.Rating).filter_by(user_id=DEMO_USER).all():
        it = db.query(models.Item).filter_by(id=r.item_id).first()
        if not it:
            continue
        delta = 0.06 if r.kept else -0.08
        for tag in json.loads(it.tags_json):
            node = nodes.get(tag)
            if node is None:
                node = models.TasteNode(tag=tag, weight=0.5)
                db.add(node)
                nodes[tag] = node
            node.weight = max(0.0, min(1.0, node.weight + delta))
            changed += 1
    db.commit()
    out = [{"tag": tn.tag, "weight": round(tn.weight, 3)} for tn in nodes.values()]
    return {"updated": changed, "nodes": out, "exploration_rate": 0.2}


@app.get("/api/agents/inventory-plan")
def agent_inventory_plan(db: Session = Depends(get_db)):
    overstock, scarce = [], []
    for it in db.query(models.Item).all():
        stock = it.stock or 0
        entry = {"id": it.id, "name": it.name, "stock": stock}
        if stock > 120:
            overstock.append(entry)
        elif stock < 25:
            scarce.append(entry)
    return {
        "overstock": overstock, "scarce": scarce,
        "rationale": "Overstock tags get a gentle scoring boost; scarce items are rationed. "
                     "Match quality always wins — balancing is a nudge, capped, never a stuffing.",
    }


@app.post("/api/agents/reveal-story")
def agent_reveal_story(req: schemas.AssembleRequest, db: Session = Depends(get_db)):
    box_id = req.preference_id  # reuse the field as box_id for this agent call
    if not box_id:
        raise HTTPException(status_code=422, detail="box id required")
    box, items = _box_items(db, box_id)
    story = _reveal_story(box, items)
    _log_run(db, "reveal", {"box_id": box_id}, story, 0.8)
    db.commit()
    return story


# ---------------------------------------------------------------------------
# Trades
# ---------------------------------------------------------------------------
@app.get("/api/trades")
def get_trades(match: str | None = None, db: Session = Depends(get_db)):
    trades = [
        {"id": t.id, "item": t.item_name, "from_user": t.from_user,
         "rarity": t.rarity, "wants": json.loads(t.want_tags_json)}
        for t in db.query(models.TradeListing).filter_by(status="open").all()
    ]
    return {"trades": trades}


@app.post("/api/trades")
def create_trade(payload: dict, db: Session = Depends(get_db)):
    trade_id = "t-" + uuid.uuid4().hex[:8]
    db.add(models.TradeListing(
        id=trade_id, user_id=DEMO_USER,
        box_item_id=payload.get("box_item_id", trade_id),
        item_name=payload.get("item", "Untitled"),
        from_user=DEMO_USER, rarity=payload.get("rarity", "std"),
        want_tags_json=json.dumps(payload.get("want_tags", [])), status="open",
    ))
    db.commit()
    return {"status": "ok", "id": trade_id}
