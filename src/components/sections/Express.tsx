"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Fingerprint } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export function Express() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="express" className="bg-white py-20 md:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl cta-gradient flex items-center justify-center mx-auto mb-6">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>

          {/* Label */}
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
            Advanced Technology
          </span>

          {/* Heading */}
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6 leading-tight">
            Protect Through{" "}
            <span className="gradient-text">Innovation</span>
          </h3>

          {/* Description paragraphs */}
          <div className="space-y-4 mb-10">
            <p className="text-lg text-gray-600 leading-relaxed">
              CopyShield leverages cutting-edge blockchain technology and
              artificial intelligence to create an impenetrable shield around
              your creative works. Our proprietary system generates
              cryptographically signed certificates of authenticity that stand
              up in courts worldwide.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              From the moment you upload your work, our platform creates an
              immutable record on the blockchain, scans the internet for
              potential conflicts, and prepares legal documentation — all in
              under 60 seconds.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            asChild
            size="lg"
            className="cta-gradient text-white border-0 shadow-lg shadow-teal-900/20 px-8 py-6 text-base font-semibold"
          >
            <a href="#contact">
              Start Protecting Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
