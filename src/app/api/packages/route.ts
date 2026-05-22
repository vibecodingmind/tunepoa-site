import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
