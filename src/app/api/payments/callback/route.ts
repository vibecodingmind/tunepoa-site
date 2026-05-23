import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTransactionStatus } from "@/lib/pesapal";
import { logAudit } from "@/lib/audit";
import {
  sendSubscriptionConfirmationEmail,
  sendPaymentReceiptEmail,
} from "@/lib/email";

/**
 * GET /api/payments/callback - PesaPal return URL after payment
 * Also handles mock payments in development mode
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get("paymentId");
    const orderTrackingId = url.searchParams.get("OrderTrackingId");
    const orderNotificationType = url.searchParams.get("OrderNotificationType");

    if (!paymentId) {
      return NextResponse.redirect(new URL("/dashboard?payment=error", request.url));
    }

    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return NextResponse.redirect(new URL("/dashboard?payment=error", request.url));
    }

    // Try to get real status from PesaPal
    if (orderTrackingId && !orderTrackingId.startsWith("MOCK-")) {
      try {
        const status = await getTransactionStatus(orderTrackingId);
        const pesapalStatus = status.payment_status?.toLowerCase();

        if (pesapalStatus === "completed") {
          await completePayment(payment.id, orderTrackingId, status.payment_method);
        } else if (pesapalStatus === "failed") {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: "failed", failureReason: status.message, paidAt: new Date() },
          });
        }
      } catch (err) {
        console.warn("Could not verify PesaPal status:", err);
      }
    } else if (orderTrackingId?.startsWith("MOCK-") && orderNotificationType === "COMPLETED") {
      // Mock payment completion for development
      await completePayment(payment.id, orderTrackingId, "mock");
    }

    return NextResponse.redirect(new URL("/dashboard?payment=success", request.url));
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?payment=error", request.url));
  }
}

async function completePayment(paymentId: string, trackingId: string, paymentMethod: string | undefined) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { package: true, user: true },
  });
  if (!payment || payment.status === "completed") return;

  await db.payment.update({
    where: { id: paymentId },
    data: {
      status: "completed",
      pesapalTrackingId: trackingId,
      paymentMethod: paymentMethod || null,
      paidAt: new Date(),
    },
  });

  let subscriptionId: string | null = null;

  // If no subscription linked yet, auto-create one
  if (!payment.subscriptionId) {
    const startDate = new Date();
    const endDate = new Date(startDate);
    const months = payment.billingCycle === "3mo" ? 3 : payment.billingCycle === "6mo" ? 6 : 12;
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await db.subscription.create({
      data: {
        userId: payment.userId,
        packageId: payment.packageId,
        billingCycle: payment.billingCycle,
        status: "active",
        startDate,
        endDate,
      },
    });

    // Link payment to subscription
    await db.payment.update({
      where: { id: paymentId },
      data: { subscriptionId: subscription.id },
    });

    subscriptionId = subscription.id;

    await logAudit({
      userId: payment.userId,
      action: "create",
      entity: "subscription",
      entityId: subscription.id,
      details: `Auto-created from payment ${paymentId}`,
    });
  } else {
    subscriptionId = payment.subscriptionId;
    // Extend existing subscription (renewal)
    const sub = await db.subscription.findUnique({ where: { id: payment.subscriptionId } });
    if (sub) {
      const months = payment.billingCycle === "3mo" ? 3 : payment.billingCycle === "6mo" ? 6 : 12;
      const currentEnd = new Date(sub.endDate);
      const newEnd = currentEnd > new Date() ? new Date(currentEnd) : new Date();
      newEnd.setMonth(newEnd.getMonth() + months);

      await db.subscription.update({
        where: { id: sub.id },
        data: { endDate: newEnd, status: "active" },
      });

      await logAudit({
        userId: payment.userId,
        action: "update",
        entity: "subscription",
        entityId: sub.id,
        details: `Renewed via payment ${paymentId}`,
      });
    }
  }

  await logAudit({
    userId: payment.userId,
    action: "payment",
    entity: "payment",
    entityId: paymentId,
    details: `Payment completed: ${payment.amount} TZS`,
  });

  // ─── Send emails (non-blocking) ───
  const cycleLabel =
    payment.billingCycle === "3mo" ? "3 Months" :
    payment.billingCycle === "6mo" ? "6 Months" : "12 Months";

  // Fetch subscription for dates
  if (subscriptionId) {
    const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
    if (sub) {
      sendSubscriptionConfirmationEmail(
        payment.user.email,
        payment.user.name,
        payment.package.name,
        payment.billingCycle,
        payment.amount,
        sub.startDate.toISOString(),
        sub.endDate.toISOString()
      ).catch((err) => console.error("Failed to send subscription confirmation email:", err));
    }
  }

  sendPaymentReceiptEmail(
    payment.user.email,
    payment.user.name,
    payment.package.name,
    payment.amount,
    payment.billingCycle,
    paymentMethod || null,
    trackingId
  ).catch((err) => console.error("Failed to send payment receipt email:", err));
}
