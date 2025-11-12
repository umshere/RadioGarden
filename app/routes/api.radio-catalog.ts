import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { fetchRadioBrowserCatalogSnapshot } from "~/services/radioBrowser/catalogSnapshot";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("stations");
  const force = url.searchParams.get("refresh") === "true";
  const stationLimit = limitParam ? Math.max(100, Number(limitParam)) : undefined;

  const snapshot = await fetchRadioBrowserCatalogSnapshot({
    stationLimit,
    forceRefresh: force,
  });

  return json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export const action = loader;
