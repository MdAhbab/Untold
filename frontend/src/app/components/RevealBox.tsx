import { useLayoutEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useTheme } from "../lib/store";
import type { SpoilerLevel } from "../lib/data";

/**
 * A theatrical CSS-3D gift box whose opening is scrubbed by `progress` (0 = sealed, 1 = open).
 * Spoiler-aware: sealed never opens (only glows), teased shows silhouettes, glimpse reveals contents.
 * Performant + reduced-motion friendly (caller can clamp progress to a static value).
 */
export function RevealBox({
  progress,
  spoiler = "glimpse",
  size: requestedSize = 260,
}: {
  progress: MotionValue<number>;
  spoiler?: SpoilerLevel;
  size?: number;
}) {
  const { theme } = useTheme();
  const opens = spoiler !== "sealed";

  // Self-scale so the box (container width = size*1.6) never overflows its parent on small screens.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(requestedSize);
  useLayoutEffect(() => {
    const measure = () => {
      const avail = wrapRef.current?.parentElement?.clientWidth ?? window.innerWidth;
      const max = Math.max(120, (avail - 24) / 1.6); // honour parent padding
      setSize(Math.min(requestedSize, max));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [requestedSize]);

  // Lid lifts & tilts
  const lidLift = useTransform(progress, [0, 1], [0, opens ? -size * 0.85 : 0]);
  const lidTilt = useTransform(progress, [0, 1], [0, opens ? -32 : 0]);
  // Ribbon unties (fades + drops)
  const ribbonOpacity = useTransform(progress, [0, 0.45], [1, opens ? 0 : 1]);
  const ribbonDrop = useTransform(progress, [0, 0.6], [0, opens ? size * 0.6 : 0]);
  // Glow spills out
  const glowOpacity = useTransform(progress, [0.15, 0.7], [0, 1]);
  const glowScale = useTransform(progress, [0.15, 1], [0.4, 1.4]);
  // Contents rise
  const contentRise = useTransform(progress, [0.4, 1], [size * 0.4, -size * 0.35]);
  const contentOpacity = useTransform(progress, [0.4, 0.75], [0, spoiler === "sealed" ? 0 : 1]);
  // Whole box breathes
  const boxFloat = useTransform(progress, [0, 1], [0, -10]);

  const wallTop =
    theme === "dark"
      ? "linear-gradient(135deg, #2c2440 0%, #1c1729 100%)"
      : "linear-gradient(135deg, #f1e8d6 0%, #e2d6bd 100%)";
  const wallSide =
    theme === "dark"
      ? "linear-gradient(180deg, #1a1525 0%, #120e1b 100%)"
      : "linear-gradient(180deg, #ddd0b8 0%, #cdbfa3 100%)";
  const wallFront =
    theme === "dark"
      ? "linear-gradient(180deg, #221b32 0%, #18121f 100%)"
      : "linear-gradient(180deg, #e6dac2 0%, #d6c8ab 100%)";

  return (
    <div ref={wrapRef} className="relative grid max-w-full place-items-center" style={{ width: size * 1.6, height: size * 1.8 }}>
      {/* reveal glow */}
      <motion.div
        aria-hidden
        className="absolute rounded-full reveal-glow blur-2xl"
        style={{ width: size * 1.8, height: size * 1.8, opacity: glowOpacity, scale: glowScale }}
      />

      {/* rising contents (silhouettes for teased, shapes for glimpse) */}
      <motion.div
        aria-hidden
        className="absolute flex items-end gap-3"
        style={{ y: contentRise, opacity: contentOpacity }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-t-2xl"
            style={{
              width: size * 0.2,
              height: size * (0.42 + i * 0.12),
              background:
                spoiler === "teased"
                  ? "linear-gradient(180deg, rgba(11,10,15,0.85), rgba(11,10,15,0.6))"
                  : "linear-gradient(180deg, var(--violet), var(--oxblood))",
              boxShadow: "0 0 30px -6px rgba(124,77,255,0.5)",
            }}
          />
        ))}
      </motion.div>

      {/* the box */}
      <motion.div style={{ y: boxFloat }} className="relative">
       <div style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg) rotateZ(45deg)" }}>
        {/* base walls */}
        <div
          className="relative"
          style={{ width: size, height: size, background: wallTop, transformStyle: "preserve-3d" }}
        >
          {/* front wall */}
          <div
            className="absolute left-0 top-full origin-top"
            style={{
              width: size,
              height: size * 0.42,
              background: wallFront,
              transform: "rotateX(-90deg)",
            }}
          />
          {/* side wall */}
          <div
            className="absolute left-full top-0 origin-left"
            style={{
              width: size * 0.42,
              height: size,
              background: wallSide,
              transform: "rotateY(90deg)",
            }}
          />
          {/* ribbon straps on base */}
          <motion.div style={{ opacity: ribbonOpacity }}>
            <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 foil-surface" style={{ width: size * 0.14 }} />
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 foil-surface" style={{ height: size * 0.14 }} />
          </motion.div>
        </div>

        {/* lid */}
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{
            width: size * 1.08,
            height: size * 1.08,
            x: "-50%",
            y: "-50%",
            z: lidLift,
            rotateX: lidTilt,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="relative size-full" style={{ background: wallTop, boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }}>
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.14), transparent 45%)" }} />
            <div className="absolute left-0 top-full w-full origin-top" style={{ height: size * 0.12, background: wallFront, transform: "rotateX(-90deg)" }} />
            <div className="absolute left-full top-0 h-full origin-left" style={{ width: size * 0.12, background: wallSide, transform: "rotateY(90deg)" }} />
            {/* lid ribbon + bow */}
            <motion.div style={{ opacity: ribbonOpacity, y: ribbonDrop }}>
              <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 foil-surface" style={{ width: size * 0.15 }} />
              <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 foil-surface" style={{ height: size * 0.15 }} />
              <div className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full foil-surface shadow-lg" />
            </motion.div>
          </div>
        </motion.div>
       </div>
      </motion.div>

      {/* contact shadow */}
      <div
        aria-hidden
        className="absolute bottom-6 h-6 rounded-[50%] blur-xl"
        style={{ width: size * 1.1, background: "rgba(0,0,0,0.45)" }}
      />
    </div>
  );
}
