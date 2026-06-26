import { CreditCard, MapPin, Bell } from "lucide-react";
import { Eyebrow, RibbonDivider } from "../components/visual/Atmosphere";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { useApp } from "../lib/store";
import { CADENCES, TIERS, SPOILERS } from "../lib/data";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-5">
      <span className="text-ink-dim">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Pills<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${value === o.id ? "border-foil-gold/70 bg-foil-gold/10 text-foreground" : "border-border text-ink-dim hover:text-foreground"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Account() {
  const { draft, setDraft } = useApp();

  return (
    <main className="relative pt-28">
      <div className="mx-auto max-w-3xl px-5">
        <div className="text-center">
          <Eyebrow>Backstage</Eyebrow>
          <h1 className="mt-5">Your subscription</h1>
        </div>

        <section className="mt-14 rounded-3xl border border-border bg-bg-elev/60 p-7">
          <h3 className="font-display">The box, by default</h3>
          <div className="divide-y divide-border">
            <Row label="Cadence">
              <Pills options={CADENCES.map((c) => ({ id: c.id, label: c.label }))} value={draft.cadence} onChange={(v) => setDraft({ cadence: v })} />
            </Row>
            <Row label="Tier">
              <Pills options={TIERS.map((t) => ({ id: t.id, label: t.name }))} value={draft.tier} onChange={(v) => setDraft({ tier: v as never })} />
            </Row>
            <Row label="Spoiler default">
              <Pills options={SPOILERS.map((s) => ({ id: s.id, label: s.name }))} value={draft.spoiler} onChange={(v) => setDraft({ spoiler: v as never })} />
            </Row>
            <Row label={`Budget per box — $${draft.budget}`}>
              <div className="w-48"><Slider min={25} max={200} step={5} value={[draft.budget]} onValueChange={([v]) => setDraft({ budget: v })} /></div>
            </Row>
          </div>
        </section>

        <RibbonDivider className="my-10 opacity-30" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-bg-elev/60 p-7">
            <MapPin className="size-5 text-foil-gold" />
            <h3 className="mt-4 font-display">Shipping</h3>
            <p className="mt-2 text-sm text-ink-dim">14 Lamplighter Row<br />Old Town · Lisbon 1100</p>
            <button className="mt-4 text-sm text-violet underline-offset-4 hover:underline">Edit address</button>
          </div>
          <div className="rounded-3xl border border-border bg-bg-elev/60 p-7">
            <CreditCard className="size-5 text-foil-gold" />
            <h3 className="mt-4 font-display">Billing</h3>
            <p className="mt-2 text-sm text-ink-dim tabular-nums">•••• •••• •••• 4291 · mock</p>
            <button className="mt-4 text-sm text-violet underline-offset-4 hover:underline">Update payment</button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-bg-elev/60 p-7">
          <div className="flex items-center gap-2"><Bell className="size-5 text-foil-gold" /><h3 className="font-display">Notifications</h3></div>
          <div className="divide-y divide-border">
            {["Box shipped", "Reveal is ready", "A trade match for your wants", "Golden-pull moments"].map((n, i) => (
              <Row key={n} label={n}><Switch defaultChecked={i < 3} /></Row>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
