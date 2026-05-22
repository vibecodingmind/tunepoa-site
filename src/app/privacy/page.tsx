"use client";

import { Shield } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteShell";

export default function PrivacyPolicyPage() {
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
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
              <p className="text-white/30 text-sm mt-1">Last updated: May 2025</p>
            </div>
          </div>
          <p className="text-lg text-white/40 leading-relaxed">At TunePoa, we are committed to protecting your privacy and ensuring the security of your personal information. This policy outlines how we collect, use, and safeguard your data.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <div className="space-y-14">
          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">1. Information We Collect</h2>
            <p className="text-white/40 leading-relaxed mb-4">We collect information that you provide directly to us when you register for an account, subscribe to our ringback tone services, make a purchase, or contact our support team. This includes your full name, email address, phone number, company name, billing information, and any other details you choose to provide.</p>
            <p className="text-white/40 leading-relaxed mb-4">We also automatically collect certain technical information when you visit our website or use our services, including your IP address, browser type, device information, operating system, referring URLs, and interaction data such as pages visited, features used, and time spent on our platform.</p>
            <p className="text-white/40 leading-relaxed">Additionally, when you use our ringback tone services, we collect call metadata including call duration, tone assignment data, and playback statistics to optimize service quality and provide accurate billing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">2. How We Use Your Information</h2>
            <p className="text-white/40 leading-relaxed mb-4">We use the information we collect to provide, maintain, and improve our ringback tone services, process transactions and send related billing information, respond to your comments, questions, and support requests, and send you technical notices and support messages.</p>
            <p className="text-white/40 leading-relaxed mb-4">Your data also helps us communicate with you about products, services, offers, and events offered by TunePoa, and provide news and information we think will be of interest to you. We monitor and analyze trends, usage, and activities in connection with our services to continually improve your experience.</p>
            <p className="text-white/40 leading-relaxed">We may also use your information to detect, investigate, and prevent fraudulent transactions, abuse, and other illegal activities, as well as to protect the rights and safety of TunePoa, our users, and the public.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">3. Information Sharing</h2>
            <p className="text-white/40 leading-relaxed mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information with our telecom integration partners (including Vodacom, Safaricom, Airtel, Telkom, and other network providers) solely for the purpose of delivering ringback tone services to your business lines.</p>
            <p className="text-white/40 leading-relaxed mb-4">We may also share information with service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service. These service providers are authorized to use your information only as necessary to provide services to us.</p>
            <p className="text-white/40 leading-relaxed">We may disclose your information if we believe that disclosure is necessary to comply with applicable law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of TunePoa, our users, or the public.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">4. Data Security</h2>
            <p className="text-white/40 leading-relaxed mb-4">We take the security of your personal information seriously and employ industry-standard measures to protect it. We use encryption (SSL/TLS) for all data transmission, maintain secure data centers with restricted access, implement regular security audits and vulnerability assessments, and maintain strict access controls and authentication procedures.</p>
            <p className="text-white/40 leading-relaxed">While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest practicable standards.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">5. Data Retention</h2>
            <p className="text-white/40 leading-relaxed mb-4">We retain your personal information for as long as your account is active or as needed to provide you our services. We may also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.</p>
            <p className="text-white/40 leading-relaxed">When you close your account, we will delete your personal information within 90 days, except where we are required to retain it by law for financial and tax record-keeping purposes. Call metadata and usage data may be retained in anonymized form for analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">6. Your Rights</h2>
            <p className="text-white/40 leading-relaxed mb-4">You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your personal data, object to the processing of your data, or request that we restrict the processing of your data.</p>
            <p className="text-white/40 leading-relaxed">To exercise any of these rights, please contact us at privacy@tunepoa.com. We will respond to your request within 30 days. Please note that certain data may be exempt from deletion requests where we have a legal obligation to retain it.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">7. Changes to This Policy</h2>
            <p className="text-white/40 leading-relaxed">We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of this policy and, for material changes, we will provide a more prominent notice such as adding a statement to our website or sending you a notification. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">8. Contact Us</h2>
            <p className="text-white/40 leading-relaxed">If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
            <div className="mt-4 glass rounded-2xl p-6 border border-white/5">
              <p className="text-white/60 text-sm leading-relaxed">TunePoa Privacy Team<br />Email: privacy@tunepoa.com<br />Phone: +255 123 456 789<br />Address: Dar es Salaam, Tanzania</p>
            </div>
          </section>
        </div>
      </div>
    </div>
    <SiteFooter />
    </>
  );
}
