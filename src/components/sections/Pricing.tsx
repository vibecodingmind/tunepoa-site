"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
    transition: { staggerChildren: 0.15 },
  },
};

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for individual creators just getting started",
    features: [
      "Up to 10 work registrations/month",
      "Basic blockchain certification",
      "Email infringement alerts",
      "Standard legal documentation",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For serious creators who need comprehensive protection",
    features: [
      "Unlimited work registrations",
      "Advanced blockchain certification",
      "Real-time AI infringement detection",
      "Priority legal documentation",
      "Global protection network",
      "Portfolio analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For organizations and agencies with extensive portfolios",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom API integrations",
      "Bulk registration tools",
      "White-label certificates",
      "Litigation support & legal referrals",
    ],
    popular: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="bg-gray-50 py-20 md:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4 leading-tight">
            Simple, Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your creative needs. All plans include
            our core protection technology.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={fadeInUp}>
              <div
                className={`relative rounded-2xl p-8 h-full transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#042f2e] text-white border-2 border-teal-400/30 shadow-xl shadow-teal-900/20 scale-[1.02]"
                    : "bg-white text-gray-900 border border-gray-200 hover:border-teal-300 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="cta-gradient text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      plan.popular ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span
                    className={`text-4xl font-bold ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.popular ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          plan.popular ? "text-teal-400" : "text-teal-600"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-white/80" : "text-gray-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  className={`w-full font-semibold ${
                    plan.popular
                      ? "cta-gradient text-white border-0 shadow-lg shadow-teal-900/30"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  <a href="#contact">Get Started</a>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
