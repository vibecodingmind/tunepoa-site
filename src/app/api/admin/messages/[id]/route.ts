import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// PATCH /api/admin/messages/[id] - Update message status or add admin reply
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminReply } = body;

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (adminReply !== undefined) updateData.adminReply = adminReply;

    const updated = await db.contactMessage.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: session.userId,
      userName: session.email,
      action: "update",
      entity: "message",
      entityId: id,
      details: `Updated message: status=${status || existing.status}, reply=${adminReply !== undefined ? 'added' : 'unchanged'}`,
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error("Failed to update message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
