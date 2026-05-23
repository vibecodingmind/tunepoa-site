import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "users";

    let csv = "";
    let filename = "";

    switch (type) {
      case "users": {
        const users = await db.user.findMany({
          select: { id: true, name: true, email: true, phone: true, company: true, role: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        csv = "ID,Name,Email,Phone,Company,Role,Status,Created\n";
        csv += users.map((u) =>
          `"${u.id}","${u.name}","${u.email}","${u.phone || ""}","${u.company || ""}","${u.role}","${u.status}","${u.createdAt.toISOString()}"`
        ).join("\n");
        filename = "users.csv";
        break;
      }

      case "subscriptions": {
        const subs = await db.subscription.findMany({
          include: { user: { select: { name: true, email: true } }, package: { select: { name: true, tier: true } } },
          orderBy: { createdAt: "desc" },
        });
        csv = "ID,User Name,User Email,Package,Tier,Billing Cycle,Status,Start Date,End Date,Created\n";
        csv += subs.map((s) =>
          `"${s.id}","${s.user.name}","${s.user.email}","${s.package.name}","${s.package.tier}","${s.billingCycle}","${s.status}","${s.startDate.toISOString()}","${s.endDate.toISOString()}","${s.createdAt.toISOString()}"`
        ).join("\n");
        filename = "subscriptions.csv";
        break;
      }

      case "payments": {
        const payments = await db.payment.findMany({
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        });
        csv = "ID,User Name,User Email,Amount,Currency,Billing Cycle,Status,Payment Method,Tracking ID,Paid At,Created\n";
        csv += payments.map((p) =>
          `"${p.id}","${p.user.name}","${p.user.email}","${p.amount}","${p.currency}","${p.billingCycle}","${p.status}","${p.paymentMethod || ""}","${p.pesapalTrackingId || ""}","${p.paidAt?.toISOString() || ""}","${p.createdAt.toISOString()}"`
        ).join("\n");
        filename = "payments.csv";
        break;
      }

      case "messages": {
        const messages = await db.contactMessage.findMany({
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        });
        csv = "ID,User Name,User Email,Subject,Status,Admin Reply,Created,Updated\n";
        csv += messages.map((m) =>
          `"${m.id}","${m.user.name}","${m.user.email}","${m.subject.replace(/"/g, '""')}","${m.status}","${(m.adminReply || "").replace(/"/g, '""')}","${m.createdAt.toISOString()}","${m.updatedAt.toISOString()}"`
        ).join("\n");
        filename = "messages.csv";
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid export type. Use: users, subscriptions, payments, messages" }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
