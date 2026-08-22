import { redirect } from "next/navigation";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { createSupabaseServerClient, hasSupabaseAuthConfig } from "@/lib/supabase/server";

export type AdminUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

function configuredAdminEmails(): string[] {
  const value = getRuntimeEnv().ADMIN_EMAILS ?? "";
  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return configuredAdminEmails().includes(email.trim().toLowerCase());
}

async function getSupabaseAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;

  const fullName = typeof data.user.user_metadata?.full_name === "string"
    ? data.user.user_metadata.full_name
    : null;
  return {
    userId: data.user.id,
    email: data.user.email,
    fullName,
    displayName: fullName ?? data.user.email,
  };
}

async function getAuthenticatedAdminUser(): Promise<AdminUser | null> {
  if (hasSupabaseAuthConfig()) return getSupabaseAdminUser();
  return getChatGPTUser();
}

function safeAdminReturnPath(value: string): string {
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function requireAdminPage(returnTo: string): Promise<AdminUser> {
  const user = await getAuthenticatedAdminUser();
  if (user) return user;
  redirect(`/accesso-admin?return_to=${encodeURIComponent(safeAdminReturnPath(returnTo))}`);
}

export async function getAdminApiUser(): Promise<
  | { user: AdminUser; error: null }
  | { user: null; error: Response }
> {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    return {
      user: null,
      error: Response.json({ error: "Autenticazione richiesta." }, { status: 401 }),
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      user: null,
      error: Response.json({ error: "Account non autorizzato." }, { status: 403 }),
    };
  }

  return { user, error: null };
}
