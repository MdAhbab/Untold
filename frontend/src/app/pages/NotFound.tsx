import { Link } from "react-router";
import { motion } from "motion/react";
import { DustMotes, Eyebrow, WaxSeal } from "../components/visual/Atmosphere";

export function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden velvet">
      <DustMotes count={20} />
      {/* searching spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[140%] w-[50%] -translate-x-1/2 opacity-40 blur-2xl"
        style={{ background: "conic-gradient(from 180deg at 50% 0%, transparent 80%, rgba(255,244,214,0.18) 87%, transparent 94%)" }}
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 px-5 text-center">
        <Eyebrow>Nothing on this pedestal</Eyebrow>
        <h1 className="mt-6 font-display text-7xl">404</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-dim">
          The spotlight's searching, but this box was never wrapped. Let's get you back to something secret.
        </p>
        <div className="my-10 flex justify-center opacity-50">
          <div className="grid size-32 place-items-center rounded-full border border-dashed border-border">
            <WaxSeal size={56} label="?" />
          </div>
        </div>
        <Link to="/" className="inline-flex rounded-full foil-surface px-7 py-3 font-medium shadow-lg transition-transform hover:scale-[1.03]">
          Back to the stage
        </Link>
      </div>
    </main>
  );
}
