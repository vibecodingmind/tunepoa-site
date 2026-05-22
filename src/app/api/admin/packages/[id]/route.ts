import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.package.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    const pkg = await db.package.update({
      where: { id },
      data: {
        ...(body.category && { category: body.category }),
        ...(body.tier && { tier: body.tier }),
        ...(body.name && { name: body.name }),
        ...(body.maxPhoneNumbers != null && { maxPhoneNumbers: body.maxPhoneNumbers }),
        ...(body.features && { features: typeof body.features === "string" ? body.features : JSON.stringify(body.features) }),
        ...(body.price3mo != null && { price3mo: body.price3mo }),
        ...(body.price6mo != null && { price6mo: body.price6mo }),
        ...(body.price12mo != null && { price12mo: body.price12mo }),
        ...(body.popular != null && { popular: body.popular }),
      },
    });

    return NextResponse.json({ package: pkg });
  } catch (error) {
    console.error("Update package error:", error);
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
    const existing = await db.package.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    await db.package.delete({ where: { id } });
    return NextResponse.json({ message: "Package deleted" });
  } catch (error) {
    console.error("Delete package error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
