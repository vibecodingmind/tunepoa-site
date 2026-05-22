"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

export function Hero() {
  return (
    <section className="hero-gradient relative min-h-screen flex items-center overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="p-[1.5px] rounded-full gradient-border">
                <div className="flex items-center gap-2 bg-[#042f2e] rounded-full px-5 py-2">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-teal-300">
                    Protect Your Work
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
          >
            Safeguard Your{" "}
            <span className="gradient-text">Creative Legacy!</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            CopyShield&apos;s copyright protection platform replaces uncertainty
            with instant, verifiable proof of ownership, transforming how
            creators secure and monetize their intellectual property.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              asChild
              size="lg"
              className="cta-gradient text-white border-0 shadow-xl shadow-teal-900/40 hover:shadow-teal-800/50 px-8 py-6 text-base font-semibold"
            >
              <a href="#contact">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-base font-semibold"
            >
              <a href="#about">Learn More</a>
            </Button>
          </motion.div>

          {/* Trust line */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm text-white/50 font-medium uppercase tracking-wider">
              Trusted by leading creators worldwide
            </p>
            <div className="flex items-center gap-6 text-white/30">
              <span className="text-sm font-semibold tracking-wide">Artists</span>
              <span className="text-white/20">|</span>
              <span className="text-sm font-semibold tracking-wide">Writers</span>
              <span className="text-white/20">|</span>
              <span className="text-sm font-semibold tracking-wide">Musicians</span>
              <span className="text-white/20">|</span>
              <span className="text-sm font-semibold tracking-wide">Developers</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
