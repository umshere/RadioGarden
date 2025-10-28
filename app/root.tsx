import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { MantineProvider, createTheme } from "@mantine/core";
import { useEffect, useRef } from "react";
import { usePlayerStore } from "~/state/playerStore";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Poppins:wght@500;600;700&display=swap",
  },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "alternate icon", type: "image/png", href: "/icon.png" },
  { rel: "manifest", href: "/manifest.json" },
];

const ocean = [
  "#e1f0ff",
  "#c3dcf3",
  "#9cc1e5",
  "#74a5d6",
  "#4d8ac7",
  "#296faf",
  "#15598f",
  "#0a4875",
  "#04345b",
  "#013a63",
] as const;

const passport = [
  "#fffaf4",
  "#fdf2e6",
  "#f9e6d2",
  "#f3d7b9",
  "#edc8a0",
  "#d8b084",
  "#ba9063",
  "#987249",
  "#755532",
  "#4a3721",
] as const;

const stamp = [
  "#ffe7eb",
  "#ffcdd5",
  "#fda3b5",
  "#fa7a95",
  "#f55478",
  "#e63a60",
  "#d1495b",
  "#a93250",
  "#7d2340",
  "#4f162a",
] as const;

const horizon = [
  "#e7f6f9",
  "#d1eef2",
  "#a9dee4",
  "#80cdd5",
  "#57bcc7",
  "#3ca0ac",
  "#2c7f8a",
  "#21626b",
  "#16444c",
  "#0b262d",
] as const;

const theme = createTheme({
  colors: {
    ocean,
    passport,
    stamp,
    horizon,
  },
  primaryColor: "ocean",
  primaryShade: 8,
  defaultRadius: "xl",
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily:
      '"Playfair Display", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontWeight: "600",
  },
  shadows: {
    xs: "0 1px 3px rgba(0, 0, 0, 0.05)",
    sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
    md: "0 4px 16px rgba(0, 0, 0, 0.12)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.2)",
    xl: "0 20px 60px rgba(1, 26, 55, 0.55)",
  },
  defaultGradient: {
    from: "#013a63",
    to: "#0a4875",
    deg: 135,
  },
});

export default function App() {
  const previousTitleRef = useRef("Radio Passport");

  useEffect(() => {
    if (typeof document === "undefined") return;

    const DEFAULT_TITLE = "Radio Passport";
    const AWAY_TITLE = "🌐 Radio Passport — Still Traveling…";
    const establishTitle = document.title || DEFAULT_TITLE;
    previousTitleRef.current = establishTitle;

    if (!document.title) {
      document.title = establishTitle;
    }

    const handleVisibility = () => {
      if (document.hidden) {
        previousTitleRef.current = document.title || DEFAULT_TITLE;
        document.title = AWAY_TITLE;
      } else {
        document.title = previousTitleRef.current || DEFAULT_TITLE;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.title = previousTitleRef.current || DEFAULT_TITLE;
    };
  }, []);

  return (
    <html lang="en" className="min-h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="description" content="Radio Passport: Explore the world's radio stations with an elegant, minimal interface" />
        <Meta />
        <Links />
      </head>
      <body
        className="min-h-screen text-slate-100"
        style={{
          background: "radial-gradient(140% 120% at 10% 10%, rgba(93, 158, 173, 0.08) 0%, transparent 55%), radial-gradient(120% 120% at 85% 5%, rgba(209, 73, 91, 0.08) 0%, transparent 60%), linear-gradient(180deg, #020d1d 0%, #031c34 45%, #011527 100%)",
        }}
      >
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <>
            <Outlet />
            <GlobalAudioBridge />
          </>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function GlobalAudioBridge() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const setAudioElement = usePlayerStore((state) => state.setAudioElement);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setAudioLevel = usePlayerStore((state) => state.setAudioLevel);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const nowPlaying = usePlayerStore((state) => state.nowPlaying);

  useEffect(() => {
    const element = audioRef.current;
    if (element) {
      element.autoplay = false;
      element.preload = "none";
      element.crossOrigin = "anonymous";
    }
    setAudioElement(element ?? null);

    return () => {
      setAudioElement(null);
    };
  }, [setAudioElement]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
    };
  }, [setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!nowPlaying) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }

    const streamUrl = nowPlaying.streamUrl ?? nowPlaying.url ?? "";
    if (!streamUrl) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }

    const absoluteStreamUrl = new URL(streamUrl, window.location.origin).href;
    if (audio.src !== absoluteStreamUrl) {
      audio.src = absoluteStreamUrl;
    }
  }, [nowPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!nowPlaying) {
      audio.pause();
      return;
    }

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, nowPlaying, setIsPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setAudioLevel(0);
      return;
    }

    let frame = 0;

    const animate = () => {
      setAudioLevel(Math.random() * 0.6 + 0.2);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isPlaying, setAudioLevel]);

  return <audio ref={audioRef} className="hidden" />;
}
