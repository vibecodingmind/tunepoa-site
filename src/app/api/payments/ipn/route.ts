import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTransactionStatus } from "@/lib/pesapal";
import { logAudit } from "@/lib/audit";

/**
 * POST /api/payments/ipn - PesaPal IPN webhook
 * PesaPal calls this endpoint to notify about payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { OrderTrackingId, OrderNotificationType } = body;

    if (!OrderTrackingId) {
      return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 });
    }

    // Find payment by tracking ID
    const payment = await db.payment.findFirst({
      where: { pesapalTrackingId: OrderTrackingId },
    });

    if (!payment) {
      console.warn("IPN: Payment not found for tracking ID:", OrderTrackingId);
      return NextResponse.json({ status: "not_found" });
    }

    // Already processed
    if (payment.status === "completed") {
      return NextResponse.json({ status: "already_processed" });
    }

    // Verify with PesaPal
    try {
      const status = await getTransactionStatus(OrderTrackingId);
      const pesapalStatus = status.payment_status?.toLowerCase();

      if (pesapalStatus === "completed") {
        // Update payment
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: "completed",
            paymentMethod: status.payment_method || null,
            paidAt: new Date(),
          },
        });

        // Auto-create subscription if not linked
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

          await db.payment.update({
            where: { id: payment.id },
            data: { subscriptionId: subscription.id },
          });

          await logAudit({
            userId: payment.userId,
            action: "create",
            entity: "subscription",
            entityId: subscription.id,
            details: `Auto-created from IPN for payment ${payment.id}`,
          });
        } else {
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
              details: `Renewed via IPN for payment ${payment.id}`,
            });
          }
        }

        await logAudit({
          userId: payment.userId,
          action: "payment",
          entity: "payment",
          entityId: payment.id,
          details: `Payment completed via IPN: ${payment.amount} TZS`,
        });
      } else if (pesapalStatus === "failed") {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "failed", failureReason: status.message },
        });
      }
    } catch (verifyErr) {
      console.error("IPN: Failed to verify with PesaPal:", verifyErr);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("IPN error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/payments/ipn - PesaPal IPN verification
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const orderTrackingId = url.searchParams.get("OrderTrackingId");
  const orderNotificationType = url.searchParams.get("OrderNotificationType");

  if (!orderTrackingId) {
    return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 });
  }

  // Process same as POST
  return POST(new NextRequest(request.url, { method: "POST", body: JSON.stringify({ OrderTrackingId: orderTrackingId, OrderNotificationType: orderNotificationType }) }));
}
