import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [totalUsers, activeUsers, totalSubscriptions, activeSubscriptions, totalNumbers, activeNumbers, totalPackages] = await Promise.all([
      db.user.count({ where: { role: "user" } }),
      db.user.count({ where: { role: "user", status: "active" } }),
      db.subscription.count(),
      db.subscription.count({ where: { status: "active" } }),
      db.assignedNumber.count(),
      db.assignedNumber.count({ where: { status: "active" } }),
      db.package.count(),
    ]);

    // Calculate revenue from active subscriptions
    const activeSubs = await db.subscription.findMany({
      where: { status: "active" },
      include: { package: true },
    });

    let totalRevenue = 0;
    for (const sub of activeSubs) {
      const price = sub.billingCycle === "3mo" ? sub.package.price3mo : sub.billingCycle === "6mo" ? sub.package.price6mo : sub.package.price12mo;
      totalRevenue += price;
    }

    return NextResponse.json({
      stats: {
        totalUsers, activeUsers, suspendedUsers: totalUsers - activeUsers,
        totalSubscriptions, activeSubscriptions,
        totalNumbers, activeNumbers,
        totalPackages, totalRevenue,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
