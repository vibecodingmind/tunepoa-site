import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { csv } = body;

    if (!csv || typeof csv !== "string") {
      return NextResponse.json({ error: "CSV data is required" }, { status: 400 });
    }

    const subscription = await db.subscription.findUnique({
      where: { id },
      include: { package: true, numbers: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    const header = lines[0].toLowerCase().trim();
    if (!header.includes("phonenumber")) {
      return NextResponse.json({ error: "CSV must have a 'phoneNumber' column" }, { status: 400 });
    }

    // Parse header to find column indices
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const phoneIdx = headers.indexOf("phonenumber");
    const toneNameIdx = headers.indexOf("tonename");
    const toneCatIdx = headers.indexOf("tonecategory");

    const activeNumbers = subscription.numbers.filter((n) => n.status === "active").length;
    const maxNumbers = subscription.package.maxPhoneNumbers;

    const created: { id: string; phoneNumber: string; toneName: string | null; toneCategory: string | null }[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const phoneNumber = cols[phoneIdx];

      if (!phoneNumber) {
        errors.push(`Row ${i + 1}: Missing phone number`);
        continue;
      }

      if (activeNumbers + created.length >= maxNumbers) {
        errors.push(`Row ${i + 1}: Maximum ${maxNumbers} numbers reached`);
        break;
      }

      try {
        const number = await db.assignedNumber.create({
          data: {
            subscriptionId: id,
            phoneNumber,
            toneName: toneNameIdx >= 0 ? cols[toneNameIdx] || null : null,
            toneCategory: toneCatIdx >= 0 ? cols[toneCatIdx] || null : null,
            status: "active",
          },
        });
        created.push({
          id: number.id,
          phoneNumber: number.phoneNumber,
          toneName: number.toneName,
          toneCategory: number.toneCategory,
        });
      } catch (err) {
        errors.push(`Row ${i + 1}: Failed to create number - ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    await logAudit({
      userId: session.userId,
      userName: session.email,
      action: "bulk_create",
      entity: "number",
      entityId: id,
      details: JSON.stringify({ created: created.length, errors: errors.length }),
    });

    return NextResponse.json({
      created: created.length,
      numbers: created,
      errors,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Bulk number upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
