import { db } from "@/lib/db";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  category?: "general" | "payment" | "subscription" | "system" | "support";
  actionUrl?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type = "info",
  category = "general",
  actionUrl,
}: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        category,
        actionUrl,
      },
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Create a notification for all admin users
 */
export async function createAdminNotification({
  title,
  message,
  type = "info",
  category = "system",
  actionUrl,
}: Omit<CreateNotificationParams, "userId">) {
  try {
    const admins = await db.user.findMany({
      where: { role: "admin", status: "active" },
      select: { id: true },
    });

    const notifications = await Promise.all(
      admins.map((admin) =>
        db.notification.create({
          data: {
            userId: admin.id,
            title,
            message,
            type,
            category,
            actionUrl,
          },
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error("Failed to create admin notification:", error);
    return null;
  }
}
