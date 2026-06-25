from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import json

from . import models, schemas
from .database import engine, get_db

app = FastAPI(title="Untold Mystery Box API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data", response_model=schemas.InitializeResponse)
def get_initial_data(db: Session = Depends(get_db)):
    tag_groups_db = db.query(models.TagGroup).all()
    tagGroups = []
    for tg in tag_groups_db:
        tagGroups.append({
            "group": tg.group_name,
            "tags": json.loads(tg.tags_json)
        })
        
    items_db = db.query(models.Item).all()
    sampleBox = []
    for item in items_db:
        sampleBox.append({
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "tags": json.loads(item.tags_json),
            "cost": item.cost,
            "retailValue": item.retail_value,
            "rarity": item.rarity,
            "reason": item.reason,
            "isGolden": item.is_golden
        })
        
    taste_nodes_db = db.query(models.TasteNode).all()
    tasteNodes = [{"tag": tn.tag, "weight": tn.weight} for tn in taste_nodes_db]
    
    collection_db = db.query(models.CollectionItem).all()
    collection = [{"id": c.id, "name": c.name, "date": c.date, "rarity": c.rarity, "golden": c.golden} for c in collection_db]
    
    trades_db = db.query(models.TradeListing).all()
    trades = [{"id": t.id, "item": t.item_name, "from_user": t.from_user, "rarity": t.rarity, "wants": json.loads(t.want_tags_json)} for t in trades_db]

    return {
        "tagGroups": tagGroups,
        "sampleBox": sampleBox,
        "tasteNodes": tasteNodes,
        "collection": collection,
        "trades": trades
    }

@app.post("/api/preferences")
def save_preferences(pref: schemas.PreferenceBase, db: Session = Depends(get_db)):
    return {"status": "ok", "message": "Preferences saved"}

@app.post("/api/boxes/assemble")
def assemble_box():
    # In a real app this would call the agent. We return success.
    return {"status": "ok", "box_id": "b-1029"}

@app.get("/api/boxes/{id}/reveal")
def get_reveal(id: str):
    return {"status": "ok", "config": "reveal configuration"}

@app.post("/api/boxes/{id}/order")
def place_order(id: str):
    return {"status": "ok", "message": "Order placed"}

@app.post("/api/ratings")
def submit_rating():
    return {"status": "ok", "message": "Rating saved"}

@app.get("/api/taste/me")
def get_taste():
    return {"status": "ok", "embedding": []}

@app.post("/api/trades")
def create_trade():
    return {"status": "ok", "message": "Trade listed"}

@app.get("/api/trades")
def get_trades(match: str = None):
    return {"status": "ok", "trades": []}

# Agent endpoints
@app.post("/api/agents/curate")
def agent_curate():
    return {"status": "ok", "message": "Box curated"}

@app.post("/api/agents/taste-update")
def agent_taste_update():
    return {"status": "ok", "message": "Taste embedding updated"}

@app.get("/api/agents/inventory-plan")
def agent_inventory_plan():
    return {"status": "ok", "weights": {}}

@app.post("/api/agents/reveal-story")
def agent_reveal_story():
    return {"status": "ok", "story": "Reveal story generated"}
