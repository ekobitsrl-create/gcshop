import { NextResponse } from "next/server";
import { getComparisonProducts } from "@/lib/comparison-catalog";
import { parseComparisonIds } from "@/lib/product-comparison";
import { getRequestLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  let ids: string[];
  try {
    if (params.getAll("ids").length > 1) throw new Error();
    ids = parseComparisonIds(params.get("ids") ?? "");
  } catch {
    return NextResponse.json({ error: "compare.invalid" }, { status: 400, headers });
  }
  try {
    return NextResponse.json({ products: await getComparisonProducts(ids, await getRequestLocale()) }, { headers });
  } catch {
    return NextResponse.json({ error: "compare.loadError" }, { status: 503, headers });
  }
}
