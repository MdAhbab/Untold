import { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { SpotlightBg, Eyebrow, RibbonDivider } from "../components/visual/Atmosphere";
import { SAMPLE_BOX, TASTE_NODES } from "../lib/data";

function Constellation() {
  // place nodes on a radial layout; lines connect to a center taste-core
  const cx = 50, cy = 50;
  const nodes = TASTE_NODES.map((n, i) => {
    const angle = (i / TASTE_NODES.length) * Math.PI * 2 - Math.PI / 2;
    const r = 13 + (1 - n.weight) * 22;
    return { ...n, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border velvet">
      <SpotlightBg />
      <svg viewBox="0 0 100 100" className="relative size-full">
        {nodes.map((n, i) => (
          <motion.line
            key={`l${i}`}
            x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke="var(--foil-gold)" strokeWidth={0.3} opacity={0.35}
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}
        <circle cx={cx} cy={cy} r={3.5} fill="var(--violet)" />
        <circle cx={cx} cy={cy} r={6} fill="none" stroke="var(--violet)" strokeWidth={0.4} opacity={0.5}>
          <animate attributeName="r" values="6;9;6" dur="4s" repeatCount="indefinite" />
        </circle>
        {nodes.map((n, i) => (
          <motion.g key={`n${i}`} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, type: "spring" }}>
            <circle cx={n.x} cy={n.y} r={1 + n.weight * 2.2} fill="var(--foil-gold)" />
            <text x={n.x} y={n.y - 3.5} fontSize={2.4} fill="var(--ink)" textAnchor="middle" style={{ fontFamily: "var(--font-sans)" }}>
              {n.tag}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

export function Taste() {
  const [ratings, setRatings] = useState<Record<string, "keep" | "return">>({});
  const set = (id: string, v: "keep" | "return") => setRatings((r) => ({ ...r, [id]: v }));

  return (
    <main className="relative pt-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <Eyebrow>Teach the box</Eyebrow>
          <h1 className="mt-5">Your taste, <span className="italic">learning</span></h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-dim">
            Keep what landed, return what missed. The model nudges your next box closer — while keeping enough
            surprise that it never sends the same thing twice.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          {/* rating flow */}
          <div>
            <p className="label-caps text-foil-gold">Rate this box</p>
            <div className="mt-5 space-y-3">
              {SAMPLE_BOX.map((item) => {
                const r = ratings[item.id];
                return (
                  <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-bg-elev/60 p-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg" style={{ background: "linear-gradient(160deg, var(--accent), transparent)" }}>
                      <span className="font-display text-foil-gold">{item.name[0]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display">{item.name}</p>
                      <p className="truncate text-sm text-ink-dim">{item.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => set(item.id, "keep")} className={`grid size-10 place-items-center rounded-full border transition-colors ${r === "keep" ? "border-ok bg-ok/15 text-ok" : "border-border text-ink-dim hover:text-foreground"}`} aria-label="Keep">
                        <Check className="size-4" />
                      </button>
                      <button onClick={() => set(item.id, "return")} className={`grid size-10 place-items-center rounded-full border transition-colors ${r === "return" ? "border-oxblood bg-oxblood/15 text-foreground" : "border-border text-ink-dim hover:text-foreground"}`} aria-label="Return">
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-ink-dim">
              {Object.keys(ratings).length} of {SAMPLE_BOX.length} rated — your next box is already shifting.
            </p>
          </div>

          {/* constellation */}
          <div>
            <p className="label-caps text-foil-gold">Your taste constellation</p>
            <div className="mt-5"><Constellation /></div>
            <RibbonDivider className="my-6 opacity-30" />
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-dim">
              <span><span className="text-violet">●</span> taste core</span>
              <span><span className="text-foil-gold">●</span> stronger pull = larger star</span>
              <span><span className="text-ok">●</span> exploration kept open</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
