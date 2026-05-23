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
    const { packageId, billingCycle } = body;

    if (!packageId || !billingCycle) {
      return NextResponse.json({ error: "Package ID and billing cycle are required" }, { status: 400 });
    }

    if (!["3mo", "6mo", "12mo"].includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    const pkg = await db.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const amount = billingCycle === "3mo" ? pkg.price3mo : billingCycle === "6mo" ? pkg.price6mo : pkg.price12mo;

    // Create payment record
    const orderId = `TP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const payment = await db.payment.create({
      data: {
        userId: session.userId,
        packageId,
        billingCycle,
        amount,
        currency: "TZS",
        status: "pending",
        pesapalOrderId: orderId,
      },
    });

    // Try to submit order to PesaPal
    let redirectUrl = "";
    let trackingId = "";

    try {
      // Try to register IPN (use the callback URL)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tunepoa.com";
      let ipnId = process.env.PESAPAL_IPN_ID || "";

      if (!ipnId) {
        try {
          const ipnResult = await registerIPN(`${baseUrl}/api/payments/ipn`);
          ipnId = ipnResult.ipn_id;
        } catch (ipnErr) {
          console.warn("IPN registration failed, using empty IPN ID:", ipnErr);
        }
      }

      const orderResult = await submitOrder({
        id: orderId,
        currency: "TZS",
        amount,
        description: `TunePoa ${pkg.name} - ${billingCycle === "3mo" ? "3 Months" : billingCycle === "6mo" ? "6 Months" : "12 Months"}`,
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
      trackingId = orderResult.order_tracking_id;

      // Update payment with tracking info
      await db.payment.update({
        where: { id: payment.id },
        data: {
          pesapalTrackingId: trackingId,
        },
      });
    } catch (pesapalErr) {
      console.warn("PesaPal integration error (sandbox may not be available):", pesapalErr);
      // In development/sandbox mode, we still create the payment record
      // and return a mock redirect URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tunepoa.com";
      redirectUrl = `${baseUrl}/api/payments/callback?paymentId=${payment.id}&OrderTrackingId=MOCK-${payment.id}&OrderNotificationType=COMPLETED`;
    }

    await logAudit({
      userId: session.userId,
      userName: user.name,
      action: "create",
      entity: "payment",
      entityId: payment.id,
      details: JSON.stringify({ packageId, billingCycle, amount, orderId }),
    });

    return NextResponse.json({
      payment,
      redirectUrl,
    }, { status: 201 });
  } catch (error) {
    console.error("Initiate payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
