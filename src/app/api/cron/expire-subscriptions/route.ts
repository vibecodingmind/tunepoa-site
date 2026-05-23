import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  // Authenticate with CRON_SECRET
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const summary = {
    expired: 0,
    reminder7Day: 0,
    reminder3Day: 0,
    reminder1Day: 0,
    errors: [] as string[],
  };

  try {
    // 1. Find and expire subscriptions where endDate < now AND status = "active"
    const expiredSubs = await db.subscription.findMany({
      where: {
        status: "active",
        endDate: { lt: now },
      },
      include: { user: true, package: true },
    });

    for (const sub of expiredSubs) {
      try {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "expired" },
        });

        await logAudit({
          action: "expired",
          entity: "subscription",
          entityId: sub.id,
          details: JSON.stringify({
            userId: sub.userId,
            packageId: sub.packageId,
            endDate: sub.endDate,
          }),
        });

        // Send notification to user
        try {
          const { createNotification } = await import("@/lib/notifications");
          await createNotification({
            userId: sub.userId,
            title: "Subscription Expired",
            message: `Your ${sub.package.name} subscription has expired. Renew now to restore your ringback tones.`,
            type: "error",
            category: "subscription",
            actionUrl: "/dashboard",
          });
        } catch (notifErr) {
          console.warn("[cron] Notification helper unavailable:", notifErr);
        }

        // Send email
        try {
          const { sendExpiryReminderEmail } = await import("@/lib/email");
          await sendExpiryReminderEmail({
            userEmail: sub.user.email,
            userName: sub.user.name,
            packageName: sub.package.name,
            endDate: sub.endDate.toISOString(),
            daysRemaining: 0,
          });
        } catch (emailErr) {
          console.warn("[cron] Email helper unavailable:", emailErr);
        }

        summary.expired++;
      } catch (err) {
        const errMsg = `Failed to expire subscription ${sub.id}: ${err}`;
        console.error(errMsg);
        summary.errors.push(errMsg);
      }
    }

    // Helper for reminder notifications
    async function sendReminder(sub: typeof expiredSubs[number], daysRemaining: number, urgency: string) {
      const type = daysRemaining <= 1 ? "error" : daysRemaining <= 3 ? "warning" : "info";
      try {
        const { createNotification } = await import("@/lib/notifications");
        await createNotification({
          userId: sub.userId,
          title: `${urgency}: Subscription Expiring in ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""}`,
          message: `Your ${sub.package.name} subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Renew now to keep your ringback tones active.`,
          type,
          category: "subscription",
          actionUrl: "/dashboard",
        });
      } catch (notifErr) {
        console.warn("[cron] Notification helper unavailable:", notifErr);
      }

      try {
        const { sendExpiryReminderEmail } = await import("@/lib/email");
        await sendExpiryReminderEmail({
          userEmail: sub.user.email,
          userName: sub.user.name,
          packageName: sub.package.name,
          endDate: sub.endDate.toISOString(),
          daysRemaining,
        });
      } catch (emailErr) {
        console.warn("[cron] Email helper unavailable:", emailErr);
      }
    }

    // 2. 7-day reminders
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sevenDayStart = new Date(sevenDaysFromNow.getTime() - 12 * 60 * 60 * 1000);
    const sevenDayEnd = new Date(sevenDaysFromNow.getTime() + 12 * 60 * 60 * 1000);

    const subs7Day = await db.subscription.findMany({
      where: { status: "active", endDate: { gte: sevenDayStart, lte: sevenDayEnd } },
      include: { user: true, package: true },
    });

    for (const sub of subs7Day) {
      try {
        await sendReminder(sub, 7, "REMINDER");
        await logAudit({
          action: "expiry_reminder_7d",
          entity: "subscription",
          entityId: sub.id,
          details: JSON.stringify({ userId: sub.userId, packageName: sub.package.name }),
        });
        summary.reminder7Day++;
      } catch (err) {
        summary.errors.push(`7-day reminder failed for ${sub.id}: ${err}`);
      }
    }

    // 3. 3-day reminders
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const threeDayStart = new Date(threeDaysFromNow.getTime() - 12 * 60 * 60 * 1000);
    const threeDayEnd = new Date(threeDaysFromNow.getTime() + 12 * 60 * 60 * 1000);

    const subs3Day = await db.subscription.findMany({
      where: { status: "active", endDate: { gte: threeDayStart, lte: threeDayEnd } },
      include: { user: true, package: true },
    });

    for (const sub of subs3Day) {
      try {
        await sendReminder(sub, 3, "URGENT");
        await logAudit({
          action: "expiry_reminder_3d",
          entity: "subscription",
          entityId: sub.id,
          details: JSON.stringify({ userId: sub.userId, packageName: sub.package.name }),
        });
        summary.reminder3Day++;
      } catch (err) {
        summary.errors.push(`3-day reminder failed for ${sub.id}: ${err}`);
      }
    }

    // 4. 1-day reminders
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const oneDayStart = new Date(oneDayFromNow.getTime() - 12 * 60 * 60 * 1000);
    const oneDayEnd = new Date(oneDayFromNow.getTime() + 12 * 60 * 60 * 1000);

    const subs1Day = await db.subscription.findMany({
      where: { status: "active", endDate: { gte: oneDayStart, lte: oneDayEnd } },
      include: { user: true, package: true },
    });

    for (const sub of subs1Day) {
      try {
        await sendReminder(sub, 1, "FINAL NOTICE");
        await logAudit({
          action: "expiry_reminder_1d",
          entity: "subscription",
          entityId: sub.id,
          details: JSON.stringify({ userId: sub.userId, packageName: sub.package.name }),
        });
        summary.reminder1Day++;
      } catch (err) {
        summary.errors.push(`1-day reminder failed for ${sub.id}: ${err}`);
      }
    }

    await logAudit({
      action: "cron_run",
      entity: "subscription",
      details: JSON.stringify(summary),
    });

    return NextResponse.json({
      success: true,
      message: "Subscription expiry processing complete",
      summary,
    });
  } catch (error) {
    console.error("[cron] Fatal error in expire-subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error", summary },
      { status: 500 }
    );
  }
}
