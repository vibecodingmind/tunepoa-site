import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; numberId: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { numberId } = await params;
    const body = await request.json();

    const existing = await db.assignedNumber.findUnique({ where: { id: numberId } });
    if (!existing) return NextResponse.json({ error: "Number not found" }, { status: 404 });

    const number = await db.assignedNumber.update({
      where: { id: numberId },
      data: {
        ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
        ...(body.toneName != null && { toneName: body.toneName }),
        ...(body.toneCategory != null && { toneCategory: body.toneCategory }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json({ number });
  } catch (error) {
    console.error("Update number error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; numberId: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { numberId } = await params;
    const existing = await db.assignedNumber.findUnique({ where: { id: numberId } });
    if (!existing) return NextResponse.json({ error: "Number not found" }, { status: 404 });

    await db.assignedNumber.delete({ where: { id: numberId } });
    return NextResponse.json({ message: "Number removed" });
  } catch (error) {
    console.error("Delete number error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
