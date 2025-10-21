Love this idea. Let’s build a tiny **“Radio Passport”**—a playful, free, locally-runnable Remix app that explores world stations without the globe. Think country “passport stamps” you click to open stations, with a cozy in-browser player.

Below you’ll find:

1. a couple fun exploration UI concepts,
2. a ready-to-run Remix starter (code included), and
3. next steps + free APIs.

---

## Pick a fun explorer (no globe!)

- **Passport Stamps (default below):** Grid of flag-emoji “stamps.” Click a stamp → see popular stations for that country; play instantly.
- **Airport Departures Board:** Flip-clock board: “Country — City — Station — Now Playing.” Feels like catching flights.
- **Time-Band Carousel:** Scroll around a 24-hour ring (time zones). Each zone shows what’s “live & lively” right now.

We’ll ship “Passport Stamps” first (fastest to test locally).

---

## Free data + player

- **Radio Browser API (free, community-run):** search/filter by country, language, tags; returns logo, stream URL, etc. ([Radio Browser API][1])
- **Remix (free):** modern React full-stack framework; `npx create-remix@latest`. ([Remix][2])

---

## Quick start (local)

```bash
# 1) create app
npx create-remix@latest radio-passport
cd radio-passport
npm i

# 2) add Tailwind
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3) run dev
npm run dev
```

### Tailwind config

**tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

**app/tailwind.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: light dark;
  }
}
```

### Wire styles into Remix

**app/root.tsx**

```tsx
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html lang="en" className="min-h-full">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

---

## “Radio Passport” route

This single route fetches **countries** and (optionally) **stations for a selected country** from Radio Browser. Click a flag “stamp,” see stations, click to play.

**app/routes/\_index.tsx**

```tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

/**
 * Radio Browser base. Use a specific mirror for speed; you can rotate later.
 * Docs: https://api.radio-browser.info / https://docs.radio-browser.info/
 * Example mirrors: fi1.api.radio-browser.info, de2.api.radio-browser.info
 */
const RB = "https://de2.api.radio-browser.info";

type Country = { name: string; iso_3166_1: string; stationcount: number };
type Station = {
  uuid: string;
  name: string;
  url: string;
  favicon: string;
  country: string;
  state: string | null;
  language: string | null;
  tags: string | null;
  bitrate: number;
  codec: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country"); // country name (not ISO code) per RB /bycountry

  // countries
  const countriesRes = await fetch(`${RB}/json/countries`, {
    headers: { "User-Agent": "radio-passport/0.1 (+local dev)" },
  });
  const countries: Country[] = await countriesRes.json();

  let stations: Station[] = [];
  if (country) {
    const sRes = await fetch(
      `${RB}/json/stations/bycountry/${encodeURIComponent(
        country
      )}?limit=80&hidebroken=true&order=clickcount&reverse=true`,
      { headers: { "User-Agent": "radio-passport/0.1 (+local dev)" } }
    );
    stations = await sRes.json();
  }

  return json({ countries, stations, selectedCountry: country });
}

function flagEmoji(iso2?: string) {
  // turn "US" into 🇺🇸 using regional indicators; fallback 🌐
  if (!iso2 || iso2.length !== 2) return "🌐";
  const base = 0x1f1e6;
  const A = "A".charCodeAt(0);
  const chars = iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(base + (c.charCodeAt(0) - A)));
  return chars.join("");
}

export default function Index() {
  const { countries, stations, selectedCountry } =
    useLoaderData<typeof loader>();
  const [sp] = useSearchParams();
  const submit = useSubmit();
  const [nowPlaying, setNowPlaying] = useState<Station | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // preselect top countries by stationcount
  const topCountries = [...countries]
    .sort((a, b) => b.stationcount - a.stationcount)
    .slice(0, 60);

  useEffect(() => {
    // autoplay next selected
    if (nowPlaying && audioRef.current) {
      audioRef.current.src = nowPlaying.url;
      audioRef.current.play().catch(() => {
        /* ignore */
      });
    }
  }, [nowPlaying]);

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">
          🎟️ Radio Passport
        </h1>
        <Form method="get" onChange={(e) => submit(e.currentTarget)}>
          <input
            name="q"
            placeholder="Search countries…"
            className="rounded-xl bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-neutral-700"
            defaultValue={sp.get("q") ?? ""}
          />
        </Form>
      </header>

      {/* Passport Stamps */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Choose a stamp</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {topCountries
            .filter((c) => {
              const q = sp.get("q")?.toLowerCase() ?? "";
              return q ? c.name.toLowerCase().includes(q) : true;
            })
            .map((c) => (
              <a
                key={c.name}
                href={`/?country=${encodeURIComponent(c.name)}`}
                className={`group rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-4 hover:border-neutral-600 hover:bg-neutral-800 transition ${
                  selectedCountry === c.name
                    ? "outline outline-2 outline-emerald-500"
                    : ""
                }`}
              >
                <div className="text-3xl">{flagEmoji(c.iso_3166_1)}</div>
                <div className="mt-2 text-sm font-medium line-clamp-1">
                  {c.name}
                </div>
                <div className="text-xs text-neutral-400">
                  {c.stationcount.toLocaleString()} stations
                </div>
              </a>
            ))}
        </div>
      </section>

      {/* Stations for selected country */}
      {selectedCountry && (
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-medium">
              {flagEmoji(
                countries.find((c) => c.name === selectedCountry)?.iso_3166_1
              )}{" "}
              {selectedCountry}
            </h2>
            <button
              onClick={() => setNowPlaying(null)}
              className="text-sm text-neutral-300 hover:text-white underline underline-offset-4"
            >
              Stop
            </button>
          </div>

          {stations.length === 0 ? (
            <p className="text-neutral-400">No stations found.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stations.map((s) => (
                <li
                  key={s.uuid}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3 hover:border-neutral-600 hover:bg-neutral-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.favicon || "https://placehold.co/48x48/png"}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover bg-neutral-800"
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).style.display =
                          "none")
                      }
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-xs text-neutral-400 truncate">
                        {s.language || "—"} • {s.codec || "stream"} •{" "}
                        {s.bitrate ? `${s.bitrate}kbps` : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="rounded-xl bg-emerald-600/90 px-3 py-2 text-sm hover:bg-emerald-500"
                      onClick={() => setNowPlaying(s)}
                    >
                      ▶ Play
                    </button>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl px-3 py-2 text-sm ring-1 ring-neutral-700 hover:bg-neutral-800"
                    >
                      Open stream
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Player */}
      <footer className="sticky bottom-3 mt-10">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 p-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-neutral-400">Now Playing</div>
              <div className="truncate font-medium">
                {nowPlaying ? nowPlaying.name : "—"}
              </div>
            </div>
            <audio ref={audioRef} controls className="w-full max-w-md" />
          </div>
        </div>
      </footer>
    </main>
  );
}
```

> Notes
> • Radio Browser offers multiple mirrors; you can rotate or DNS-discover them later for resiliency. ([Radio Browser API][1])
> • The `/json/countries` and `/json/stations/bycountry/{name}` endpoints are public and free. ([Radio API Documentation][3])

---

## Try it

1. `npm run dev`
2. Open `http://localhost:5173` (or whatever Remix prints).
3. Click a stamp → pick a station → **Play**.

---

## Where to take it next (still free)

- **Add “Airport Board” mode:** Same data; different UI skin (flip-clock CSS + grouping by city).
- **Favorites (local):** Save to `localStorage`; add a “⭐ Favorites” tab.
- **Better station quality:** Sort by `clickcount`/`bitrate`; hide `broken=true`. (The sample already sets `hidebroken=true`.) ([Radio API Documentation][3])
- **Mirror rotation:** Pull `/json/servers` (or follow docs) and auto-switch on errors. ([Radio Browser API][1])
- **Deploy later (still free tiers):** Netlify or Fly.io guides exist if/when you want to push. ([Netlify Docs][4])

---

## Why Remix? (and alternates)

- **Remix** gives you loaders to stream data from Radio Browser straight into React components—great DX. ([Remix][5])
- If you’d rather: **SvelteKit** (lean UI), **Next.js App Router** (React but different data flows), or **Astro (+React)** also work. We can port this starter to any of them later.

If you want, I can flip this into the **Airport Departures Board** or **Time-Band Carousel** version next. Which vibe do you want?

[1]: https://api.radio-browser.info/?utm_source=chatgpt.com "API.radio-browser.info docs"
[2]: https://remix.run/docs?utm_source=chatgpt.com "Remix Docs Home"
[3]: https://docs.radio-browser.info/?utm_source=chatgpt.com "API Reference: Introduction - Radio Browser"
[4]: https://docs.netlify.com/build/frameworks/framework-setup-guides/remix/?utm_source=chatgpt.com "Remix on Netlify"
[5]: https://remix.run/?utm_source=chatgpt.com "Remix - Build Better Websites"
