from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict

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
    include_tags: List[str]
    exclude_tags: List[str]
    budget: float
    cadence: str
    tier: str
    spoiler: str

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
