import { db } from "@/lib/db";

export async function logAudit({
  userId,
  userName,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: {
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await db.auditLog.create({
      data: { userId, userName, action, entity, entityId, details, ipAddress },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}
