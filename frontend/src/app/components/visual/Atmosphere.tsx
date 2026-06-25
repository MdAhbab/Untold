import { useMemo } from "react";
import { motion } from "motion/react";
import { useTheme } from "../../lib/store";

/** Warm volumetric spotlight wash behind a scene. */
export function SpotlightBg({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 spotlight" />
      <div
        className="absolute left-1/2 top-0 h-[120%] w-[60%] -translate-x-1/2 opacity-60 blur-2xl"
        style={{
          background: "conic-gradient(from 180deg at 50% 0%, transparent 78%, rgba(255,244,214,0.10) 86%, transparent 92%)",
        }}
      />
      {/* cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(115% 95% at 50% 30%, transparent 58%, rgba(0,0,0,0.4) 100%)" }}
      />
    </div>
  );
}

/** Dust motes drifting in the beam. Pauses for reduced-motion. */
export function DustMotes({ count = 26 }: { count?: number }) {
  const { reducedMotion } = useTheme();
  const motes = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        dur: 9 + Math.random() * 14,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 40,
      })),
    [count],
  );
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full bg-spot/70"
          style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.size, height: m.size }}
          animate={{ y: [0, -60, 0], x: [0, m.drift, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** A thin foil ribbon divider. */
export function RibbonDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative h-px w-full ${className}`}>
      <div className="absolute inset-0 foil-surface opacity-60" />
    </div>
  );
}

/** Wax-seal CTA / emblem with foil specular sweep. */
export function WaxSeal({ label = "U", size = 64 }: { label?: string; size?: number }) {
  return (
    <span
      className="relative inline-grid place-items-center rounded-full text-oxblood shadow-[inset_0_2px_6px_rgba(0,0,0,0.35),0_8px_22px_-8px_rgba(0,0,0,0.5)]"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 30%, #a83a51, var(--oxblood) 70%)",
      }}
      aria-hidden
    >
      <span className="font-display italic text-spot/90" style={{ fontSize: size * 0.42 }}>
        {label}
      </span>
      <span
        className="absolute inset-1 rounded-full border opacity-40"
        style={{ borderColor: "rgba(255,244,214,0.4)", borderStyle: "dashed" }}
      />
    </span>
  );
}

/** Foil-stamped text. */
export function FoilText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`foil-text ${className}`}>{children}</span>;
}

/** A small-caps playbill label with foil rule. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <span className="inline-flex items-center gap-3 label-caps text-foil-gold">
      <span className="h-px w-8 foil-surface" style={{ opacity: theme === "dark" ? 0.8 : 0.6 }} />
      {children}
    </span>
  );
}
