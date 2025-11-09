import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const scene = url.searchParams.get("scene");

  if (scene) {
    return redirect(`/world/${scene}`);
  }

  return redirect("/world/cards");
}
