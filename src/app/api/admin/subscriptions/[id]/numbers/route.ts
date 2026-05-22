import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { phoneNumber, toneName, toneCategory } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const subscription = await db.subscription.findUnique({ where: { id }, include: { package: true, numbers: true } });
    if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    // Check max phone numbers limit
    const activeNumbers = subscription.numbers.filter(n => n.status === "active").length;
    if (activeNumbers >= subscription.package.maxPhoneNumbers) {
      return NextResponse.json({ error: `Maximum ${subscription.package.maxPhoneNumbers} phone numbers reached for this package` }, { status: 400 });
    }

    const number = await db.assignedNumber.create({
      data: {
        subscriptionId: id,
        phoneNumber,
        toneName: toneName || null,
        toneCategory: toneCategory || null,
        status: "active",
      },
    });

    return NextResponse.json({ number }, { status: 201 });
  } catch (error) {
    console.error("Assign number error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
