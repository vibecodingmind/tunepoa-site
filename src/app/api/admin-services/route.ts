import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const services = await db.adminService.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ services });
  } catch (error) {
    console.error("Get admin services error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
