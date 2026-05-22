"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteShell";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "General",
      items: [
        {
          q: "What is a Ringback Tone (RBT)?",
          a: "A Ringback Tone is the audio content that callers hear while waiting for their call to be answered. Instead of the standard, monotonous ringing sound, RBT replaces it with music, promotional messages, branded content, or any audio of your choice. It transforms the waiting experience into an engaging touchpoint between your business and your callers.",
        },
        {
          q: "How does TunePoa work?",
          a: "TunePoa is a platform that allows businesses to select or upload custom audio content that plays for callers while they wait for their call to be answered. Simply sign up, choose from our extensive tone library or upload your own branded audio, assign tones to your business lines, and your callers will enjoy a personalized waiting experience. The service integrates directly with telecom networks across Africa for seamless delivery.",
        },
        {
          q: "Who can use TunePoa?",
          a: "TunePoa is designed for businesses of all sizes — from small startups to large enterprises. Any organization that receives phone calls from customers, partners, or stakeholders can benefit from our ringback tone services. Our plans are structured to accommodate businesses at every stage, whether you have a single line or hundreds of business lines across multiple locations.",
        },
        {
          q: "Which telecom networks does TunePoa support?",
          a: "TunePoa is integrated with major telecom networks across Africa, including Vodacom, Safaricom, Airtel, Telkom, MANGO 4G, and Maroc Telecom. We are continuously expanding our network coverage to include additional providers and regions. If your preferred network is not listed, please contact us to discuss availability.",
        },
      ],
    },
    {
      category: "Subscription & Billing",
      items: [
        {
          q: "What plans are available?",
          a: "We offer three plans: Starter (TZS 20,000/month per user), Pro (TZS 57,000/month per 3 users), and Enterprise (custom pricing). All plans include customizable tones, high-quality audio experience, and scheduled tone features. Annual subscriptions receive a 20% discount. Visit our pricing page for full details.",
        },
        {
          q: "Can I switch between plans?",
          a: "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new plan features will be available immediately, and billing adjustments will take effect at the start of your next billing cycle. If you downgrade, the change will take effect at the beginning of the next billing period, and you will retain access to your current plan features until then.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept major credit and debit cards (Visa, Mastercard), mobile money payments (M-Pesa, Airtel Money), and bank transfers for Enterprise plans. All payments are processed securely through our payment partners. For Enterprise clients, we also offer invoice-based billing with NET-30 payment terms.",
        },
        {
          q: "Is there a free trial?",
          a: "Yes, we offer a 14-day free trial for new subscribers on the Starter and Pro plans. During the trial period, you will have full access to all features included in your selected plan. No credit card is required to start the trial. At the end of the trial, you can choose to subscribe or let the trial expire with no obligations.",
        },
      ],
    },
    {
      category: "Technical",
      items: [
        {
          q: "How do I set up ringback tones on my business lines?",
          a: "Setting up ringback tones is simple. After signing up, log into your TunePoa dashboard, browse our tone library or upload your custom audio, then assign tones to specific business lines or groups of lines. You can also set schedules so different tones play at different times of day. The tones become active within minutes of assignment.",
        },
        {
          q: "What audio formats are supported for custom uploads?",
          a: "We support MP3, WAV, and AAC audio formats. For optimal quality, we recommend MP3 files encoded at 128kbps or higher, with a duration of 15-30 seconds. Files must not exceed 5MB in size. Our system will automatically optimize your audio for telecom network delivery while maintaining the best possible quality.",
        },
        {
          q: "Can I schedule different tones for different times?",
          a: "Yes, our scheduling feature allows you to assign different ringback tones for different times of the day, days of the week, or specific date ranges. For example, you could play promotional tones during business hours and a general welcome message after hours. Scheduling can be managed directly from your dashboard.",
        },
        {
          q: "How reliable is the service?",
          a: "TunePoa operates on enterprise-grade infrastructure with 99.9% uptime. Our direct integration with telecom networks ensures crystal-clear audio quality and reliable delivery. We have redundant systems in place and our infrastructure is monitored 24/7 to ensure consistent service availability.",
        },
      ],
    },
    {
      category: "Content & Licensing",
      items: [
        {
          q: "Can I use any music as a ringback tone?",
          a: "Our tone library includes a wide selection of licensed music and audio content that you can use without any copyright concerns. If you wish to use specific commercial music that is not in our library, you would need to obtain the appropriate licensing rights. Alternatively, you can upload original compositions or content that you own or have licensed.",
        },
        {
          q: "Who owns the custom audio I upload?",
          a: "You retain full ownership of any custom audio content you upload to TunePoa. By uploading, you grant TunePoa a limited license solely to store, transmit, and play that content for the purpose of delivering ringback tone services through our platform. You may delete your uploaded content at any time.",
        },
        {
          q: "Are there content restrictions?",
          a: "Yes, all content used as ringback tones must comply with applicable laws and regulations. Content must not be unlawful, offensive, misleading, or infringe on the intellectual property rights of others. TunePoa reserves the right to remove any content that violates these guidelines without prior notice.",
        },
      ],
    },
    {
      category: "Support",
      items: [
        {
          q: "How do I contact support?",
          a: "You can reach our support team via email at support@tunepoa.com or by calling +255 123 456 789 during business hours (Monday-Friday, 8AM-6PM EAT). Pro and Enterprise plan subscribers also have access to priority support with faster response times. We aim to respond to all inquiries within 24 hours.",
        },
        {
          q: "What if my ringback tone stops working?",
          a: "If your ringback tone stops working, first check your dashboard to ensure your subscription is active and your tone assignments are correct. If the issue persists, contact our support team and we will investigate and resolve the issue promptly. Service interruptions affecting multiple lines are prioritized for immediate resolution.",
        },
        {
          q: "Can I get a refund if I'm not satisfied?",
          a: "Yes, we offer a 14-day money-back guarantee for first-time subscribers. If you are not satisfied within the first 14 days, you can request a full refund. For annual subscriptions, pro-rata refunds are available for the unused portion after the guarantee period. Please see our Refund Policy for full details.",
        },
      ],
    },
  ];

  const allFaqs = faqs.flatMap((cat) => cat.items);
  const currentIndex = openIndex !== null ? openIndex : -1;

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
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h1>
              <p className="text-white/30 text-sm mt-1">Everything you need to know about TunePoa</p>
            </div>
          </div>
          <p className="text-lg text-white/40 leading-relaxed">Find answers to common questions about our ringback tone services, billing, technical setup, and more. Can&apos;t find what you&apos;re looking for? Contact our support team.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <div className="space-y-16">
          {faqs.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-bold text-teal-400 mb-8 tracking-tight uppercase text-sm tracking-[0.2em]">{category.category}</h2>
              <div className="space-y-4">
                {category.items.map((faq) => {
                  const globalIndex = allFaqs.indexOf(faq);
                  const isOpen = currentIndex === globalIndex;
                  return (
                    <div key={faq.q} className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="text-white font-semibold text-base pr-4">{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-teal-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                        <p className="px-6 pb-6 text-white/40 leading-relaxed text-sm">{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-20 text-center">
          <div className="glass-card rounded-[2rem] p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-cyan-500/5" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
              <p className="text-white/40 mb-8 max-w-lg mx-auto">Our team is here to help. Reach out and we&apos;ll get back to you as soon as possible.</p>
              <a href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-teal-500/20 transition-all duration-500 hover:scale-105">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SiteFooter />
    </>
  );
}
