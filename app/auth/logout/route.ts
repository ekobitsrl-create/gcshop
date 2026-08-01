import { createSupabaseServerClient, hasSupabaseAuthConfig } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedReturnTo = url.searchParams.get("return_to") ?? "/";
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/";
  if (hasSupabaseAuthConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  return Response.redirect(new URL(returnTo, url.origin));
}
