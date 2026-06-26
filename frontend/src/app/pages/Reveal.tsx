import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import confetti from "canvas-confetti";
import { Star, Repeat, RotateCcw, Crown } from "lucide-react";
import { RevealBox } from "../components/RevealBox";
import { SpotlightBg, DustMotes, Eyebrow, FoilText, RibbonDivider } from "../components/visual/Atmosphere";
import { NumberRoll } from "../components/visual/Bits";
import { ItemCard, OddsNote } from "../components/Pieces";
import { SAMPLE_BOX, SPOILERS, TIERS } from "../lib/data";
import { getReveal } from "../lib/api";
import { useApp, useTheme, useIsMobile } from "../lib/store";

const DEFAULT_NARRATIVE =
  "A late-night box: heat and hush in the same breath. We wrapped the smolder around the quiet and hid a little gold inside.";

export function Reveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { draft, box } = useApp();
  const { reducedMotion } = useTheme();
  const isMobile = useIsMobile();
  const [golden, setGolden] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useTransform(scrollYProgress, [0, 0.85], [reducedMotion ? 0.6 : 0, reducedMotion ? 0.6 : 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Render the real assembled box when present; fall back to the sample box.
  const items = box?.items ?? SAMPLE_BOX;
  const spoilerId = box?.spoiler ?? draft.spoiler;
  const total = box?.value_total ?? items.reduce((s, i) => s + i.retailValue, 0);
  const spoiler = SPOILERS.find((s) => s.id === spoilerId)!;
  const tier = TIERS.find((t) => t.id === (box?.tier ?? draft.tier))!;

  useEffect(() => {
    if (!box) return;
    let alive = true;
    getReveal(box.id)
      .then((r) => alive && setNarrative(r.narrative.intro_line))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [box]);

  const fireGolden = () => {
    if (golden || reducedMotion) return setGolden(true);
    setGolden(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.4 }, colors: ["#D9B36A", "#7C4DFF", "#FFF4D6"], scalar: 0.9, ticks: 120 });
  };

  return (
    <main>
      {/* scroll-to-open scene */}
      <section ref={ref} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden velvet">
          <SpotlightBg />
          <DustMotes />
          <motion.div style={{ opacity: titleOpacity }} className="relative z-10 mt-8 px-5 text-center sm:mt-10">
            <Eyebrow>The reveal · {spoiler.name}</Eyebrow>
            <h1 className="mt-5">What's <span className="italic"><FoilText>inside?</FoilText></span></h1>
            <p className="mx-auto mt-4 max-w-md text-ink-dim">{spoiler.desc} Scroll to open.</p>
          </motion.div>
          <div className="mx-auto flex w-full max-w-md justify-center px-5">
            <RevealBox progress={progress} spoiler={spoilerId} size={isMobile ? 168 : 220} />
          </div>
        </div>
      </section>

      {/* contents */}
      <section className="relative mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-col items-center text-center">
          <Eyebrow>Your box · {tier.name}</Eyebrow>
          <h2 className="mt-5">{items.length} things, chosen for you</h2>
          <div className="mt-6 flex items-end gap-6 sm:gap-8">
            <div>
              <div className="font-display text-3xl sm:text-4xl"><NumberRoll value={total} prefix="$" /></div>
              <div className="label-caps text-ink-dim">total value</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <div className="font-display text-3xl sm:text-4xl">${draft.budget}</div>
              <div className="label-caps text-ink-dim">you paid</div>
            </div>
          </div>
          <div className="mt-6 max-w-xl"><OddsNote floor={tier.valueFloor} odds={tier.goldenOdds} /></div>
        </div>

        <RibbonDivider className="my-12 opacity-30" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const hidden = spoilerId === "sealed" || (spoilerId === "teased" && i > 0);
            return (
              <div key={item.id} className="relative">
                {item.isGolden && !hidden && (
                  <button
                    onClick={fireGolden}
                    className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full foil-surface px-3 py-1 text-xs font-medium shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <Crown className="mr-1 inline size-3" /> {golden ? "Golden pull!" : "Tap to reveal gold"}
                  </button>
                )}
                <ItemCard item={item} index={i} revealed={!hidden && (item.isGolden ? golden : true)} />
              </div>
            );
          })}
        </div>

        {/* narrative card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto mt-14 max-w-2xl overflow-hidden rounded-3xl border border-foil-gold/40 p-10 text-center velvet"
        >
          <SpotlightBg />
          <div className="relative">
            <Eyebrow>From the curator</Eyebrow>
            <p className="mt-5 font-display text-2xl leading-snug">
              “{narrative ?? DEFAULT_NARRATIVE}”
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link to="/taste" className="inline-flex items-center gap-2 rounded-full foil-surface px-7 py-3 font-medium shadow-lg transition-transform hover:scale-[1.03]">
            <Star className="size-4" /> Rate your items
          </Link>
          <Link to="/trade" className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 transition-colors hover:border-foreground/40">
            <Repeat className="size-4" /> Trade a duplicate
          </Link>
          <Link to="/build" className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 transition-colors hover:border-foreground/40">
            <RotateCcw className="size-4" /> Build another
          </Link>
        </div>
      </section>
    </main>
  );
}
