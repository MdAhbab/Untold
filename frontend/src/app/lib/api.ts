const API_BASE = "http://127.0.0.1:8000/api";

export async function fetchInitialData() {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) throw new Error("Failed to fetch initial data from backend");
  return await res.json();
}

export async function postPreferences(payload: any) {
  const res = await fetch(`${API_BASE}/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}
