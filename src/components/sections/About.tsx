"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FileCheck } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="bg-white py-20 md:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 mb-4">
            <FileCheck className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
              About CopyShield
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Every Creation into a{" "}
            <span className="gradient-text">Protected Asset</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Our platform allows creators to register, protect, and monitor their
            original works with blockchain-verified timestamps and legal-grade
            documentation. This service enhances creator confidence, boosts
            portfolio value, and ensures your intellectual property remains yours.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
