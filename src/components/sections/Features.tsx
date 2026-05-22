"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Globe, Brain } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const features = [
  {
    icon: Clock,
    title: "Instant Copyright Proof",
    description:
      "Register your work in minutes with blockchain-verified timestamps that provide immutable proof of creation and ownership.",
  },
  {
    icon: Globe,
    title: "Global Protection Network",
    description:
      "Your copyrights are recognized across 180+ countries through our international treaty partnerships and digital rights management.",
  },
  {
    icon: Brain,
    title: "AI-Powered Infringement Detection",
    description:
      "Our AI continuously monitors the web for unauthorized use of your work, alerting you instantly when violations are detected.",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="features-gradient py-20 md:py-28 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/8 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            More Than Just{" "}
            <span className="gradient-text">Registration</span>
          </h2>
          <p className="text-white/70 text-lg mb-8">
            CopyShield goes beyond simple copyright registration — we provide a
            comprehensive ecosystem for protecting, monitoring, and enforcing
            your creative rights.
          </p>
          <Button
            asChild
            size="lg"
            className="cta-gradient text-white border-0 shadow-xl shadow-teal-900/30 px-8"
          >
            <a href="#contact">
              Explore All Features
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300 hover:border-teal-400/30 hover:shadow-lg hover:shadow-teal-900/20">
                <div className="w-14 h-14 rounded-xl cta-gradient flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
