import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/migrate - Push Prisma schema to database
 * Called with a CRON_SECRET or MIGRATE_SECRET to authenticate
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const migrateSecret = process.env.MIGRATE_SECRET || process.env.CRON_SECRET;

  if (!migrateSecret || secret !== migrateSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { execSync } = await import("child_process");
    const output = execSync("npx prisma db push --accept-data-loss 2>&1", {
      cwd: process.cwd(),
      env: { ...process.env },
      timeout: 60000,
    });
    const log = output.toString();
    console.log("[migrate] Prisma db push output:", log);
    return NextResponse.json({ success: true, log: log.slice(-500) });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[migrate] Prisma db push failed:", msg);
    return NextResponse.json({ error: "Migration failed", details: msg.slice(-500) }, { status: 500 });
  }
}
