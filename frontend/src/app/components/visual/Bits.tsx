import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { Crown } from "lucide-react";
import type { Rarity } from "../../lib/data";
import { rarityLabel } from "../../lib/data";
import { cn } from "../ui/utils";

/** Tabular number that rolls up when scrolled into view. */
export function NumberRoll({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {Math.round(display).toLocaleString()}
      {suffix}
    </span>
  );
}

const rarityStyle: Record<Rarity, string> = {
  std: "border-ink-dim/40 text-ink-dim",
  rare: "border-violet/50 text-violet",
  legendary: "border-foil-gold/60 text-foil-gold",
};

export function RarityBadge({ rarity, golden = false }: { rarity: Rarity; golden?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 label-caps",
        golden ? "foil-surface border-transparent" : rarityStyle[rarity],
      )}
      style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
    >
      {golden && <Crown className="size-3" />}
      {golden ? "Golden" : rarityLabel[rarity]}
    </span>
  );
}
