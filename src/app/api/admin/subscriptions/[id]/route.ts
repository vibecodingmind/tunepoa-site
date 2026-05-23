import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, company: true } },
        package: true,
        numbers: { orderBy: { assignedAt: "desc" } },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.subscription.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    const subscription = await db.subscription.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.adminNotes != null && { adminNotes: body.adminNotes }),
        ...(body.billingCycle && { billingCycle: body.billingCycle }),
      },
      include: { user: { select: { id: true, name: true, email: true } }, package: true, numbers: true },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const existing = await db.subscription.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    await db.assignedNumber.deleteMany({ where: { subscriptionId: id } });
    await db.subscription.delete({ where: { id } });

    return NextResponse.json({ message: "Subscription deleted" });
  } catch (error) {
    console.error("Delete subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
