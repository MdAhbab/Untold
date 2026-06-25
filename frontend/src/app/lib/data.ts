// Untold — mock inventory & domain data (dev). Mirrors the SQLite model in README.
export type Rarity = "std" | "rare" | "legendary";
export type SpoilerLevel = "sealed" | "teased" | "glimpse";

export interface Item {
  id: string;
  name: string;
  category: string;
  tags: string[];
  cost: number;
  retailValue: number;
  rarity: Rarity;
  reason: string; // "why we picked this" — from the Reveal-Narrative agent
  isGolden?: boolean;
}

export let TAG_GROUPS: { group: string; tags: string[] }[] = [];

export const NOGO_TAGS = ["Nuts", "Dairy", "Scented", "Caffeine", "Alcohol", "Latex"];

export const CADENCES = [
  { id: "once", label: "One-off", note: "A single box, no commitment." },
  { id: "monthly", label: "Monthly", note: "A new secret every month." },
  { id: "season", label: "Seasonal", note: "Four times a year, with a choice window." },
];

export const TIERS: {
  id: Rarity;
  name: string;
  blurb: string;
  valueFloor: number;
  goldenOdds: string;
}[] = [
  { id: "std", name: "Standard", blurb: "A coherent, well-made box. The everyday secret.", valueFloor: 1.1, goldenOdds: "1 in 80" },
  { id: "rare", name: "Rare", blurb: "Scarcer picks, deeper themes, a heavier ribbon.", valueFloor: 1.25, goldenOdds: "1 in 30" },
  { id: "legendary", name: "Legendary", blurb: "The vault. Limited makers, the best odds at gold.", valueFloor: 1.4, goldenOdds: "1 in 9" },
];

export const SPOILERS: { id: SpoilerLevel; name: string; desc: string }[] = [
  { id: "sealed", name: "Sealed", desc: "Zero hints on-site. The box only glows. Wait for delivery." },
  { id: "teased", name: "Teased", desc: "The lid lifts to show silhouettes — categories, not items." },
  { id: "glimpse", name: "Glimpse", desc: "One item revealed in full; the rest stay in shadow." },
];

// A sample assembled box (would come from /api/agents/curate)
export let SAMPLE_BOX: Item[] = [];

export let TASTE_NODES: { tag: string; weight: number }[] = [];

export let COLLECTION: any[] = [];

export let TRADES: any[] = [];

export const PULL_CARDS = [
  { who: "—  M., Lisbon", quote: "I chose Teased. The silhouettes nearly killed me. Best part of my month.", tier: "Rare" },
  { who: "—  J., Osaka", quote: "Pulled a golden vetiver on my second box. I've stopped buying perfume blind.", tier: "Legendary" },
  { who: "—  R., Berlin", quote: "Sealed feels like a letter you're not allowed to open yet. Delicious.", tier: "Standard" },
];

export const rarityLabel: Record<Rarity, string> = { std: "Standard", rare: "Rare", legendary: "Legendary" };

export function updateData(payload: any) {
  TAG_GROUPS = payload.tagGroups || [];
  SAMPLE_BOX = payload.sampleBox || [];
  TASTE_NODES = payload.tasteNodes || [];
  COLLECTION = payload.collection || [];
  TRADES = payload.trades || [];
}
