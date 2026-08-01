import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/admin";
  const next = requestedNext.startsWith("/admin") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/admin";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return Response.redirect(new URL(next, url.origin));
  }

  return Response.redirect(new URL("/accesso-admin?errore=link", url.origin));
}
