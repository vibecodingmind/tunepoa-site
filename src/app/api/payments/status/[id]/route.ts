import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getTransactionStatus } from "@/lib/pesapal";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payment = await db.payment.findUnique({ where: { id } });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Try to get fresh status from PesaPal if still pending
    if (payment.status === "pending" && payment.pesapalTrackingId) {
      try {
        const status = await getTransactionStatus(payment.pesapalTrackingId);
        const pesapalStatus = status.payment_status?.toLowerCase();

        if (pesapalStatus === "completed") {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: "completed", paymentMethod: status.payment_method || null, paidAt: new Date() },
          });
          return NextResponse.json({ payment: { ...payment, status: "completed", paymentMethod: status.payment_method, paidAt: new Date().toISOString() } });
        } else if (pesapalStatus === "failed") {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: "failed", failureReason: status.message },
          });
          return NextResponse.json({ payment: { ...payment, status: "failed", failureReason: status.message } });
        }
      } catch {
        // Can't verify with PesaPal, return current status
      }
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Get payment status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
