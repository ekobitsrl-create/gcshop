import { isAdminEmail } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; returnTo?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!isAdminEmail(email)) {
    return Response.json({ error: "Account non autorizzato." }, { status: 403 });
  }

  const returnTo = body.returnTo?.startsWith("/admin") && !body.returnTo.startsWith("//")
    ? body.returnTo
    : "/admin";
  const callback = new URL("/auth/callback", request.url);
  callback.searchParams.set("next", returnTo);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: callback.toString(),
    },
  });
  if (error) {
    return Response.json({ error: "Impossibile inviare il link di accesso. Riprova tra poco." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
