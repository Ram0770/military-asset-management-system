import defaultPrisma from "../config/prisma.js";

/**
 * Record an audit log entry.
 * Can accept a Prisma transaction client or default client.
 */
export async function createAuditLog({
  userId,
  action,
  details,
  entityRef = null,
  baseId = null,
  tx = defaultPrisma
}) {
  try {
    return await tx.auditLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        action,
        details,
        entityRef,
        baseId: baseId ? Number(baseId) : null
      }
    });
  } catch (error) {
    console.error("Failed to create audit log entry:", error);
    // Don't crash main operation if audit logging fails outside transaction
  }
}
