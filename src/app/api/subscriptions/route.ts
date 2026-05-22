import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await db.subscription.findMany({
      where: { userId },
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { packageId, billingCycle } = body;

    if (!packageId || !billingCycle) {
      return NextResponse.json(
        { error: "Package ID and billing cycle are required" },
        { status: 400 }
      );
    }

    if (!["3mo", "6mo", "12mo"].includes(billingCycle)) {
      return NextResponse.json(
        { error: "Invalid billing cycle. Must be 3mo, 6mo, or 12mo" },
        { status: 400 }
      );
    }

    const pkg = await db.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    // Calculate end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date(startDate);
    const months = billingCycle === "3mo" ? 3 : billingCycle === "6mo" ? 6 : 12;
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await db.subscription.create({
      data: {
        userId,
        packageId,
        billingCycle,
        status: "active",
        phoneNumbers: "[]",
        startDate,
        endDate,
      },
      include: { package: true },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
