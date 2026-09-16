import { parseSubscription, subscribe } from "@/lib/newsletter";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "INVALID_ORIGIN" }, { status: 403, headers });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "INVALID_REQUEST" }, { status: 415, headers });
  let input: ReturnType<typeof parseSubscription>;
  try {
    const raw = await request.text();
    if (raw.length > 2048) return Response.json({ error: "INVALID_REQUEST" }, { status: 413, headers });
    input = parseSubscription(JSON.parse(raw));
  } catch { return Response.json({ error: "INVALID_SUBSCRIPTION" }, { status: 400, headers }); }
  try {
    await subscribe(input);
    return Response.json({ subscribed: true }, { headers });
  } catch {
    console.error("Newsletter subscription could not be stored");
    return Response.json({ error: "UNAVAILABLE" }, { status: 503, headers });
  }
}
