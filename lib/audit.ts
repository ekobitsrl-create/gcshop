import { adminAuditLogs } from "@/db/schema";
import { getDb } from "@/db";
import type { AdminUser } from "@/lib/admin-auth";

export async function recordAdminAction(
  user: AdminUser,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: unknown,
) {
  await getDb().insert(adminAuditLogs).values({
    id: crypto.randomUUID(),
    actorUserId: user.userId,
    actorEmail: user.email,
    action,
    entityType,
    entityId: entityId ?? null,
    metadataJson: metadata === undefined ? null : JSON.stringify(metadata),
  });
}
