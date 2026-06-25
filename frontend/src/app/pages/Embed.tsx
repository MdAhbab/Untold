import { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Webhook, Code2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { SpotlightBg, Eyebrow, WaxSeal } from "../components/visual/Atmosphere";
import { Slider } from "../components/ui/slider";

const PRESETS = [
  { name: "Untold", accent: "#7c4dff", paper: "#15121c", ink: "#f2eaf2", radius: 16 },
  { name: "DuskDrop", accent: "#e0795a", paper: "#1a1410", ink: "#f6ece0", radius: 8 },
  { name: "Boutique", accent: "#8e2440", paper: "#fbf6ee", ink: "#1a1210", radius: 24 },
];

const WEBHOOKS = ["box.assembled", "box.shipped", "box.opened", "item.rated"];

export function Embed() {
  const [accent, setAccent] = useState("#7c4dff");
  const [paper, setPaper] = useState("#15121c");
  const [ink, setInk] = useState("#f2eaf2");
  const [radius, setRadius] = useState(16);
  const [copied, setCopied] = useState(false);

  const snippet = `<div data-untold="builder"
     data-tier="rare"
     data-accent="${accent}"
     data-radius="${radius}px"></div>
<script src="https://cdn.untold.box/widget.js" async></script>`;

  const copy = () => {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    toast.success("Snippet copied");
    setTimeout(() => setCopied(false), 1600);
  };

  const apply = (p: (typeof PRESETS)[number]) => {
    setAccent(p.accent); setPaper(p.paper); setInk(p.ink); setRadius(p.radius);
  };

  return (
    <main className="relative pt-28">
      <Toaster position="bottom-center" />
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <Eyebrow>Drop-in module</Eyebrow>
          <h1 className="mt-5">Your store. <span className="italic">Our</span> reveal.</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-dim">
            Add a "build a mystery box" checkout + reveal to any storefront. Themeable via CSS vars, white-labeled,
            and built to compose with DuskDrop's Surprise Surplus Bags.
          </p>
        </div>

        {/* playground */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-border bg-bg-elev/60 p-7">
            <p className="label-caps text-foil-gold">Theme-token playground</p>
            <div className="mt-5 flex gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => apply(p)} className="rounded-full border border-border px-4 py-1.5 text-sm text-ink-dim transition-colors hover:text-foreground">
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-5">
              {[
                { label: "Accent", value: accent, set: setAccent },
                { label: "Paper", value: paper, set: setPaper },
                { label: "Ink", value: ink, set: setInk },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between">
                  <span className="text-ink-dim">{c.label}</span>
                  <label className="flex items-center gap-3">
                    <span className="font-mono text-sm tabular-nums text-ink-dim">{c.value}</span>
                    <input type="color" value={c.value} onChange={(e) => c.set(e.target.value)} className="size-8 cursor-pointer rounded-md border border-border bg-transparent" />
                  </label>
                </div>
              ))}
              <div>
                <div className="flex justify-between text-ink-dim"><span>Corner radius</span><span className="tabular-nums">{radius}px</span></div>
                <div className="mt-2"><Slider min={0} max={28} value={[radius]} onValueChange={([v]) => setRadius(v)} /></div>
              </div>
            </div>
          </div>

          {/* live widget preview */}
          <div className="relative grid place-items-center overflow-hidden rounded-3xl border border-border velvet p-8">
            <SpotlightBg />
            <motion.div
              layout
              className="relative w-full max-w-sm p-7 shadow-2xl"
              style={{ background: paper, color: ink, borderRadius: radius, border: `1px solid ${accent}40` }}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
                <WaxSeal size={26} /> Mystery box
              </div>
              <p className="mt-4 text-2xl" style={{ fontFamily: "var(--font-display)" }}>Build a box</p>
              <p className="mt-2 text-sm opacity-70">Pick a vibe and a budget — we keep the secret.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Coffee", "Zines", "Spicy", "Candles"].map((t) => (
                  <span key={t} className="px-3 py-1.5 text-sm" style={{ borderRadius: radius, border: `1px solid ${ink}22` }}>{t}</span>
                ))}
              </div>
              <button className="mt-6 w-full py-3 font-medium" style={{ background: accent, color: paper, borderRadius: radius }}>
                Assemble my box
              </button>
            </motion.div>
          </div>
        </div>

        {/* snippet */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-bg-elev/80">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="flex items-center gap-2 label-caps text-ink-dim"><Code2 className="size-4" /> Embed snippet</span>
            <button onClick={copy} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-foil-gold/60">
              {copied ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-ink-dim"><code>{snippet}</code></pre>
        </div>

        {/* api + webhooks */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-bg-elev/60 p-7">
            <h3 className="font-display">Curation API</h3>
            <div className="mt-4 space-y-2 font-mono text-sm">
              {["POST /api/boxes/assemble", "GET  /api/boxes/{id}/reveal", "POST /api/ratings", "GET  /api/taste/me"].map((e) => (
                <div key={e} className="rounded-lg border border-border px-3 py-2 text-ink-dim">{e}</div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-bg-elev/60 p-7">
            <div className="flex items-center gap-2"><Webhook className="size-5 text-foil-gold" /><h3 className="font-display">Webhooks</h3></div>
            <div className="mt-4 flex flex-wrap gap-2">
              {WEBHOOKS.map((w) => (
                <span key={w} className="rounded-full border border-border px-3 py-1.5 font-mono text-sm text-ink-dim">{w}</span>
              ))}
            </div>
            <button onClick={() => toast.success("Test event sent", { description: "box.opened → your endpoint" })} className="mt-5 rounded-full foil-surface px-5 py-2.5 text-sm font-medium">
              Send a test event
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
