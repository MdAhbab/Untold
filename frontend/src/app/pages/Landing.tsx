import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Tag, Sparkles, Boxes } from "lucide-react";
import { RevealBox } from "../components/RevealBox";
import { SpotlightBg, DustMotes, Eyebrow, FoilText, WaxSeal, RibbonDivider } from "../components/visual/Atmosphere";
import { NumberRoll } from "../components/visual/Bits";
import { TIERS, PULL_CARDS } from "../lib/data";
import { OddsNote } from "../components/Pieces";
import { useTheme, useIsMobile } from "../lib/store";

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useTheme();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // map the first ~80% of the scroll-through to box opening
  const progress = useTransform(scrollYProgress, [0, 0.8], [reducedMotion ? 0.6 : 0, reducedMotion ? 0.6 : 1]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden velvet">
        <SpotlightBg />
        <DustMotes count={isMobile ? 14 : 26} />

        <motion.div style={{ y: headlineY, opacity: headlineOpacity }} className="relative z-10 mt-8 px-5 text-center sm:mt-16">
          <Eyebrow>The curated mystery box</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance sm:mt-6">
            You set the vibe.
            <br />
            We keep the <span className="font-display italic"><FoilText>secret.</FoilText></span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-dim sm:mt-6 sm:text-lg">
            A budget and a few taste tags. We assemble a coherent, handpicked box from live inventory —
            then hand you the moment before you open it.
          </p>
        </motion.div>

        <motion.div className="relative z-0 -mt-2 w-full px-5 sm:-mt-6" style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.08]) }}>
          <div className="mx-auto flex w-full max-w-md justify-center">
            <RevealBox progress={progress} spoiler="glimpse" size={isMobile ? 168 : 220} />
          </div>
        </motion.div>

        <motion.div style={{ opacity: headlineOpacity }} className="absolute bottom-7 z-10 flex flex-col items-center gap-3 sm:bottom-10">
          <Link to="/build" className="group inline-flex items-center gap-2 rounded-full foil-surface px-7 py-3.5 font-medium shadow-lg transition-transform hover:scale-[1.03]">
            Build your box <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="label-caps text-ink-dim">Scroll to open ↓</span>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-5 py-20 text-center sm:grid-cols-3">
      {[
        { v: 13, suffix: "B", label: "Mystery-box market, 2024", prefix: "$" },
        { v: 200, suffix: "+", label: "Independent makers stocked" },
        { v: 40, suffix: "%", label: "Min. value over price, top tier" },
      ].map((s) => (
        <div key={s.label}>
          <div className="font-display text-5xl"><NumberRoll value={s.v} prefix={s.prefix} suffix={s.suffix} /></div>
          <p className="mt-2 label-caps text-ink-dim">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

function Craft() {
  const steps = [
    { icon: Tag, h: "You pick a vibe", p: "A handful of taste tags and a budget. No-go tags keep allergies and dislikes strictly out." },
    { icon: Boxes, h: "We solve the box", p: "A constraint solver matches inventory to your taste — budget, variety, no repeats — scored for coherence." },
    { icon: Sparkles, h: "It reveals on your terms", p: "Choose how much to know. Then scroll to open: ribbon, lid, light, and the contents rise." },
  ];
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-20">
      <div className="text-center">
        <Eyebrow>Curation as craft</Eyebrow>
        <h2 className="mt-5">Invisible work. <span className="italic">Visible</span> delight.</h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.h}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="rounded-2xl border border-border bg-bg-elev/60 p-7 backdrop-blur"
          >
            <s.icon className="size-6 text-foil-gold" />
            <p className="mt-5 label-caps text-ink-dim">Step {i + 1}</p>
            <h4 className="mt-2 font-display text-xl">{s.h}</h4>
            <p className="mt-3 text-ink-dim">{s.p}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Tiers() {
  return (
    <section className="relative overflow-hidden py-24 velvet">
      <SpotlightBg />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="text-center">
          <Eyebrow>Three pedestals</Eyebrow>
          <h2 className="mt-5">Rarity, disclosed</h2>
        </div>
        <div className="mt-16 grid items-end gap-6 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              className={`relative rounded-2xl border p-8 text-center ${
                t.id === "legendary" ? "border-foil-gold/50 bg-bg-elev glow-violet md:-translate-y-6" : "border-border bg-bg-elev/60"
              }`}
            >
              <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full" style={{ background: "var(--reveal-glow)" }}>
                <WaxSeal size={40} label={t.name[0]} />
              </div>
              <p className="label-caps text-foil-gold">{t.name}</p>
              <p className="mt-3 text-ink-dim">{t.blurb}</p>
              <div className="mt-6 flex justify-center gap-6 border-t border-border pt-6 text-sm">
                <div>
                  <div className="font-display text-2xl">+{Math.round((t.valueFloor - 1) * 100)}%</div>
                  <div className="label-caps text-ink-dim">value floor</div>
                </div>
                <div>
                  <div className="font-display text-2xl tabular-nums">{t.goldenOdds}</div>
                  <div className="label-caps text-ink-dim">golden odds</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <OddsNote floor={1.4} odds="1 in 9" />
        </div>
      </div>
    </section>
  );
}

function PullCards() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="text-center">
        <Eyebrow>What others unboxed</Eyebrow>
        <h2 className="mt-5">Pull cards, not a logo wall</h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PULL_CARDS.map((c, i) => (
          <motion.figure
            key={c.who}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-border p-8 velvet"
          >
            <span className="label-caps text-foil-gold">{c.tier}</span>
            <blockquote className="mt-4 font-display text-xl leading-snug">“{c.quote}”</blockquote>
            <figcaption className="mt-5 text-ink-dim">{c.who}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function TradeTease() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-border p-10 text-center velvet md:p-16">
        <SpotlightBg />
        <div className="relative">
          <Eyebrow>Close the loop</Eyebrow>
          <h2 className="mx-auto mt-5 max-w-2xl">A duplicate or a miss? Trade it. Regift it.</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-dim">
            List items for trade with other subscribers, or regift in one tap — re-routed, never reshipped to you.
            Boutique, not flea-market.
          </p>
          <Link to="/trade" className="mt-8 inline-flex items-center gap-2 rounded-full border border-foil-gold/60 px-7 py-3 font-medium transition-colors hover:bg-foil-gold/10">
            Enter the marketplace <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  return (
    <main>
      <Hero />
      <Stats />
      <RibbonDivider className="mx-auto max-w-6xl opacity-30" />
      <Craft />
      <Tiers />
      <PullCards />
      <TradeTease />
    </main>
  );
}
