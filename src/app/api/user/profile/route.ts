import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, company, locale } = body;

    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(name && { name }),
        ...(phone != null && { phone }),
        ...(company != null && { company }),
        ...(locale && { locale }),
      },
      select: { id: true, email: true, name: true, phone: true, company: true, role: true, status: true, locale: true, createdAt: true, updatedAt: true },
    });

    await logAudit({
      userId: session.userId,
      userName: session.email,
      action: "update",
      entity: "user",
      entityId: session.userId,
      details: "Profile updated",
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
