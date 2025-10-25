// Minimal Radio Browser client with mirror fallback and simple JSON fetch helper
// Docs: https://api.radio-browser.info

type Json = unknown;

// Prefer a few known mirrors; order loosely by reliability/geo spread.
const MIRRORS = [
  "https://de2.api.radio-browser.info",
  "https://fi1.api.radio-browser.info",
  "https://de1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://gb1.api.radio-browser.info",
  "https://us1.api.radio-browser.info",
] as const;

let cachedBase: string | null = null;

function isServer(): boolean {
  return typeof window === "undefined";
}

function withHeaders(init?: RequestInit): RequestInit {
  if (!isServer()) return init ?? {};
  // User-Agent cannot be set in the browser; only add on server-side fetch.
  const headers = new Headers(init?.headers);
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "radio-passport/1.0 (+cozy dev)");
  }
  return { ...init, headers };
}

async function tryFetchJson<T extends Json>(
  base: string,
  path: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(`${base}${path}`, withHeaders(init));
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Fetch JSON from Radio Browser mirrors with fallback and in-process base URL cache.
 * @param path Path beginning with '/' such as '/json/countries'
 */
export async function rbFetchJson<T extends Json>(
  path: string,
  init?: RequestInit
): Promise<T> {
  // Try cached mirror first for speed.
  if (cachedBase) {
    const hit = await tryFetchJson<T>(cachedBase, path, init);
    if (hit) return hit;
  }

  for (const base of MIRRORS) {
    if (base === cachedBase) continue; // already tried
    const data = await tryFetchJson<T>(base, path, init);
    if (data) {
      cachedBase = base;
      return data;
    }
  }

  // As a very last resort, try the generic domain (may be slower/less reliable).
  const fallback = await tryFetchJson<T>(
    "https://api.radio-browser.info",
    path,
    init
  );
  if (fallback) return fallback;

  throw new Error(`RadioBrowser fetch failed for path: ${path}`);
}
