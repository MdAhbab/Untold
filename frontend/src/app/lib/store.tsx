import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AssembledBox, InitialData, Rarity, SpoilerLevel } from "./data";
import { fetchInitialData } from "./api";
import { updateData } from "./data";
import FALLBACK_DATA from "./fallback-data";

/* ---------------- Responsive helper ---------------- */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const fn = () => setMatches(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return matches;
}
export const useIsMobile = () => useMediaQuery("(max-width: 640px)");

/* ---------------- Theme ---------------- */
type Theme = "dark" | "light";
interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  reducedMotion: boolean;
}
const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggle: () => {}, reducedMotion: false });
export const useTheme = () => useContext(ThemeContext);

/* ---------------- Box builder draft ---------------- */
export interface BoxDraft {
  tags: string[];
  nogo: string[];
  budget: number;
  cadence: string;
  tier: Rarity;
  spoiler: SpoilerLevel;
}
const defaultDraft: BoxDraft = {
  tags: [],
  nogo: [],
  budget: 75,
  cadence: "monthly",
  tier: "rare",
  spoiler: "teased",
};

interface AppCtx extends ThemeCtx {
  draft: BoxDraft;
  setDraft: (d: Partial<BoxDraft>) => void;
  /** The box assembled by the curation engine, carried Builder → Reveal. */
  box: AssembledBox | null;
  setBox: (b: AssembledBox | null) => void;
}
const AppContext = createContext<AppCtx | null>(null);
export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp outside provider");
  return c;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [draft, setDraftState] = useState<BoxDraft>(defaultDraft);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [box, setBox] = useState<AssembledBox | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const setDraft = (d: Partial<BoxDraft>) => setDraftState((p) => ({ ...p, ...d }));

  return (
    <AppContext.Provider value={{ theme, toggle, reducedMotion, draft, setDraft, box, setBox }}>
      <ThemeContext.Provider value={{ theme, toggle, reducedMotion }}>{children}</ThemeContext.Provider>
    </AppContext.Provider>
  );
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchInitialData()
      .then((data) => {
        updateData(data);
        setReady(true);
      })
      .catch((err) => {
        // No backend (e.g. the public Vercel demo): fall back to a baked-in
        // snapshot of /api/data so the experience still renders with real data.
        console.warn("Backend unavailable — using offline demo data.", err);
        updateData(FALLBACK_DATA as InitialData);
        setReady(true);
      });
  }, []);

  if (!ready) return <div className="p-4 text-center">Loading core systems...</div>;

  return <>{children}</>;
}
