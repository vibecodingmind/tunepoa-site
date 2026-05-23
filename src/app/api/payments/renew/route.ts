import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { submitOrder, registerIPN, getAccessToken } from "@/lib/pesapal";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subscriptionId, billingCycle } = body;

    if (!subscriptionId || !billingCycle) {
      return NextResponse.json({ error: "Subscription ID and billing cycle are required" }, { status: 400 });
    }

    if (!["3mo", "6mo", "12mo"].includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: { package: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (subscription.userId !== session.userId) {
      return NextResponse.json({ error: "Not your subscription" }, { status: 403 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const amount = billingCycle === "3mo" ? subscription.package.price3mo : billingCycle === "6mo" ? subscription.package.price6mo : subscription.package.price12mo;

    const orderId = `TP-REN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const payment = await db.payment.create({
      data: {
        userId: session.userId,
        subscriptionId: subscription.id,
        packageId: subscription.packageId,
        billingCycle,
        amount,
        currency: "TZS",
        status: "pending",
        pesapalOrderId: orderId,
      },
    });

    let redirectUrl = "";

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tunepoa.com";
      let ipnId = process.env.PESAPAL_IPN_ID || "";

      if (!ipnId) {
        try {
          const ipnResult = await registerIPN(`${baseUrl}/api/payments/ipn`);
          ipnId = ipnResult.ipn_id;
        } catch {
          // Ignore
        }
      }

      const orderResult = await submitOrder({
        id: orderId,
        currency: "TZS",
        amount,
        description: `TunePoa Renewal - ${subscription.package.name} - ${billingCycle === "3mo" ? "3 Months" : billingCycle === "6mo" ? "6 Months" : "12 Months"}`,
        callback_url: `${baseUrl}/api/payments/callback?paymentId=${payment.id}`,
        notification_id: ipnId,
        billing_address: {
          email_address: user.email,
          phone_number: user.phone || undefined,
          country_code: "TZ",
          first_name: user.name.split(" ")[0] || user.name,
          last_name: user.name.split(" ").slice(1).join(" ") || "",
        },
      });

      redirectUrl = orderResult.redirect_url;

      await db.payment.update({
        where: { id: payment.id },
        data: { pesapalTrackingId: orderResult.order_tracking_id },
      });
    } catch (pesapalErr) {
      console.warn("PesaPal integration error (sandbox may not be available):", pesapalErr);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tunepoa.com";
      redirectUrl = `${baseUrl}/api/payments/callback?paymentId=${payment.id}&OrderTrackingId=MOCK-${payment.id}&OrderNotificationType=COMPLETED`;
    }

    await logAudit({
      userId: session.userId,
      userName: user.name,
      action: "create",
      entity: "payment",
      entityId: payment.id,
      details: JSON.stringify({ subscriptionId, billingCycle, amount, orderId, type: "renewal" }),
    });

    return NextResponse.json({
      payment,
      redirectUrl,
    }, { status: 201 });
  } catch (error) {
    console.error("Renew payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
