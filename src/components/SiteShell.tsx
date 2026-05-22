"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [
    { label: "About", href: "/#about" },
    { label: "Benefits", href: "/#benefits" },
    { label: "How It Works", href: "/#steps" },
    { label: "Pricing", href: "/#pricing" },
    { label: "RBTs", href: "/#rbts" },
    { label: "Contact", href: "/#contact" },
  ];
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "navbar-scrolled py-3" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="TunePoa" className="h-10 w-auto group-hover:scale-105 transition-transform duration-500" />
        </a>
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-[13px] text-white/60 hover:text-teal-300 transition-all duration-300 font-medium relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-teal-400 after:to-cyan-400 after:transition-all after:duration-300 hover:after:w-full">
              {link.label}
            </a>
          ))}
          <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-7 rounded-full shadow-lg shadow-teal-500/25 hover:shadow-teal-500/50 transition-all duration-500 hover:scale-105">
            <a href="/#contact">Get Started</a>
          </Button>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          <Button asChild size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold px-5 rounded-full">
            <a href="/#contact">Get Started</a>
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><button className="text-white p-2" aria-label="Toggle menu"><Menu className="w-6 h-6" /></button></SheetTrigger>
            <SheetContent side="right" className="bg-[#060e1a]/95 backdrop-blur-2xl border-teal-900/20 w-72">
              <SheetTitle className="text-white text-lg font-bold mb-6">Menu</SheetTitle>
              <div className="flex flex-col gap-4 mt-4">
                {navLinks.map((link) => (<a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-teal-300 transition-colors text-base font-medium py-1">{link.label}</a>))}
                <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold mt-4 rounded-full"><a href="/#contact" onClick={() => setMobileOpen(false)}>Get Started</a></Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#040810] pt-24 pb-10 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-teal-500/[0.025] rounded-full blur-[80px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-14 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="TunePoa" className="h-9 w-auto" />
            </div>
            <p className="text-white/30 text-sm font-medium leading-relaxed mb-8">Make your callers&apos; wait unique to you. Whether you want a song that defines your mood or a personalized message, our service lets you choose the perfect tone to fit your style.</p>
            <div className="flex items-center gap-3">
              {[{ icon: <Twitter className="w-4 h-4" />, label: "X-twitter" }, { icon: <Linkedin className="w-4 h-4" />, label: "Linkedin" }, { icon: <Facebook className="w-4 h-4" />, label: "Facebook" }, { icon: <Instagram className="w-4 h-4" />, label: "Instagram" }].map((social) => (
                <a key={social.label} href="#" aria-label={social.label} className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all duration-300 hover:scale-110">{social.icon}</a>
              ))}
            </div>
          </div>
          <div>
            <h6 className="text-xs font-bold text-teal-400 tracking-[0.2em] uppercase mb-7">Company</h6>
            <ul className="space-y-4">{[{ name: "About", href: "/#about" }, { name: "Features", href: "/#benefits" }, { name: "Pricing", href: "/#pricing" }, { name: "Why TunePoa", href: "/#steps" }, { name: "Contact", href: "/#contact" }].map((item) => (<li key={item.name}><a href={item.href} className="text-white/30 hover:text-white/70 transition-colors duration-300 text-sm font-medium">{item.name}</a></li>))}</ul>
          </div>
          <div>
            <h6 className="text-xs font-bold text-teal-400 tracking-[0.2em] uppercase mb-7">Product</h6>
            <ul className="space-y-4">{[{ name: "API", href: "#" }, { name: "Partnership", href: "#" }, { name: "Coverage", href: "#" }, { name: "Support Desk", href: "#" }, { name: "Blog", href: "#" }].map((item) => (<li key={item.name}><a href={item.href} className="text-white/30 hover:text-white/70 transition-colors duration-300 text-sm font-medium">{item.name}</a></li>))}</ul>
          </div>
          <div>
            <h6 className="text-xs font-bold text-teal-400 tracking-[0.2em] uppercase mb-7">Other</h6>
            <ul className="space-y-4">{[{ name: "Privacy Policy", href: "/privacy" }, { name: "Terms Of Services", href: "/terms" }, { name: "Refund Policy", href: "/refund" }, { name: "Cookies Policy", href: "/cookies" }, { name: "FAQ", href: "/faq" }].map((item) => (<li key={item.name}><a href={item.href} className="text-white/30 hover:text-white/70 transition-colors duration-300 text-sm font-medium">{item.name}</a></li>))}</ul>
          </div>
        </div>
        <div className="section-divider mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="#" className="text-white/20 text-sm hover:text-white/40 transition-colors font-medium">&copy; Tune Poa 2024 All Rights Reserved.</a>
        </div>
      </div>
    </footer>
  );
}
