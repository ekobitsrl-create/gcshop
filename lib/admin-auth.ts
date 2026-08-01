import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";
import { getRuntimeEnv } from "@/lib/runtime-env";

function configuredAdminEmails(): string[] {
  const value = getRuntimeEnv().ADMIN_EMAILS ?? "info@ekobit.it";
  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return configuredAdminEmails().includes(email.trim().toLowerCase());
}

export async function requireAdminPage(returnTo: string): Promise<ChatGPTUser> {
  return requireChatGPTUser(returnTo);
}

export async function getAdminApiUser(): Promise<
  | { user: ChatGPTUser; error: null }
  | { user: null; error: Response }
> {
  const user = await getChatGPTUser();
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
