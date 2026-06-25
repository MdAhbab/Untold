from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from .database import Base

class Item(Base):
    __tablename__ = "items"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)
    tags_json = Column(String)
    cost = Column(Float)
    retail_value = Column(Float)
    stock = Column(Integer)
    rarity = Column(String)
    image = Column(String)
    attributes_json = Column(String)
    reason = Column(String) # For mock sample
    is_golden = Column(Boolean, default=False)

class TagGroup(Base):
    __tablename__ = "tag_groups"
    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String)
    tags_json = Column(String)

class Box(Base):
    __tablename__ = "boxes"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    status = Column(String) # assembling, assembled, shipped, opened, rated
    budget = Column(Float)
    tier = Column(String)
    spoiler_level = Column(String)
    theme = Column(String)
    value_total = Column(Float)
    created_at = Column(String)

class BoxItem(Base):
    __tablename__ = "box_items"
    id = Column(String, primary_key=True, index=True)
    box_id = Column(String)
    item_id = Column(String)
    reason = Column(String)
    is_golden = Column(Boolean)

class TasteProfile(Base):
    __tablename__ = "taste_profiles"
    user_id = Column(String, primary_key=True, index=True)
    embedding_json = Column(String)
    liked_tags_json = Column(String)
    disliked_tags_json = Column(String)
    updated_at = Column(String)

class TasteNode(Base):
    __tablename__ = "taste_nodes"
    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String)
    weight = Column(Float)

class Preference(Base):
    __tablename__ = "preferences"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    include_tags_json = Column(String)
    exclude_tags_json = Column(String)
    budget = Column(Float)
    cadence = Column(String)
    tier = Column(String)
    spoiler = Column(String)

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    item_id = Column(String)
    score = Column(Integer)
    kept = Column(Boolean)
    created_at = Column(String)

class TradeListing(Base):
    __tablename__ = "trade_listings"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    box_item_id = Column(String)
    item_name = Column(String)
    from_user = Column(String)
    rarity = Column(String)
    want_tags_json = Column(String)
    status = Column(String)

class HostSite(Base):
    __tablename__ = "host_sites"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    api_key = Column(String)
    theme_tokens_json = Column(String)
    webhook_url = Column(String)

class CollectionItem(Base):
    __tablename__ = "collection_items"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    date = Column(String)
    rarity = Column(String)
    golden = Column(Boolean, default=False)
