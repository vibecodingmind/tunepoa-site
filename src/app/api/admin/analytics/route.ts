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
    // Monthly revenue for last 6 months (from completed payments)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const completedPayments = await db.payment.findMany({
      where: {
        status: "completed",
        paidAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: "asc" },
    });

    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const monthPayments = completedPayments.filter((p) => {
        const paidAt = new Date(p.paidAt!);
        return paidAt >= monthDate && paidAt <= monthEnd;
      });

      monthlyRevenue.push({
        month: label,
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      });
    }

    // Subscription growth by month
    const allSubscriptions = await db.subscription.findMany({
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    const subscriptionGrowth: { month: string; total: number; active: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const monthSubs = allSubscriptions.filter((s) => {
        const created = new Date(s.createdAt);
        return created >= monthDate && created <= monthEnd;
      });

      const activeSubs = allSubscriptions.filter((s) => {
        const created = new Date(s.createdAt);
        return created <= monthEnd && s.status === "active";
      });

      subscriptionGrowth.push({
        month: label,
        total: monthSubs.length,
        active: activeSubs.length,
      });
    }

    // Subscription status distribution
    const statusCounts = await db.subscription.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const subscriptionStatus = statusCounts.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    // Package popularity
    const packages = await db.package.findMany({
      select: {
        id: true,
        name: true,
        tier: true,
        _count: { select: { subscriptions: true } },
      },
      orderBy: { subscriptions: { _count: "desc" } },
    });

    const packagePopularity = packages.map((p) => ({
      name: p.name,
      tier: p.tier,
      subscriptions: p._count.subscriptions,
    }));

    // Payment method distribution
    const methodCounts = await db.payment.groupBy({
      by: ["paymentMethod"],
      _count: { paymentMethod: true },
      where: { status: "completed", paymentMethod: { not: null } },
    });

    const paymentMethodDistribution = methodCounts.map((m) => ({
      method: m.paymentMethod || "unknown",
      count: m._count.paymentMethod,
    }));

    return NextResponse.json({
      monthlyRevenue,
      subscriptionGrowth,
      subscriptionStatus,
      packagePopularity,
      paymentMethodDistribution,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
