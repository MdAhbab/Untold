// Untold API client. Base URL is configurable via VITE_API_BASE so the same
// build can point at a local FastAPI server or a deployed one.
import type { AssembledBox, InitialData, RevealConfig } from "./data";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, "") ||
  "http://127.0.0.1:8000/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json())?.detail ?? detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export interface PreferencePayload {
  include_tags: string[];
  exclude_tags: string[];
  budget: number;
  cadence: string;
  tier: string;
  spoiler: string;
}

export const fetchInitialData = () => http<InitialData>("/data");

export const postPreferences = (payload: PreferencePayload) =>
  http<{ id: string }>("/preferences", { method: "POST", body: JSON.stringify(payload) });

export const assembleBox = (body: { preference_id?: string } & Partial<PreferencePayload>) =>
  http<AssembledBox>("/boxes/assemble", { method: "POST", body: JSON.stringify(body) });

export const getReveal = (boxId: string) => http<RevealConfig>(`/boxes/${boxId}/reveal`);

export const orderBox = (boxId: string) =>
  http<{ status: string }>(`/boxes/${boxId}/order`, { method: "POST" });

export const postRating = (r: { item_id: string; kept: boolean; score?: number; box_id?: string }) =>
  http<{ status: string }>("/ratings", { method: "POST", body: JSON.stringify(r) });

export const updateTaste = () =>
  http<{ updated: number; nodes: { tag: string; weight: number }[] }>(
    "/agents/taste-update",
    { method: "POST", body: "{}" },
  );

export const getTrades = () =>
  http<{ trades: InitialData["trades"] }>("/trades");

export const postTrade = (body: { item: string; want_tags: string[]; rarity?: string }) =>
  http<{ status: string; id: string }>("/trades", { method: "POST", body: JSON.stringify(body) });
