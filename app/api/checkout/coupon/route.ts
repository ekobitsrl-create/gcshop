import { cookies } from "next/headers";
import { getCartSnapshot } from "@/lib/cart";
import { evaluateCoupon } from "@/lib/coupons";

type CouponBody = { code?: string; email?: string };

export async function POST(request: Request) {
  try {
    const body = await request.json() as CouponBody;
    const token = (await cookies()).get("lcs_cart")?.value;
    const cart = await getCartSnapshot(token);
    if (!cart.items.length) return Response.json({ error: "La borsa è vuota." }, { status: 400 });

    const result = await evaluateCoupon({
      code: body.code ?? "",
      email: body.email,
      subtotalCents: cart.subtotalCents,
    });
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Il codice non può essere verificato in questo momento." }, { status: 503 });
  }
}
