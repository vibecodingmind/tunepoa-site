import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/migrate - Create database tables if they don't exist
 * Called with a MIGRATE_SECRET to authenticate
 * This uses Prisma's raw SQL to create tables that may not exist yet
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const migrateSecret = process.env.MIGRATE_SECRET || process.env.CRON_SECRET;

  if (!migrateSecret || secret !== migrateSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Test database connection by checking if tables exist
    // Try to query the User table - if it fails, tables don't exist
    try {
      await db.user.findFirst();
      results.push("✓ User table exists");
    } catch {
      results.push("✗ User table missing - need to push schema");
    }

    try {
      await db.notification.findFirst();
      results.push("✓ Notification table exists");
    } catch {
      results.push("✗ Notification table missing - creating...");
      try {
        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Notification" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "type" TEXT NOT NULL DEFAULT 'info',
            "category" TEXT NOT NULL DEFAULT 'general',
            "isRead" BOOLEAN NOT NULL DEFAULT false,
            "actionUrl" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
          );
        `);
        await db.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
        `);
        await db.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
        `);
        await db.$executeRawUnsafe(`
          ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        results.push("✓ Notification table created");
      } catch (e: unknown) {
        results.push(`✗ Failed to create Notification: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    try {
      await db.auditLog.findFirst();
      results.push("✓ AuditLog table exists");
    } catch {
      results.push("✗ AuditLog table missing - creating...");
      try {
        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "AuditLog" (
            "id" TEXT NOT NULL,
            "userId" TEXT,
            "userName" TEXT,
            "action" TEXT NOT NULL,
            "entity" TEXT NOT NULL,
            "entityId" TEXT,
            "details" TEXT,
            "ipAddress" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
          );
        `);
        results.push("✓ AuditLog table created");
      } catch (e: unknown) {
        results.push(`✗ Failed to create AuditLog: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    try {
      await db.setting.findFirst();
      results.push("✓ Setting table exists");
    } catch {
      results.push("✗ Setting table missing - creating...");
      try {
        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Setting" (
            "id" TEXT NOT NULL,
            "key" TEXT NOT NULL,
            "value" TEXT NOT NULL,
            "label" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
          );
        `);
        await db.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key");
        `);
        await db.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "Setting_key_idx" ON "Setting"("key");
        `);
        results.push("✓ Setting table created");
      } catch (e: unknown) {
        results.push(`✗ Failed to create Setting: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Check User table has all new columns
    try {
      const userCheck = await db.$queryRawUnsafe(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name IN ('locale', 'resetToken', 'resetTokenExpiry')
        ORDER BY column_name;
      `) as { column_name: string }[];
      const columns = userCheck.map((r: { column_name: string }) => r.column_name);

      if (!columns.includes("locale")) {
        await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';`);
        results.push("✓ Added locale column to User");
      } else {
        results.push("✓ User.locale exists");
      }

      if (!columns.includes("resetToken")) {
        await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;`);
        results.push("✓ Added resetToken column to User");
      } else {
        results.push("✓ User.resetToken exists");
      }

      if (!columns.includes("resetTokenExpiry")) {
        await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);`);
        results.push("✓ Added resetTokenExpiry column to User");
      } else {
        results.push("✓ User.resetTokenExpiry exists");
      }
    } catch (e: unknown) {
      results.push(`✗ User column check failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[migrate] Error:", error);
    return NextResponse.json({ error: "Migration failed", results }, { status: 500 });
  }
}
