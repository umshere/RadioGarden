import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { MantineProvider, createTheme } from "@mantine/core";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap",
  },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "manifest", href: "/manifest.json" },
];

const theme = createTheme({
  colors: {
    night: [
      '#f2f6fb',
      '#dbe5f5',
      '#b6c7e3',
      '#8ca5ca',
      '#617fae',
      '#456292',
      '#30476c',
      '#243456',
      '#17223b',
      '#0b1524',
    ],
    sand: [
      '#fff8eb',
      '#f7e9c6',
      '#e9cf8a',
      '#d9b766',
      '#c79e49',
      '#ab8136',
      '#8c6628',
      '#6c4c1c',
      '#523914',
      '#37260d',
    ],
  },
  primaryColor: 'sand',
  defaultRadius: 'lg',
  fontFamily:
    '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily:
      '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontWeight: '600',
  },
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.16)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.2)',
  },
});

export default function App() {
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
        style={{ background: 'linear-gradient(180deg, #050b19 0%, #0b1325 35%, #111d31 100%)' }}
      >
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Outlet />
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
