"use client";

import { RotateCcw } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteShell";

export default function RefundPolicyPage() {
  return (
    <>
    <SiteNavbar />
    <div className="min-h-screen bg-[#050c18]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 via-[#081525] to-cyan-950/40" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/[0.05] rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 pt-40 pb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <RotateCcw className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Refund Policy</h1>
              <p className="text-white/30 text-sm mt-1">Last updated: May 2025</p>
            </div>
          </div>
          <p className="text-lg text-white/40 leading-relaxed">We want you to be completely satisfied with TunePoa. If you are not happy with our services, this Refund Policy outlines the circumstances under which we offer refunds.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <div className="space-y-14">
          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">1. Subscription Refunds</h2>
            <p className="text-white/40 leading-relaxed mb-4">If you are not satisfied with TunePoa&apos;s services within the first 14 days of your initial subscription, you may request a full refund. This 14-day money-back guarantee applies only to first-time subscribers and does not apply to subscription renewals.</p>
            <p className="text-white/40 leading-relaxed mb-4">For annual subscriptions, refunds after the 14-day period will be calculated on a pro-rata basis for the unused portion of the subscription. The refund amount will be the annual subscription fee divided by 365, multiplied by the number of full days remaining in the subscription period.</p>
            <p className="text-white/40 leading-relaxed">Monthly subscriptions that have been used for any period within the billing month are non-refundable after the 14-day guarantee period, but you may cancel at any time to prevent future billing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">2. Custom Tone Uploads</h2>
            <p className="text-white/40 leading-relaxed mb-4">Custom audio content that you upload to the TunePoa platform is processed and stored at no additional cost as part of your subscription. Since these uploads are user-provided content, there are no separate charges and therefore no refund obligations for custom tone uploads.</p>
            <p className="text-white/40 leading-relaxed">However, if you have paid for professional audio production services through TunePoa, those services are subject to a separate agreement and refund terms will be specified in that agreement.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">3. Service Interruptions</h2>
            <p className="text-white/40 leading-relaxed mb-4">If TunePoa experiences a service interruption that results in your ringback tones being unavailable for more than 24 consecutive hours, you may request a service credit equivalent to the downtime period added to your subscription. The credit will be calculated as your monthly subscription fee divided by 30, multiplied by the number of full days of service interruption.</p>
            <p className="text-white/40 leading-relaxed">This does not apply to service interruptions caused by third-party telecom network outages, scheduled maintenance (with prior notice), force majeure events, or interruptions resulting from your violation of these terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">4. How to Request a Refund</h2>
            <p className="text-white/40 leading-relaxed mb-4">To request a refund, please contact our support team at billing@tunepoa.com with your account details, the reason for the refund request, and the date of your subscription. Refund requests must be submitted within the applicable timeframes outlined in this policy.</p>
            <p className="text-white/40 leading-relaxed">Our team will review your request and respond within 5 business days. Approved refunds will be processed to the original payment method within 10-15 business days, depending on your payment provider.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">5. Non-Refundable Items</h2>
            <p className="text-white/40 leading-relaxed mb-4">The following are not eligible for refunds: subscription charges for months that have already been used beyond the 14-day guarantee period (monthly plans), setup fees or one-time configuration charges, charges for additional users added mid-cycle, and any promotional or discounted subscription fees.</p>
            <p className="text-white/40 leading-relaxed">Enterprise plan custom pricing and terms are governed by separate service level agreements, and refund terms for those plans are specified in the applicable agreement.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">6. Cancellation vs. Refund</h2>
            <p className="text-white/40 leading-relaxed mb-4">Cancelling your subscription stops future billing but does not automatically generate a refund. If you cancel within the 14-day guarantee period, you will receive a full refund. If you cancel after the guarantee period, no refund is provided for the current billing period, but you will not be charged again.</p>
            <p className="text-white/40 leading-relaxed">Your ringback tones will remain active until the end of your current billing period. After that, your assigned tones will be removed from your business lines within 24 hours.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">7. Dispute Resolution</h2>
            <p className="text-white/40 leading-relaxed mb-4">If you disagree with a refund decision, you may appeal by contacting our management team at management@tunepoa.com. We will review your appeal within 10 business days and provide a final determination.</p>
            <p className="text-white/40 leading-relaxed">Any disputes arising from this Refund Policy that cannot be resolved through our internal process shall be resolved through binding arbitration in Dar es Salaam, Tanzania, in accordance with the arbitration rules of the Tanzania Chamber of Commerce.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">8. Contact</h2>
            <p className="text-white/40 leading-relaxed">For refund inquiries, please contact us at:</p>
            <div className="mt-4 glass rounded-2xl p-6 border border-white/5">
              <p className="text-white/60 text-sm leading-relaxed">TunePoa Billing Team<br />Email: billing@tunepoa.com<br />Phone: +255 123 456 789<br />Address: Dar es Salaam, Tanzania</p>
            </div>
          </section>
        </div>
      </div>
    </div>
    <SiteFooter />
    </>
  );
}
