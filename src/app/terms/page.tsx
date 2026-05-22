"use client";

import { FileText } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteShell";

export default function TermsOfServicesPage() {
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
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Terms of Service</h1>
              <p className="text-white/30 text-sm mt-1">Last updated: May 2025</p>
            </div>
          </div>
          <p className="text-lg text-white/40 leading-relaxed">These Terms of Service govern your use of TunePoa&apos;s ringback tone platform and services. By accessing or using our services, you agree to be bound by these terms.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <div className="space-y-14">
          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-white/40 leading-relaxed mb-4">By creating an account, accessing, or using TunePoa&apos;s services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, along with our Privacy Policy and any additional terms that may apply to specific features or services.</p>
            <p className="text-white/40 leading-relaxed">If you are using the services on behalf of a business or organization, you represent and warrant that you have the authority to bind that entity to these terms. If you do not agree to these terms, you must not access or use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">2. Description of Services</h2>
            <p className="text-white/40 leading-relaxed mb-4">TunePoa provides a ringback tone (RBT) platform that allows businesses and individuals to replace the standard ringing sound that callers hear with personalized music, messages, or branded audio content. Our services include access to a library of professionally produced ringback tones, the ability to upload custom audio content, tone scheduling and assignment features, real-time analytics and reporting, and integration with telecom network providers across Africa.</p>
            <p className="text-white/40 leading-relaxed">We reserve the right to modify, suspend, or discontinue any part of our services at any time, with reasonable notice where practicable. We will make commercially reasonable efforts to notify you of any material changes to the services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">3. Account Registration</h2>
            <p className="text-white/40 leading-relaxed mb-4">To use our services, you must register for an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
            <p className="text-white/40 leading-relaxed mb-4">You must be at least 18 years of age to create an account and use our services. By creating an account, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these terms.</p>
            <p className="text-white/40 leading-relaxed">We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, not current, or incomplete, or if we have reasonable grounds to suspect fraud, abuse, or security concerns.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">4. Acceptable Use</h2>
            <p className="text-white/40 leading-relaxed mb-4">You agree to use our services only for lawful purposes and in accordance with these terms. You agree not to use the services to upload, store, or distribute any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</p>
            <p className="text-white/40 leading-relaxed mb-4">You must not use the services to infringe upon the intellectual property rights of others, transmit any malware, viruses, or other harmful code, attempt to gain unauthorized access to any part of the services or any systems connected to the services, interfere with or disrupt the integrity or performance of the services, or use automated means to access the services for any purpose without our express permission.</p>
            <p className="text-white/40 leading-relaxed">Any audio content you upload must not contain content that you do not have the right to use, content that violates copyright or trademark laws, misleading or fraudulent messages, or content that violates telecom regulations in the applicable jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">5. Subscription and Payment</h2>
            <p className="text-white/40 leading-relaxed mb-4">By selecting a paid plan, you agree to pay the applicable subscription fees as described on our pricing page. All fees are quoted in Tanzanian Shillings (TZS) and are exclusive of applicable taxes unless stated otherwise. Payment is due at the beginning of each subscription period.</p>
            <p className="text-white/40 leading-relaxed mb-4">We offer monthly and annual billing options. Annual subscriptions are billed in advance and include a 20% discount compared to monthly billing. You may upgrade or downgrade your plan at any time, with billing adjustments taking effect at the start of your next billing cycle.</p>
            <p className="text-white/40 leading-relaxed">We reserve the right to change our pricing with 30 days&apos; advance notice. Price changes will take effect at the start of your next billing cycle following the notice period. Continued use of the services after a price change constitutes acceptance of the new pricing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">6. Intellectual Property</h2>
            <p className="text-white/40 leading-relaxed mb-4">The TunePoa platform, including its design, text, graphics, logos, icons, images, audio clips, software, and the compilation thereof, is the property of TunePoa and is protected by international copyright, trademark, and other intellectual property laws.</p>
            <p className="text-white/40 leading-relaxed mb-4">Ringback tones available in our library are licensed from their respective rights holders. Your subscription grants you a non-exclusive, non-transferable license to use these tones as ringback tones on your assigned business lines for the duration of your subscription.</p>
            <p className="text-white/40 leading-relaxed">For custom audio content that you upload, you retain ownership of that content. By uploading, you grant TunePoa a limited license to store, transmit, and play that content solely for the purpose of delivering ringback tone services through our platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">7. Service Availability</h2>
            <p className="text-white/40 leading-relaxed mb-4">We strive to provide continuous, uninterrupted access to our services. However, the services may be unavailable from time to time due to scheduled maintenance, system upgrades, or circumstances beyond our control, including telecom network outages, Internet disruptions, or force majeure events.</p>
            <p className="text-white/40 leading-relaxed">We do not guarantee that the services will be available at all times or error-free. We will make commercially reasonable efforts to provide advance notice of scheduled maintenance windows. In the event of unplanned downtime, we will work diligently to restore services as quickly as possible.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">8. Limitation of Liability</h2>
            <p className="text-white/40 leading-relaxed mb-4">To the maximum extent permitted by applicable law, TunePoa shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from or related to your use of or inability to use the services.</p>
            <p className="text-white/40 leading-relaxed">Our total liability for any claims arising from or related to these terms or the services shall not exceed the total amount you have paid to TunePoa in the twelve (12) months preceding the event giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">9. Termination</h2>
            <p className="text-white/40 leading-relaxed mb-4">You may terminate your account at any time by contacting our support team or through your account settings. Upon termination, your right to use the services will immediately cease, and your ringback tones will be removed from assigned lines within 24 hours.</p>
            <p className="text-white/40 leading-relaxed">We may suspend or terminate your account if we reasonably believe you have violated these terms, with or without prior notice. Upon termination for cause, no refund will be provided for any prepaid subscription fees. Upon termination without cause, we will provide a pro-rata refund for unused subscription time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">10. Contact</h2>
            <p className="text-white/40 leading-relaxed">For questions about these Terms of Service, please contact us at:</p>
            <div className="mt-4 glass rounded-2xl p-6 border border-white/5">
              <p className="text-white/60 text-sm leading-relaxed">TunePoa Legal Team<br />Email: legal@tunepoa.com<br />Phone: +255 123 456 789<br />Address: Dar es Salaam, Tanzania</p>
            </div>
          </section>
        </div>
      </div>
    </div>
    <SiteFooter />
    </>
  );
}
