import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/messages - Get all contact messages (admin)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where = status ? { status } : {};

    const messages = await db.contactMessage.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, company: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
