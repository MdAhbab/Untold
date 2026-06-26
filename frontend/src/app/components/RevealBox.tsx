import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useTransform, type MotionValue } from "motion/react";
import { useTheme } from "../lib/store";
import type { SpoilerLevel } from "../lib/data";

/**
 * A theatrical CSS-3D gift box whose opening is scrubbed by `progress`
 * (0 = sealed, 1 = open). The scene sits under a real `perspective` camera, so
 * the lid genuinely lifts along the box's vertical axis (under an orthographic
 * projection `translateZ` is invisible — which is what made the old version
 * read as "broken"). Timing is staged like a real lid: it rises first, then
 * tips back, then the contents lift out through the opening.
 *
 * Spoiler-aware: sealed never opens (only glows), teased shows silhouettes,
 * glimpse reveals contents. Reduced-motion friendly (caller clamps progress).
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

  // Self-scale so the box (footprint ≈ size) never overflows its parent.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(requestedSize);
  useLayoutEffect(() => {
    const measure = () => {
      const avail = wrapRef.current?.parentElement?.clientWidth ?? window.innerWidth;
      const max = Math.max(120, (avail - 24) / 1.7);
      setSize(Math.min(requestedSize, max));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [requestedSize]);

  const depth = size * 0.42; // wall height

  // Lid: rises straight up along the box normal (0 → 0.55), then tips back
  // (0.32 → 0.9). Staging the two beats is what sells the "lift".
  const lidZ = useTransform(progress, [0, 0.55], [2, opens ? size * 0.95 : 2]);
  const lidTilt = useTransform(progress, [0.32, 0.9], [0, opens ? -42 : 0]);

  // Ribbon unties: straps fade as the lid breaks the seal.
  const ribbonOpacity = useTransform(progress, [0, 0.32], [1, opens ? 0 : 1]);

  // Light spills from the opening once the lid clears the rim.
  const mouthGlow = useTransform(progress, [0.25, 0.7], [0, opens ? 1 : 0]);
  const haloOpacity = useTransform(progress, [0.2, 0.75], [0, 1]);
  const haloScale = useTransform(progress, [0.2, 1], [0.5, 1.45]);

  // Contents rise out of the opening, billboarded to face the viewer. They are
  // anchored at the opening plane (z >= 0) and only ever travel UP, so they can
  // never dip into the walls — CSS 3D can't depth-clip, so a pillar that crossed
  // the rim would visibly punch through the box. They grow upward as they emerge.
  // A small wholesale lift keeps the pillar feet pinned to the rim while scaleY
  // does the real work — they grow upward out of the opening rather than float up.
  const contentZ = useTransform(progress, [0.5, 1], [0, size * 0.12]);
  const contentScaleY = useTransform(progress, [0.48, 0.9], [0.15, 1]);
  const contentOpacity = useTransform(progress, [0.48, 0.62], [0, spoiler === "sealed" ? 0 : 1]);
  const contentTransform = useMotionTemplate`translateZ(${contentZ}px) rotateZ(-45deg) rotateX(-60deg)`;

  // Whole box breathes upward as it opens.
  const boxFloat = useTransform(progress, [0, 1], [0, -size * 0.04]);

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
    <div
      ref={wrapRef}
      className="relative grid max-w-full place-items-center"
      style={{ width: size * 1.7, height: size * 1.9, perspective: size * 4.5, perspectiveOrigin: "50% 32%" }}
    >
      {/* reveal halo behind the box */}
      <motion.div
        aria-hidden
        className="absolute rounded-full reveal-glow blur-2xl"
        style={{ width: size * 1.9, height: size * 1.9, opacity: haloOpacity, scale: haloScale }}
      />

      {/* bob group → orientation group (both preserve-3d so perspective carries through) */}
      <motion.div style={{ y: boxFloat, transformStyle: "preserve-3d" }} className="relative">
        <div style={{ transformStyle: "preserve-3d", transform: "rotateX(60deg) rotateZ(45deg)" }}>
          {/* base tray: open-top square at z=0, walls hang down */}
          <div className="relative" style={{ width: size, height: size, transformStyle: "preserve-3d" }}>
            {/* interior floor (darkened) so the open box reads as deep */}
            <div
              className="absolute inset-0"
              style={{ background: theme === "dark" ? "#0b0813" : "#cabfa6", transform: `translateZ(${-depth}px)` }}
            />
            {/* light spilling up out of the mouth */}
            <motion.div
              aria-hidden
              className="absolute inset-0 reveal-glow"
              style={{ opacity: mouthGlow, transform: "translateZ(1px)" }}
            />
            {/* front + side walls */}
            <div className="absolute left-0 top-full w-full origin-top" style={{ height: depth, background: wallFront, transform: "rotateX(-90deg)" }} />
            <div className="absolute left-full top-0 h-full origin-left" style={{ width: depth, background: wallSide, transform: "rotateY(90deg)" }} />
            {/* rim highlight */}
            <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 0 2px rgba(217,179,106,0.25)" }} />
            {/* ribbon straps on the base */}
            <motion.div style={{ opacity: ribbonOpacity }} aria-hidden>
              <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 foil-surface" style={{ width: size * 0.14 }} />
              <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 foil-surface" style={{ height: size * 0.14 }} />
            </motion.div>
          </div>

          {/* rising contents — a zero-size anchor at the opening centre, billboarded
              to face the viewer; the pillars hang off its bottom edge and grow up. */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2"
            style={{ x: "-50%", y: "-50%", transform: contentTransform, opacity: contentOpacity, transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-end gap-2"
              style={{ scaleY: contentScaleY, transformOrigin: "bottom" }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-t-xl"
                  style={{
                    width: size * 0.17,
                    height: size * (0.42 + i * 0.13),
                    background:
                      spoiler === "teased"
                        ? "linear-gradient(180deg, rgba(11,10,15,0.92), rgba(11,10,15,0.7))"
                        : "linear-gradient(180deg, var(--violet), var(--oxblood))",
                    boxShadow: "0 0 30px -6px rgba(124,77,255,0.55)",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* lid — lifts along the box normal, then tips back */}
          <motion.div
            className="absolute left-1/2 top-1/2"
            style={{
              width: size * 1.08,
              height: size * 1.08,
              x: "-50%",
              y: "-50%",
              z: lidZ,
              rotateX: lidTilt,
              transformStyle: "preserve-3d",
            }}
          >
            <div className="relative size-full" style={{ background: wallTop, boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }}>
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.16), transparent 45%)" }} />
              <div className="absolute left-0 top-full w-full origin-top" style={{ height: size * 0.12, background: wallFront, transform: "rotateX(-90deg)" }} />
              <div className="absolute left-full top-0 h-full origin-left" style={{ width: size * 0.12, background: wallSide, transform: "rotateY(90deg)" }} />
              {/* lid ribbon + bow */}
              <motion.div style={{ opacity: ribbonOpacity }} aria-hidden>
                <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 foil-surface" style={{ width: size * 0.15 }} />
                <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 foil-surface" style={{ height: size * 0.15 }} />
                <div className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full foil-surface shadow-lg" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* contact shadow */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 rounded-[50%] blur-xl"
        style={{ width: size * 1.1, height: size * 0.12, background: "rgba(0,0,0,0.45)", scale: haloScale }}
      />
    </div>
  );
}
