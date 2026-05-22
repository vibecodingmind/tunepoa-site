import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { name, phone, company } = body;

    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(name && { name }),
        ...(phone != null && { phone }),
        ...(company != null && { company }),
      },
      select: { id: true, email: true, name: true, phone: true, company: true, role: true, status: true, createdAt: true, updatedAt: true },
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
