import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { SpotlightBg, DustMotes, Eyebrow } from "../components/visual/Atmosphere";
import { RevealBox } from "../components/RevealBox";
import { TagTile, OddsNote } from "../components/Pieces";
import { useApp } from "../lib/store";
import { TAG_GROUPS, NOGO_TAGS, CADENCES, TIERS, SPOILERS } from "../lib/data";
import { Slider } from "../components/ui/slider";

const STEPS = ["Vibe", "No-go", "Budget", "Cadence", "Tier", "Spoiler"] as const;

export function Builder() {
  const { draft, setDraft } = useApp();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const toggle = (key: "tags" | "nogo", v: string) => {
    const arr = draft[key];
    setDraft({ [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] } as never);
  };

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : navigate("/assembling"));
  const back = () => step > 0 && setStep(step - 1);
  const canProceed = step !== 0 || draft.tags.length > 0;

  return (
    <main className="relative min-h-screen overflow-hidden velvet pt-24">
      <SpotlightBg />
      <DustMotes count={16} />

      <div className="relative mx-auto max-w-3xl px-5 pb-32">
        {/* progress as stage marks */}
        <div className="mx-auto mb-12 flex max-w-md items-center justify-between">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i <= step && setStep(i)}
              className="flex flex-col items-center gap-2"
              disabled={i > step}
            >
              <span
                className={`grid size-8 place-items-center rounded-full border text-xs tabular-nums transition-colors ${
                  i === step
                    ? "foil-surface border-transparent"
                    : i < step
                    ? "border-foil-gold/60 text-foil-gold"
                    : "border-border text-ink-dim"
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden label-caps sm:block ${i === step ? "text-foreground" : "text-ink-dim"}`} style={{ fontSize: "0.55rem" }}>
                {s}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {step === 0 && (
              <Step eyebrow="Set the stage" title={<>What should this box <span className="italic">feel</span> like?</>} hint="Pick a few. We'll find the thread between them.">
                <div className="mt-8 space-y-6 text-left">
                  {TAG_GROUPS.map((g) => (
                    <div key={g.group}>
                      <p className="mb-3 label-caps text-foil-gold">{g.group}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {g.tags.map((t) => (
                          <TagTile key={t} label={t} active={draft.tags.includes(t)} onClick={() => toggle("tags", t)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step eyebrow="Hard lines" title={<>Anything we must <span className="italic">never</span> send?</>} hint="Allergies and dislikes are enforced strictly by the solver — never a maybe.">
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {NOGO_TAGS.map((t) => (
                    <TagTile key={t} label={t} tone="nogo" active={draft.nogo.includes(t)} onClick={() => toggle("nogo", t)} />
                  ))}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step eyebrow="The weight of it" title="How much should the box hold?" hint="Watch it fill as you raise the budget.">
                <div className="mt-10 flex flex-col items-center gap-8">
                  <div className="font-display text-6xl">
                    ${draft.budget}
                    <span className="ml-1 align-top label-caps text-ink-dim">/box</span>
                  </div>
                  <div className="relative h-40 w-32 overflow-hidden rounded-b-xl rounded-t-sm border border-border bg-bg-elev/50">
                    <motion.div
                      className="absolute inset-x-0 bottom-0 reveal-glow"
                      animate={{ height: `${((draft.budget - 25) / 175) * 100}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    />
                  </div>
                  <div className="w-full max-w-md">
                    <Slider min={25} max={200} step={5} value={[draft.budget]} onValueChange={([v]) => setDraft({ budget: v })} />
                    <div className="mt-2 flex justify-between label-caps text-ink-dim">
                      <span>$25</span>
                      <span>$200</span>
                    </div>
                  </div>
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step eyebrow="How often" title="One secret, or a season of them?" hint="">
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {CADENCES.map((c) => (
                    <SelectCard key={c.id} active={draft.cadence === c.id} onClick={() => setDraft({ cadence: c.id })} title={c.label} note={c.note} />
                  ))}
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step eyebrow="The vault" title="Choose your tier" hint="">
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {TIERS.map((t) => (
                    <SelectCard
                      key={t.id}
                      active={draft.tier === t.id}
                      onClick={() => setDraft({ tier: t.id })}
                      title={t.name}
                      note={t.blurb}
                      footer={`Floor +${Math.round((t.valueFloor - 1) * 100)}% · Golden ${t.goldenOdds}`}
                      gold={t.id === "legendary"}
                    />
                  ))}
                </div>
                <div className="mx-auto mt-8 max-w-xl">
                  <OddsNote floor={TIERS.find((t) => t.id === draft.tier)!.valueFloor} odds={TIERS.find((t) => t.id === draft.tier)!.goldenOdds} />
                </div>
              </Step>
            )}

            {step === 5 && <SpoilerStep />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* sticky controls */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elev/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-2 text-ink-dim transition-colors hover:text-foreground disabled:opacity-30">
            <ArrowLeft className="size-4" /> Back
          </button>
          <button
            onClick={next}
            disabled={!canProceed}
            className="inline-flex items-center gap-2 rounded-full foil-surface px-7 py-3 font-medium shadow-lg transition-transform hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
          >
            {step === STEPS.length - 1 ? "Assemble my box" : "Continue"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

function Step({ eyebrow, title, hint, children }: { eyebrow: string; title: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mx-auto mt-5 max-w-2xl text-balance">{title}</h2>
      {hint && <p className="mx-auto mt-3 max-w-lg text-ink-dim">{hint}</p>}
      {children}
    </>
  );
}

function SelectCard({ active, onClick, title, note, footer, gold }: { active: boolean; onClick: () => void; title: string; note: string; footer?: string; gold?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-6 text-left transition-all ${
        active ? (gold ? "border-foil-gold/70 glow-violet" : "border-foil-gold/70 shadow-[0_0_30px_-12px_var(--foil-gold)]") : "border-border hover:border-foreground/30"
      } bg-bg-elev/60`}
    >
      <h4 className="font-display text-lg">{title}</h4>
      <p className="mt-2 text-sm text-ink-dim">{note}</p>
      {footer && <p className="mt-4 label-caps text-foil-gold" style={{ fontSize: "0.6rem" }}>{footer}</p>}
    </button>
  );
}

function SpoilerStep() {
  const { draft, setDraft } = useApp();
  const preview = useMotionValue(0);

  useEffect(() => {
    const target = draft.spoiler === "sealed" ? 0.12 : draft.spoiler === "teased" ? 0.55 : 1;
    const controls = animate(preview, target, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [draft.spoiler, preview]);

  return (
    <>
      <Eyebrow>How much to know</Eyebrow>
      <h2 className="mx-auto mt-5 max-w-2xl">Set the spoiler level</h2>
      <p className="mx-auto mt-3 max-w-lg text-ink-dim">The reveal adapts. Watch the preview change.</p>

      <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
        <div className="grid place-items-center">
          <RevealBox progress={preview} spoiler={draft.spoiler} size={150} />
        </div>
        <div className="space-y-3 text-left">
          {SPOILERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setDraft({ spoiler: s.id })}
              className={`w-full rounded-2xl border p-5 text-left transition-all ${
                draft.spoiler === s.id ? "border-foil-gold/70 shadow-[0_0_30px_-14px_var(--foil-gold)]" : "border-border hover:border-foreground/30"
              } bg-bg-elev/60`}
            >
              <h4 className="font-display text-lg">{s.name}</h4>
              <p className="mt-1 text-sm text-ink-dim">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
