import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { SpotlightBg, DustMotes, WaxSeal, FoilText } from "../components/visual/Atmosphere";
import { useApp } from "../lib/store";

const LINES = [
  "Reading your taste constellation…",
  "Searching live inventory for the thread…",
  "Solving budget, variety & no-repeats…",
  "Balancing the cellar — scarce & overstock…",
  "Tying the ribbon. Pressing the seal.",
];

export function Assembling() {
  const navigate = useNavigate();
  const { draft } = useApp();
  const [line, setLine] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), 1100);
    const go = setTimeout(() => navigate("/reveal"), 5800);
    return () => {
      clearInterval(t);
      clearTimeout(go);
    };
  }, [navigate]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden velvet">
      <SpotlightBg />
      <DustMotes count={30} />

      <div className="relative z-10 flex flex-col items-center px-5 text-center">
        {/* wrapping box — ribbon ties itself */}
        <motion.div
          className="relative grid size-44 place-items-center rounded-2xl border border-border bg-bg-elev/60"
          animate={{ rotate: [0, -1.5, 1.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 reveal-glow opacity-40 blur-xl" />
          <motion.div
            className="absolute left-1/2 top-0 h-full -translate-x-1/2 foil-surface"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: 22, transformOrigin: "top" }}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-full -translate-y-1/2 foil-surface"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ height: 22, transformOrigin: "left" }}
          />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }}>
            <WaxSeal size={52} />
          </motion.div>
        </motion.div>

        <p className="mt-12 label-caps text-foil-gold">Curating your {draft.tier} box</p>
        <h2 className="mt-3 font-display">
          We're keeping the <FoilText>secret</FoilText>…
        </h2>

        <div className="mt-6 h-6 overflow-hidden">
          <motion.p key={line} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-ink-dim">
            {LINES[line]}
          </motion.p>
        </div>

        <div className="mt-8 h-1 w-64 overflow-hidden rounded-full bg-border">
          <motion.div className="h-full foil-surface" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 5.8, ease: "linear" }} />
        </div>

        <button onClick={() => navigate("/reveal")} className="mt-8 label-caps text-ink-dim underline-offset-4 transition-colors hover:text-foreground hover:underline">
          Skip to the reveal →
        </button>
      </div>
    </main>
  );
}
