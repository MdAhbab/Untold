import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../lib/store";
import { WaxSeal, RibbonDivider, FoilText } from "../visual/Atmosphere";
import { cn } from "../ui/utils";

const NAV = [
  { to: "/build", label: "Build" },
  { to: "/reveal", label: "Reveal" },
  { to: "/collection", label: "Collection" },
  { to: "/taste", label: "Taste" },
  { to: "/trade", label: "Trade" },
  { to: "/embed", label: "Module" },
];

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "boutique" : "theater"} mode`}
      className="group relative grid size-10 place-items-center rounded-full border border-border bg-bg-elev/60 backdrop-blur transition-colors hover:border-foil-gold/60"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35 }}
          className="text-foil-gold"
        >
          {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <WaxSeal size={34} />
          <span className="font-display text-xl tracking-tight">
            <FoilText>Untold</FoilText>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "label-caps text-ink-dim transition-colors hover:text-foreground",
                pathname === n.to && "text-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/build"
            className="hidden rounded-full foil-surface px-5 py-2.5 text-sm font-medium shadow-md transition-transform hover:scale-[1.03] sm:inline-block"
          >
            Build your box
          </Link>
          <button className="grid size-10 place-items-center rounded-full border border-border md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5">
        <RibbonDivider className="opacity-30" />
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-bg-elev/95 backdrop-blur md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 label-caps text-ink-dim hover:bg-accent hover:text-foreground">
                  {n.label}
                </Link>
              ))}
              <Link to="/build" onClick={() => setOpen(false)} className="mt-2 rounded-full foil-surface px-5 py-3 text-center font-medium">
                Build your box
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border velvet">
      <div className="pointer-events-none absolute inset-0 spotlight opacity-50" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <WaxSeal size={40} />
            <span className="font-display text-2xl"><FoilText>Untold</FoilText></span>
          </div>
          <p className="mt-4 max-w-xs text-ink-dim">
            You set the budget and the vibe. We keep the secret — until the moment you choose to open it.
          </p>
        </div>
        {[
          { h: "Experience", links: ["Build", "Reveal", "Collection", "Taste"] },
          { h: "Marketplace", links: ["Trade", "Regift", "Pull cards"] },
          { h: "For makers", links: ["Module", "Curation API", "Webhooks", "White-label"] },
        ].map((col) => (
          <div key={col.h}>
            <p className="label-caps text-foil-gold">{col.h}</p>
            <ul className="mt-4 space-y-2 text-ink-dim">
              {col.links.map((l) => (
                <li key={l} className="cursor-pointer transition-colors hover:text-foreground">{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-border px-5 py-6 text-sm text-ink-dim sm:flex-row">
        <span>© 2026 Untold. Tasteful surprise — odds & value floor always disclosed.</span>
        <span className="label-caps">Composes with DuskDrop</span>
      </div>
    </footer>
  );
}

/** Velvet-curtain wipe between routes. */
export function CurtainTransition({ id }: { id: string }) {
  const { reducedMotion } = useTheme();
  if (reducedMotion) return null;
  return (
    <motion.div
      key={id}
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      exit={{ scaleY: 0 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      style={{ transformOrigin: "top" }}
      className="pointer-events-none fixed inset-0 z-[60] origin-top"
    >
      <div className="size-full" style={{ background: "linear-gradient(180deg, #0b0a0f, #15121c)" }} />
      <div className="absolute inset-x-0 bottom-0 h-2 foil-surface" />
    </motion.div>
  );
}
