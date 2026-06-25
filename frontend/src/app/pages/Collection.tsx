import { motion } from "motion/react";
import { Flame, Share2, Crown } from "lucide-react";
import { SpotlightBg, Eyebrow, WaxSeal, FoilText } from "../components/visual/Atmosphere";
import { RarityBadge, NumberRoll } from "../components/visual/Bits";
import { COLLECTION } from "../lib/data";
import { rarityGlow } from "../components/Pieces";

export function Collection() {
  const goldenCount = COLLECTION.filter((c) => c.golden).length;
  // group into shelves of 4
  const shelves: typeof COLLECTION[] = [];
  for (let i = 0; i < COLLECTION.length; i += 4) shelves.push(COLLECTION.slice(i, i + 4));

  return (
    <main className="relative pt-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <Eyebrow>Cabinet of curiosities</Eyebrow>
          <h1 className="mt-5">Everything you've <span className="italic"><FoilText>unboxed</FoilText></span></h1>
        </div>

        {/* streak / stats */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4">
          {[
            { icon: Flame, v: 6, label: "month streak" },
            { icon: Crown, v: goldenCount, label: "golden pulls" },
            { icon: null, v: COLLECTION.length, label: "items kept" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-border bg-bg-elev/60 p-5 text-center">
              {s.icon && <s.icon className="mx-auto mb-2 size-5 text-foil-gold" />}
              <div className="font-display text-3xl"><NumberRoll value={s.v} /></div>
              <div className="label-caps text-ink-dim" style={{ fontSize: "0.55rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* lit shelves */}
        <div className="mt-16 space-y-12">
          {shelves.map((shelf, si) => (
            <div key={si} className="relative">
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                {shelf.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.6 }}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-bg-elev/60 p-5"
                  >
                    <div className="absolute inset-x-0 -top-10 h-20 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" style={{ background: rarityGlow[c.rarity] }} />
                    <div className="relative grid aspect-square place-items-center rounded-xl" style={{ background: `radial-gradient(circle at 50% 30%, ${rarityGlow[c.rarity]}, transparent 70%)` }}>
                      <WaxSeal size={48} label={c.name[0]} />
                    </div>
                    <p className="mt-4 truncate font-display">{c.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="label-caps text-ink-dim" style={{ fontSize: "0.55rem" }}>{c.date}</span>
                      <RarityBadge rarity={c.rarity} golden={c.golden} />
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* shelf board with foil edge */}
              <div className="mt-1 h-2 w-full rounded-b-lg foil-surface opacity-50" />
              <div className="mx-auto h-6 w-[92%] rounded-b-3xl bg-black/30 blur-md" />
            </div>
          ))}
        </div>

        {/* shareable pull card */}
        <div className="mt-20">
          <p className="text-center label-caps text-foil-gold">Share a pull</p>
          <div className="mx-auto mt-6 max-w-sm">
            <div className="relative overflow-hidden rounded-3xl border border-foil-gold/50 p-8 text-center velvet glow-violet">
              <SpotlightBg />
              <div className="relative">
                <RarityBadge rarity="legendary" golden />
                <h3 className="mt-5 font-display text-2xl">Halcyon No. 7</h3>
                <p className="mt-1 text-ink-dim">Vetiver & Smoke · 1 of 200</p>
                <div className="mx-auto my-6 grid size-24 place-items-center rounded-full" style={{ background: "var(--reveal-glow)" }}>
                  <WaxSeal size={56} />
                </div>
                <p className="label-caps text-ink-dim">Untold · Legendary · Golden</p>
              </div>
            </div>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full foil-surface px-7 py-3 font-medium shadow-lg transition-transform hover:scale-[1.02]">
              <Share2 className="size-4" /> Share pull card
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
