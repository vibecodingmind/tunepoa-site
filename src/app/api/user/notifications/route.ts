import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/user/notifications - Get user's notifications (paginated, newest first, with unread count)
 */
export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notification.count({ where: { userId: session.userId } }),
      db.notification.count({ where: { userId: session.userId, isRead: false } }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/user/notifications - Mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ markedRead: result.count });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
