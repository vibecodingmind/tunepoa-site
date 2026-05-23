import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LiveChat } from "@/components/LiveChat";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const SITE_URL = "https://tunepoa.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050c18",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TunePoa – Professional Ringback Tone Solution for Businesses in Africa",
    template: "%s | TunePoa",
  },
  description:
    "TunePoa replaces boring call beeps with custom branded melodies and messages. Transform every call-waiting experience into a marketing opportunity. Integrated with Vodacom, Safaricom, Airtel & more.",
  keywords: [
    "ringback tone",
    "RBT",
    "call waiting music",
    "branded ringback tone",
    "business ringback tone",
    "custom call tone",
    "TunePoa",
    "ringback tone Africa",
    "ringback tone Tanzania",
    "Vodacom ringback tone",
    "Safaricom ringback tone",
    "Airtel ringback tone",
    "brand engagement",
    "caller experience",
    "business tone",
    "corporate ringback tone",
    "hospitality ringback tone",
    "RBT service provider",
    "telecom integration Africa",
  ],
  authors: [{ name: "TunePoa", url: SITE_URL }],
  creator: "TunePoa",
  publisher: "TunePoa",
  category: "Technology",
  classification: "Telecom Services",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "TunePoa",
    title: "TunePoa – Professional Ringback Tone Solution for Businesses in Africa",
    description:
      "Replace boring call beeps with custom branded melodies. Transform every call into a marketing opportunity with TunePoa's RBT service.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TunePoa – Professional Ringback Tone Solution",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TunePoa – Professional Ringback Tone Solution",
    description:
      "Replace boring call beeps with custom branded melodies. Transform every call into a marketing opportunity.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@tunepoa",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TunePoa",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "TunePoa replaces boring call beeps with custom branded melodies and messages, transforming call experiences while driving revenue and enhancing satisfaction.",
  sameAs: [
    "https://twitter.com/tunepoa",
    "https://linkedin.com/company/tunepoa",
    "https://facebook.com/tunepoa",
    "https://instagram.com/tunepoa",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Swahili"],
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Ringback Tone Service",
  provider: {
    "@type": "Organization",
    name: "TunePoa",
  },
  description:
    "Professional ringback tone service that replaces standard call waiting sounds with branded music, messages, and promotional content for businesses across Africa.",
  areaServed: {
    "@type": "Place",
    name: "Africa",
  },
  serviceType: "Ringback Tone (RBT)",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Ringback Tone (RBT)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Ringback Tone is the sound that callers hear while waiting for their call to be answered. Instead of the standard ringing sound, RBT replaces it with music, messages, or any audio content of your choice.",
      },
    },
    {
      "@type": "Question",
      name: "How does TunePoa's RBT service work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TunePoa allows businesses to select or upload custom audio content that plays for callers while they wait. Simply choose from our extensive tone library or upload your own branded content, assign it to your business lines, and your callers will enjoy a personalized waiting experience immediately.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the ringback tone for different callers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! TunePoa supports time-based and caller-group-based tone scheduling. You can set different tones for different times of day, specific caller groups, or even run promotional campaigns that rotate automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Is the service compatible with all telecom networks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TunePoa integrates with all major telecom networks across Africa including Vodacom, Safaricom, Airtel, Telkom, and more. We ensure seamless deployment regardless of your carrier.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly can I get started?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Getting started takes just minutes. Sign up, select your plan, choose or upload your tones, and assign them to your business lines. Our team is also available to help with setup.",
      },
    },
    {
      "@type": "Question",
      name: "What types of audio content can I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can use music tracks from our licensed library, custom voice messages, promotional content, seasonal greetings, or any professionally produced audio. Our platform supports all standard audio formats.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="geo.region" content="TZ" />
        <meta name="geo.country" content="Africa" />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground font-sans overflow-x-hidden`}>
        <AuthProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AuthProvider>
        <Toaster richColors position="top-right" />
        <LiveChat />
      </body>
    </html>
  );
}
