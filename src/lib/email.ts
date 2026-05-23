/**
 * Email helper module for TunePoa.
 * Uses Resend API for sending transactional emails.
 */

interface ExpiryReminderParams {
  userEmail: string;
  userName: string;
  packageName: string;
  endDate: string;
  daysRemaining: number;
}

interface RefundNotificationParams {
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  reason: string;
  packageName: string;
}

interface SubscriptionConfirmationParams {
  userEmail: string;
  userName: string;
  packageName: string;
  billingCycle: string;
  amount: number;
  startDate: string;
  endDate: string;
}

interface PaymentReceiptParams {
  userEmail: string;
  userName: string;
  packageName: string;
  amount: number;
  billingCycle: string;
  paymentMethod: string | null;
  trackingId: string;
}

interface PasswordResetParams {
  userEmail: string;
  userName: string;
  resetUrl: string;
}

const fromEmail = () => process.env.FROM_EMAIL || "noreply@tunepoa.com";
const fromName = () => process.env.FROM_NAME || "TunePoa";
const baseUrl = () => process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://tunepoa.com";

async function sendEmailViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email send");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName()} <${fromEmail()}>`,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[email] Failed to send email:", error);
      return false;
    }

    console.log("[email] Email sent to:", to);
    return true;
  } catch (error) {
    console.error("[email] Error sending email:", error);
    return false;
  }
}

export async function sendExpiryReminderEmail(params: ExpiryReminderParams): Promise<boolean> {
  const { userEmail, userName, packageName, endDate, daysRemaining } = params;
  const urgencyLabel =
    daysRemaining <= 1 ? "FINAL NOTICE" :
    daysRemaining <= 3 ? "URGENT" :
    "REMINDER";

  return sendEmailViaResend(
    userEmail,
    `[${urgencyLabel}] Your TunePoa ${packageName} subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">TunePoa Subscription ${urgencyLabel}</h2>
        <p>Hi ${userName},</p>
        <p>Your <strong>${packageName}</strong> subscription will expire in <strong>${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}</strong> (on ${new Date(endDate).toLocaleDateString()}).</p>
        <p>Please renew your subscription to avoid service interruption.</p>
        <a href="${baseUrl()}/dashboard" style="display:inline-block;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Manage Subscription</a>
        <p style="color:#999;font-size:12px;margin-top:24px;">TunePoa RBT Platform</p>
      </div>
    `
  );
}

export async function sendRefundNotificationEmail(params: RefundNotificationParams): Promise<boolean> {
  const { userEmail, userName, amount, currency, reason, packageName } = params;

  return sendEmailViaResend(
    userEmail,
    `Refund Processed - ${packageName} (${amount.toLocaleString()} ${currency})`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Refund Confirmation</h2>
        <p>Hi ${userName},</p>
        <p>A refund has been processed for your <strong>${packageName}</strong> subscription.</p>
        <p><strong>Amount:</strong> ${amount.toLocaleString()} ${currency}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you have any questions, please contact our support team.</p>
        <a href="${baseUrl()}/dashboard" style="display:inline-block;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
        <p style="color:#999;font-size:12px;margin-top:24px;">TunePoa RBT Platform</p>
      </div>
    `
  );
}

export async function sendSubscriptionConfirmationEmail(
  userEmail: string,
  userName: string,
  packageName: string,
  billingCycle: string,
  amount: number,
  startDate: string,
  endDate: string
): Promise<boolean> {
  const cycleLabel =
    billingCycle === "3mo" ? "3 Months" :
    billingCycle === "6mo" ? "6 Months" : "12 Months";

  return sendEmailViaResend(
    userEmail,
    `TunePoa Subscription Confirmed - ${packageName} (${cycleLabel})`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Subscription Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Your <strong>${packageName}</strong> subscription has been activated successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#f8fafc;"><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Package</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${packageName}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Billing Cycle</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${cycleLabel}</td></tr>
          <tr style="background:#f8fafc;"><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Amount</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${amount.toLocaleString()} TZS</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Start Date</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${new Date(startDate).toLocaleDateString()}</td></tr>
          <tr style="background:#f8fafc;"><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>End Date</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${new Date(endDate).toLocaleDateString()}</td></tr>
        </table>
        <p>You can now assign ringback tone numbers through your dashboard.</p>
        <a href="${baseUrl()}/dashboard" style="display:inline-block;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
        <p style="color:#999;font-size:12px;margin-top:24px;">TunePoa RBT Platform</p>
      </div>
    `
  );
}

export async function sendPaymentReceiptEmail(
  userEmail: string,
  userName: string,
  packageName: string,
  amount: number,
  billingCycle: string,
  paymentMethod: string | null,
  trackingId: string
): Promise<boolean> {
  const cycleLabel =
    billingCycle === "3mo" ? "3 Months" :
    billingCycle === "6mo" ? "6 Months" : "12 Months";

  return sendEmailViaResend(
    userEmail,
    `TunePoa Payment Receipt - ${amount.toLocaleString()} TZS`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Payment Receipt</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for your payment. Here is your receipt:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#f8fafc;"><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Package</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${packageName}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Billing Cycle</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${cycleLabel}</td></tr>
          <tr style="background:#f8fafc;"><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Amount</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${amount.toLocaleString()} TZS</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Payment Method</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${paymentMethod || "N/A"}</td></tr>
          <tr style="background:#f8fafc;"><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Tracking ID</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${trackingId}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>Date</strong></td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${new Date().toLocaleDateString()}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px;">TunePoa RBT Platform</p>
      </div>
    `
  );
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<boolean> {
  return sendEmailViaResend(
    userEmail,
    "TunePoa - Reset Your Password",
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Reset Your Password</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
        <p style="color:#666;font-size:13px;margin-top:16px;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        <p style="color:#999;font-size:12px;margin-top:24px;">TunePoa RBT Platform</p>
      </div>
    `
  );
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  return sendEmailViaResend(
    userEmail,
    "Welcome to TunePoa - Your Ringback Tone Platform!",
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Welcome to TunePoa!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for creating your account on <strong>TunePoa</strong> - Tanzania's premier Ring Back Tone platform.</p>
        <p>With TunePoa, you can:</p>
        <ul style="color: #555; padding-left: 20px;">
          <li>Browse and subscribe to RBT packages</li>
          <li>Assign phone numbers to your subscriptions</li>
          <li>Manage your ringback tones from your dashboard</li>
          <li>Pay securely via PesaPal (M-Pesa, Tigo Pesa, Airtel Money)</li>
        </ul>
        <a href="${baseUrl()}/dashboard" style="display:inline-block;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
        <p style="color:#999;font-size:12px;margin-top:24px;">TunePoa RBT Platform</p>
      </div>
    `
  );
}
