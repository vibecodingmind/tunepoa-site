import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const numbers = await db.assignedNumber.findMany({
      where: { subscription: { userId: session.userId } },
      include: { subscription: { include: { package: { select: { name: true, category: true, tier: true } } } } },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({ numbers });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get numbers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
