import { cookies } from "next/headers";
import { getCartSnapshot } from "@/lib/cart";
import { CartError, mutateCart, parseCartMutation } from "@/lib/cart-mutations";
import { getRequestLocale } from "@/lib/i18n-server";
import { translate } from "@/lib/i18n";

const COOKIE = "lcs_cart";
const headers = { "Cache-Control": "private, no-store" };
export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value;
  return Response.json(await getCartSnapshot(token, await getRequestLocale()), { headers });
}

async function update(request: Request, action: "add" | "set" | "remove") {
  const locale = await getRequestLocale();
  try {
    const mutation = parseCartMutation(action, await request.json());
    const cookieStore = await cookies();
    const previousToken = cookieStore.get(COOKIE)?.value;
    const result = await mutateCart(previousToken, mutation, locale);
    if (result.token !== previousToken) cookieStore.set(COOKIE, result.token, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
    return Response.json(result.cart, { headers });
  } catch (error) {
    if (error instanceof CartError) return Response.json({ error: translate(locale, error.code, { count: error.limit ?? 0 }), code: error.code, limit: error.limit }, { status: error.status, headers });
    if (error instanceof SyntaxError) return Response.json({ error: translate(locale, "cart.invalidRequest") }, { status: 400, headers });
    console.error("Cart update failed", { action, type: error instanceof Error ? error.name : "UnknownError" });
    return Response.json({ error: translate(locale, "purchase.cartError") }, { status: 500, headers });
  }
}

export async function POST(request: Request) { return update(request, "add"); }
export async function PATCH(request: Request) { return update(request, "set"); }
export async function DELETE(request: Request) { return update(request, "remove"); }
