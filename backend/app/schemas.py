from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict

class ItemBase(BaseModel):
    id: str
    name: str
    category: str
    cost: float
    retailValue: float
    rarity: str
    reason: str
    isGolden: Optional[bool] = False

class ItemCreate(ItemBase):
    tags: List[str]
    image: Optional[str] = None
    attributes: Optional[Dict] = None
    stock: Optional[int] = 0

class Item(ItemBase):
    tags: List[str]
    model_config = ConfigDict(from_attributes=True)

class TagGroupBase(BaseModel):
    group: str
    tags: List[str]

class PreferenceBase(BaseModel):
    include_tags: List[str] = []
    exclude_tags: List[str] = []
    budget: float = 75
    cadence: str = "monthly"
    tier: str = "rare"
    spoiler: str = "teased"

class PreferenceResponse(BaseModel):
    id: str

class TradeListing(BaseModel):
    id: str
    item: str
    from_user: str
    rarity: str
    wants: List[str]

class CollectionItem(BaseModel):
    id: str
    name: str
    date: str
    rarity: str
    golden: Optional[bool] = False

class TasteNode(BaseModel):
    tag: str
    weight: float

class InitializeResponse(BaseModel):
    sampleBox: List[Item]
    tagGroups: List[TagGroupBase]
    tasteNodes: List[TasteNode]
    collection: List[CollectionItem]
    trades: List[TradeListing]

# ---- Curation engine ----
class AssembleRequest(BaseModel):
    preference_id: Optional[str] = None
    include_tags: Optional[List[str]] = None
    exclude_tags: Optional[List[str]] = None
    budget: Optional[float] = None
    tier: Optional[str] = None
    spoiler: Optional[str] = None
    seed: Optional[int] = None

class AssembledItem(BaseModel):
    id: str
    name: str
    category: str
    tags: List[str]
    cost: float
    retailValue: float
    rarity: str
    reason: str
    isGolden: bool = False

class AssembledBoxResponse(BaseModel):
    id: str
    items: List[AssembledItem]
    theme: str
    value_total: float
    value_floor: float
    cost_total: float
    tier: str
    spoiler: str
    seed: int
    confidence: float
    notes: List[str] = []

class RevealItem(AssembledItem):
    shown: str  # revealed | silhouette | hidden

class RevealResponse(BaseModel):
    id: str
    tier: str
    spoiler: str
    value_total: float
    items: List[RevealItem]
    narrative: Dict

class RatingRequest(BaseModel):
    item_id: str
    kept: bool
    score: Optional[int] = None
    box_id: Optional[str] = None
