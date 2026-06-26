import { useState } from "react";
import { motion } from "motion/react";
import { Repeat, Gift, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { SpotlightBg, Eyebrow, WaxSeal } from "../components/visual/Atmosphere";
import { RarityBadge } from "../components/visual/Bits";
import { TRADES } from "../lib/data";

export function Trade() {
  const [tab, setTab] = useState<"browse" | "regift">("browse");

  return (
    <main className="relative pt-28">
      <Toaster position="bottom-center" />
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <Eyebrow>The marketplace</Eyebrow>
          <h1 className="mt-5">Trade & <span className="italic">regift</span></h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-dim">
            A duplicate or a miss closes the loop here — matched on want-tags, never reshipped to you.
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-fit gap-1 rounded-full border border-border bg-bg-elev/60 p-1">
          {(["browse", "regift"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-6 py-2 label-caps transition-colors ${tab === t ? "foil-surface" : "text-ink-dim hover:text-foreground"}`}
            >
              {t === "browse" ? "Browse trades" : "Regift"}
            </button>
          ))}
        </div>

        {tab === "browse" ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRADES.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-bg-elev/60 p-6"
              >
                <SpotlightBg className="opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex justify-between">
                    <span className="label-caps text-ink-dim">@{t.from_user}</span>
                    <RarityBadge rarity={t.rarity} />
                  </div>
                  <div className="my-5 grid aspect-square place-items-center rounded-xl" style={{ background: "linear-gradient(160deg, var(--accent), transparent)" }}>
                    <WaxSeal size={48} label={t.item[0]} />
                  </div>
                  <h4 className="font-display">{t.item}</h4>
                  <p className="mt-2 text-sm text-ink-dim">Wants: {t.wants.join(", ")}</p>
                  <button
                    onClick={() => toast.success(`Trade offer sent to @${t.from_user}`, { description: t.item })}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-foil-gold/50 px-5 py-2.5 text-sm transition-colors hover:bg-foil-gold/10"
                  >
                    <Repeat className="size-3.5" /> Offer a trade
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-lg rounded-3xl border border-border bg-bg-elev/60 p-8 text-center">
            <Gift className="mx-auto size-8 text-foil-gold" />
            <h3 className="mt-5 font-display text-2xl">Regift in one tap</h3>
            <p className="mt-3 text-ink-dim">
              Choose an item and a friend's handle. We re-route it from the warehouse — it never bounces back to you,
              so nothing's wasted.
            </p>
            <input
              placeholder="Friend's @handle or email"
              className="mt-6 w-full rounded-full border border-border bg-input-background px-5 py-3 outline-none focus:border-foil-gold/60"
            />
            <button
              onClick={() => toast.success("Regift queued", { description: "We'll route it from the warehouse." })}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full foil-surface px-7 py-3 font-medium"
            >
              Send the gift <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
