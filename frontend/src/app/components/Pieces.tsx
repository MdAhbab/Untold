import { motion } from "motion/react";
import { Check, Info, Sparkles } from "lucide-react";
import type { Item, Rarity } from "../lib/data";
import { RarityBadge, NumberRoll } from "./visual/Bits";
import { cn } from "./ui/utils";

export function ItemCard({ item, index = 0, revealed = true }: { item: Item; index?: number; revealed?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-bg-elev/70 p-6 backdrop-blur",
        item.isGolden && "border-foil-gold/50 glow-violet",
      )}
    >
      {item.isGolden && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100"
          style={{ background: "radial-gradient(120% 120% at 50% 0%, rgba(217,179,106,0.18), transparent 60%)" }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <span className="label-caps text-ink-dim">{item.category}</span>
        <RarityBadge rarity={item.rarity} golden={item.isGolden} />
      </div>

      <div
        className="my-5 grid aspect-square place-items-center rounded-xl border border-border"
        style={{ background: "linear-gradient(160deg, var(--accent), transparent)" }}
      >
        {revealed ? (
          <Sparkles className="size-10 text-foil-gold/70" />
        ) : (
          <div className="size-2/3 rounded-lg bg-foreground/80 blur-[1px]" />
        )}
      </div>

      <h4 className="font-display">{revealed ? item.name : "Hidden until delivery"}</h4>
      {revealed && (
        <p className="mt-2 flex gap-2 text-sm text-ink-dim">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-violet" />
          {item.reason}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="label-caps text-ink-dim">Value</span>
        <span className="font-display text-lg">
          {revealed ? <NumberRoll value={item.retailValue} prefix="$" /> : "$ ??"}
        </span>
      </div>
    </motion.article>
  );
}

export function TagTile({
  label,
  active,
  onClick,
  tone = "default",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "default" | "nogo";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm transition-all",
        active
          ? tone === "nogo"
            ? "border-oxblood bg-oxblood/15 text-foreground"
            : "border-foil-gold/70 bg-foil-gold/10 text-foreground shadow-[0_0_24px_-10px_var(--foil-gold)]"
          : "border-border text-ink-dim hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {active && <Check className="mr-1.5 inline size-3.5" />}
      {label}
    </button>
  );
}

export function OddsNote({ floor, odds }: { floor: number; odds: string }) {
  return (
    <p className="flex items-start gap-2 text-xs text-ink-dim">
      <Info className="mt-0.5 size-3.5 shrink-0 text-ok" />
      <span>
        Ethical surprise — never a gamble. Guaranteed value floor of{" "}
        <span className="text-foreground">{Math.round((floor - 1) * 100)}%</span> over price; golden-item odds{" "}
        <span className="text-foreground tabular-nums">{odds}</span>, disclosed up front.
      </span>
    </p>
  );
}

export const rarityGlow: Record<Rarity, string> = {
  std: "rgba(169,159,180,0.25)",
  rare: "rgba(124,77,255,0.4)",
  legendary: "rgba(217,179,106,0.45)",
};
