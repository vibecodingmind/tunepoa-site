import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, company: true, role: true, status: true, createdAt: true, updatedAt: true,
        subscriptions: { include: { package: true, numbers: true }, orderBy: { createdAt: "desc" } } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = await db.user.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.phone != null && { phone: body.phone }),
        ...(body.company != null && { company: body.company }),
        ...(body.status && { status: body.status }),
        ...(body.role && { role: body.role }),
      },
      select: { id: true, email: true, name: true, phone: true, company: true, role: true, status: true, createdAt: true, updatedAt: true },
    });

    await logAudit({
      userId: session.userId,
      userName: session.email,
      action: "update",
      entity: "user",
      entityId: id,
      details: `Updated user ${existing.name}: ${JSON.stringify(body)}`,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
