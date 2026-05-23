import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const subscriptions = await db.subscription.findMany({
      include: { user: { select: { id: true, name: true, email: true, company: true } }, package: true, numbers: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, packageId, billingCycle, adminNotes } = body;

    if (!userId || !packageId || !billingCycle) {
      return NextResponse.json({ error: "User ID, Package ID, and billing cycle are required" }, { status: 400 });
    }

    if (!["3mo", "6mo", "12mo"].includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const pkg = await db.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    const startDate = new Date();
    const endDate = new Date(startDate);
    const months = billingCycle === "3mo" ? 3 : billingCycle === "6mo" ? 6 : 12;
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await db.subscription.create({
      data: { userId, packageId, billingCycle, status: "active", adminNotes: adminNotes || null, startDate, endDate },
      include: { user: { select: { id: true, name: true, email: true } }, package: true },
    });

    await logAudit({
      userId: session.userId,
      userName: session.email,
      action: "create",
      entity: "subscription",
      entityId: subscription.id,
      details: `Created subscription for ${user.name}: ${pkg.name} (${billingCycle})`,
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
