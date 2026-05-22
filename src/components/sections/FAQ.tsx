"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const faqs = [
  {
    question: "How does CopyShield protect my creative work?",
    answer:
      "CopyShield creates a blockchain-verified timestamp of your work the moment you upload it. This generates an immutable, legally admissible record of creation that serves as proof of ownership. Combined with our AI-powered monitoring system, we ensure continuous protection across the web.",
  },
  {
    question: "What types of creative works can I register?",
    answer:
      "You can register virtually any original creative work including written content, visual art, music, software code, designs, photographs, videos, and more. Our platform supports all major file formats and provides specialized documentation for each type of creative work.",
  },
  {
    question: "Is CopyShield's blockchain certification legally valid?",
    answer:
      "Yes. Our blockchain certifications are designed to be legally admissible in courts worldwide. We comply with international copyright treaties including the Berne Convention and WIPO standards. Our certificates have been successfully used in legal proceedings across 180+ countries.",
  },
  {
    question: "How does the AI infringement detection work?",
    answer:
      "Our AI system continuously crawls the web, social media platforms, marketplaces, and file-sharing networks looking for matches to your registered works. When a potential infringement is detected, you receive an instant alert with details about the violation, including screenshots, URLs, and recommended next steps.",
  },
  {
    question: "Can I transfer or license my copyrighted work through CopyShield?",
    answer:
      "Absolutely! CopyShield includes a built-in licensing management system that allows you to create, manage, and track licenses for your works. You can set custom terms, pricing, and usage restrictions, all documented with the same blockchain-verified legal standards.",
  },
  {
    question: "What happens if I discover unauthorized use of my work?",
    answer:
      "CopyShield provides a complete enforcement toolkit. You can generate DMCA takedown notices, cease and desist letters, and formal infringement reports directly from our platform. For Enterprise users, we also offer litigation support and connections to specialized IP attorneys.",
  },
];

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-lg text-gray-600">
              Still have more questions?{" "}
              <a
                href="#contact"
                className="text-teal-600 font-semibold hover:text-teal-700 underline-offset-4 hover:underline transition-colors"
              >
                Contact Us
              </a>
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gray-50 rounded-xl border border-gray-100 px-6 data-[state=open]:bg-teal-50/50 data-[state=open]:border-teal-200 transition-colors"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-gray-900 hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
