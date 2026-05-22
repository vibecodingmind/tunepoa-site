"use client";

import { Cookie } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteShell";

export default function CookiesPolicyPage() {
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
              <Cookie className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Cookies Policy</h1>
              <p className="text-white/30 text-sm mt-1">Last updated: May 2025</p>
            </div>
          </div>
          <p className="text-lg text-white/40 leading-relaxed">This Cookies Policy explains how TunePoa uses cookies and similar tracking technologies when you visit our website and use our services. By continuing to use our website, you consent to the use of cookies as described below.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <div className="space-y-14">
          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">1. What Are Cookies?</h2>
            <p className="text-white/40 leading-relaxed mb-4">Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, to provide a better browsing experience, and to supply information to the owners of the site.</p>
            <p className="text-white/40 leading-relaxed">Cookies can be persistent (stored on your device until they expire or you delete them) or session-based (deleted when you close your browser). They can also be first-party (set by TunePoa) or third-party (set by our partners and service providers).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">2. How We Use Cookies</h2>
            <p className="text-white/40 leading-relaxed mb-4">We use cookies for several purposes: to enable core functionality such as security, network management, and account access (Essential Cookies), to understand how visitors interact with our website and services so we can improve them (Analytics Cookies), to remember your preferences and settings for a personalized experience (Preference Cookies), and to deliver relevant advertisements and track campaign performance (Marketing Cookies).</p>
            <p className="text-white/40 leading-relaxed">Each type of cookie serves a specific purpose and may collect different kinds of data. We do not use cookies to collect personally identifiable information beyond what is necessary for the stated purpose.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">3. Types of Cookies We Use</h2>
            <div className="space-y-6 mt-6">
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-teal-400 mb-3">Essential Cookies</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-3">These cookies are strictly necessary for the operation of our website and services. They enable core functionality such as page navigation, secure access to authenticated areas, and session management. Essential cookies cannot be switched off as the website cannot function properly without them.</p>
                <p className="text-white/30 text-xs">Examples: session_id, csrf_token, auth_state</p>
              </div>
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-amber-400 mb-3">Analytics Cookies</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-3">These cookies help us understand how visitors use our website by collecting and reporting information anonymously. They allow us to count visits, identify which pages are most and least visited, and understand how visitors move around the site. All data collected by these cookies is aggregated and anonymized.</p>
                <p className="text-white/30 text-xs">Examples: _ga, _gid, _utm_source (Google Analytics)</p>
              </div>
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-violet-400 mb-3">Preference Cookies</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-3">These cookies enable the website to remember information that changes the way the website behaves or looks, such as your preferred language, region, or theme settings. They provide enhanced, personalized features but are not essential for the website to function.</p>
                <p className="text-white/30 text-xs">Examples: language_pref, theme_mode, region_setting</p>
              </div>
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-rose-400 mb-3">Marketing Cookies</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-3">These cookies are used to track visitors across websites to display relevant advertisements. They are set by our advertising partners and help measure the effectiveness of our advertising campaigns. They may be set through our site by these partners to build a profile of your interests and show you relevant ads on other sites.</p>
                <p className="text-white/30 text-xs">Examples: _fbp, _gcl_au, ads_prefs</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">4. Third-Party Cookies</h2>
            <p className="text-white/40 leading-relaxed mb-4">In addition to our own cookies, we may use cookies from the following third parties: Google Analytics for website usage analytics, Stripe for payment processing security, and social media platforms (Twitter, LinkedIn, Facebook, Instagram) for social sharing functionality and advertising.</p>
            <p className="text-white/40 leading-relaxed">These third-party cookies are governed by the respective third party&apos;s privacy policy. We encourage you to review their policies for more information on how they use cookies and your choices regarding such use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">5. Managing Your Cookie Preferences</h2>
            <p className="text-white/40 leading-relaxed mb-4">When you first visit our website, you will be presented with a cookie consent banner that allows you to accept or customize your cookie preferences. You can choose to accept all cookies, reject non-essential cookies, or customize which types of cookies you wish to allow.</p>
            <p className="text-white/40 leading-relaxed mb-4">You can also manage cookies through your browser settings. Most browsers allow you to view, manage, and delete cookies. Please note that removing or blocking cookies may impact your user experience and parts of our website may no longer be fully accessible.</p>
            <p className="text-white/40 leading-relaxed">To manage cookies in your browser: In Chrome, go to Settings &gt; Privacy and Security &gt; Cookies. In Firefox, go to Options &gt; Privacy &amp; Security. In Safari, go to Preferences &gt; Privacy. In Edge, go to Settings &gt; Cookies and site permissions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">6. Cookie Duration</h2>
            <p className="text-white/40 leading-relaxed mb-4">Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period or until manually deleted. The duration varies by cookie type: essential cookies typically last for the duration of your session, analytics cookies generally expire after 2 years, preference cookies usually last for 1 year, and marketing cookies typically expire after 6 months.</p>
            <p className="text-white/40 leading-relaxed">Specific expiration dates may vary for individual cookies. You can always clear cookies manually through your browser settings at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">7. Updates to This Policy</h2>
            <p className="text-white/40 leading-relaxed">We may update this Cookies Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. If we make material changes, we will provide notice through our website or by other means as required by applicable law. Your continued use of the website after any changes constitutes your acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">8. Contact</h2>
            <p className="text-white/40 leading-relaxed">For questions about our use of cookies, please contact us at:</p>
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
