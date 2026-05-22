import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const packages = await db.package.findMany({
      orderBy: [{ category: "asc" }, { tier: "asc" }],
    });
    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Get packages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { category, tier, name, maxPhoneNumbers, features, price3mo, price6mo, price12mo, popular } = body;

    if (!category || !tier || !name || !maxPhoneNumbers || !features || price3mo == null || price6mo == null || price12mo == null) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const pkg = await db.package.create({
      data: {
        category, tier, name, maxPhoneNumbers,
        features: typeof features === "string" ? features : JSON.stringify(features),
        price3mo, price6mo, price12mo, popular: popular || false,
      },
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    console.error("Create package error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
