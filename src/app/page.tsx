"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Music,
  Megaphone,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Menu,
  ArrowRight,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  CheckCircle2,
  Users,
  Play,
  Pause,
  Phone,
  Sparkles,
  BarChart3,
  Headphones,
  Disc3,
  Clock,
  Zap,
  Globe,
  Send,
  MapPin,
  Mail,
  MessageSquare,
  Rocket,
  ArrowUp,
  Search,
  ShieldCheck,
  AudioLines,
  CalendarClock,
} from "lucide-react";

/* ─── Animated Counter Hook ─── */
function useCountUp(target: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else setCount(target);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, start]);
  return count;
}

/* ─── Animated Stat Card ─── */
function AnimatedStat({ target, suffix, prefix, label, icon }: {
  target: number; suffix?: string; prefix?: string; label: string; icon: React.ReactNode;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const count = useCountUp(target, 2200, inView);
  const display = count.toLocaleString();
  return (
    <div ref={ref} className="glass-card-light rounded-2xl p-7 text-center group">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center text-teal-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <p className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
        {prefix}{display}{suffix}
      </p>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  );
}

/* ─── Music Note Particles ─── */
function MusicParticles() {
  const notes = ["♪", "♫", "♬", "♩", "♪", "♫"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {notes.map((note, i) => (
        <span
          key={i}
          className="absolute text-teal-400/15 text-lg select-none"
          style={{
            left: `${12 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `music-float ${6 + i * 0.8}s ease-in-out ${i * 1.2}s infinite`,
          }}
        >
          {note}
        </span>
      ))}
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Benefits", href: "#benefits" },
    { label: "How It Works", href: "#steps" },
    { label: "Pricing", href: "#pricing-tiers" },
    { label: "Sample Tunes", href: "#rbts" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "navbar-scrolled py-3" : "bg-transparent py-5 sm:py-6"}`}>
      {/* Scroll progress indicator */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between">
        <a href="#" className="flex items-center group shrink-0">
          <img src="/logo.png" alt="TunePoa" className="h-7 sm:h-9 lg:h-10 w-auto max-w-[120px] sm:max-w-none object-contain group-hover:scale-105 transition-transform duration-300" />
        </a>
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-[13px] text-white/60 hover:text-teal-300 transition-all duration-300 font-medium relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-teal-400 after:to-cyan-400 after:transition-all after:duration-300 hover:after:w-full">
              {link.label}
            </a>
          ))}
          <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-7 rounded-full shadow-lg shadow-teal-500/25 hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105">
            <a href="#contact">Get Started</a>
          </Button>
        </div>
        {/* Mobile: Toggle menu */}
        <button className="lg:hidden text-white/70 hover:text-white p-2 -mr-2 rounded-xl hover:bg-white/5 transition-all duration-300" aria-label="Toggle menu" onClick={() => setMobileOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="bg-[#060e1a]/98 backdrop-blur-2xl border-teal-900/20 w-72">
            <div className="flex items-center gap-3 mb-8 pt-1">
              <img src="/logo.png" alt="TunePoa" className="h-7 w-auto max-w-[100px] object-contain" />
              <SheetTitle className="sr-only">TunePoa Navigation Menu</SheetTitle>
            </div>
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="mobile-menu-link text-white/50 hover:text-teal-300 hover:bg-white/5 transition-all duration-300 text-[15px] font-medium py-3 px-4 rounded-xl" style={{ animationDelay: `${i * 0.06}s` }}>
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-7 rounded-full shadow-lg shadow-teal-500/20 transition-all duration-300">
                  <a href="#contact">Get Started</a>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "call-waiting";
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const cursorInterval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(cursorInterval);
  }, [mounted]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grain-overlay">
      <div className="absolute inset-0 bg-[#050c18]" />
      {/* Aurora / mesh gradient background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[5%] right-[5%] w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[150px] animate-aurora" />
        <div className="absolute bottom-[10%] left-[0%] w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[130px] animate-aurora" style={{ animationDelay: "4s" }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-emerald-500/6 rounded-full blur-[100px] animate-aurora" style={{ animationDelay: "8s" }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/70 via-[#081525] to-cyan-950/50" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-[8%] right-[8%] w-[600px] h-[600px] bg-teal-500/[0.06] rounded-full blur-[120px] animate-float animate-morph" />
      <div className="absolute bottom-[5%] left-[3%] w-[500px] h-[500px] bg-cyan-500/[0.05] rounded-full blur-[100px] animate-float animate-morph" style={{ animationDelay: "3s" }} />
      <div className="absolute top-[15%] left-[10%] w-72 h-72 border border-teal-500/[0.04] rounded-full animate-spin-slow" />
      <div className="absolute bottom-[20%] right-[15%] w-96 h-96 border border-cyan-500/[0.03] rounded-full animate-spin-slow" style={{ animationDirection: "reverse" }} />
      <MusicParticles />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 sm:pt-32 pb-20 sm:pb-28 w-full">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          <div>
            <ScrollReveal animation="blur-in" className="inline-block mb-8 sm:mb-10"><div className="gradient-border-animated inline-block"><span>Make It Ring</span></div></ScrollReveal>
            <ScrollReveal animation="reveal-up" stagger={1}>
              <h1 className="text-4xl sm:text-5xl lg:text-[4.2rem] font-extrabold text-white leading-[1.08] sm:leading-[1.06] mb-5 sm:mb-7 tracking-tight">
                Revolutionize<br />
                the{" "}
                <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {mounted ? typedText : "call-waiting"}
                </span>
                {mounted && <span className={`inline-block w-[3px] h-[0.85em] bg-teal-400 ml-1 align-middle transition-opacity duration-100 ${showCursor && typedText.length <= fullText.length ? "opacity-100" : "opacity-0"}`} />}
                <br />
                experience!
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="reveal-up" stagger={2}>
              <p className="text-base sm:text-lg lg:text-xl text-white/45 leading-relaxed mb-8 sm:mb-10 max-w-xl">
                TunePoa&apos;s RBT replaces boring beeps with delightful melodies, transforming call experiences while driving revenue and enhancing satisfaction.
              </p>
            </ScrollReveal>
            <ScrollReveal animation="reveal-up" stagger={3}>
              <div className="flex flex-wrap gap-3 sm:gap-5">
                <Button asChild size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-7 sm:px-9 py-6 sm:py-7 rounded-full shadow-2xl shadow-teal-500/20 hover:shadow-teal-500/40 text-sm sm:text-base group transition-all duration-300 hover:scale-105">
                  <a href="#contact">Get Started <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" /></a>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-white/50 hover:text-white hover:bg-white/5 font-medium px-5 sm:px-7 py-6 sm:py-7 rounded-full border border-white/10 hover:border-white/20 group transition-all duration-300 text-sm sm:text-base">
                  <a href="#rbts">Tune Sample</a>
                </Button>
              </div>
              {/* Social proof line */}
              <div className="flex items-center gap-3 mt-6 sm:mt-8">
                <div className="flex -space-x-2">
                  {["bg-teal-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500"].map((bg, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-[#050c18] flex items-center justify-center text-white text-[9px] font-bold`}>
                      {["TP", "SC", "AK", "VM"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-xs sm:text-sm font-medium">Trusted by <span className="text-teal-400 font-semibold">2,000+</span> businesses across Africa</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right - Dashboard */}
          <ScrollReveal animation="reveal-right" stagger={3} className="hidden lg:block mt-8 lg:mt-0">
            <div className="relative">
              <div className="glass-card rounded-[2rem] p-7 glow-teal animate-pulse-glow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400/70" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="text-white/15 text-xs font-medium tracking-wider">TunePoa Dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Daily Calls", value: "2.8M", change: "+18%", icon: <Phone className="w-4 h-4" /> },
                    { label: "Avg Wait", value: "24s", change: "-35%", icon: <Clock className="w-4 h-4" /> },
                    { label: "Retention", value: "94%", change: "+12%", icon: <Users className="w-4 h-4" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="glass rounded-xl p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-teal-400/50">{stat.icon}</span>
                        <p className="text-white/25 text-[10px] font-medium tracking-wide">{stat.label}</p>
                      </div>
                      <p className="text-white font-bold text-xl tracking-tight">{stat.value}</p>
                      <p className="text-teal-400 text-[10px] font-bold mt-0.5">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/30 text-xs font-medium">Call Engagement</span>
                    <span className="text-teal-400/60 text-[10px] font-medium">Last 7 days</span>
                  </div>
                  <div className="flex items-end gap-2 h-28">
                    {[40, 55, 45, 65, 50, 75, 90].map((h, i) => (
                      <div key={i} className="flex-1 rounded-lg bg-gradient-to-t from-teal-600/20 to-teal-400/40 transition-all duration-300 hover:from-teal-600/40 hover:to-teal-400/70 cursor-pointer animate-chart-grow" style={{ height: `${h}%`, animationDelay: `${0.8 + i * 0.1}s`, transformOrigin: "bottom" }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span key={d} className="text-[9px] text-white/15 flex-1 text-center font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/[0.05] rounded-full blur-[70px]" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/[0.05] rounded-full blur-[60px]" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ─── About Section - Dark Theme ─── */
function AboutSection() {
  const stats = [
    { target: 3, suffix: "K+", label: "Tunes Created", icon: <Disc3 className="w-6 h-6" />, color: "from-teal-500 to-emerald-500" },
    { target: 2, suffix: "K+", label: "Customers", icon: <Users className="w-6 h-6" />, color: "from-cyan-500 to-blue-500" },
    { target: 98, suffix: "%", label: "Satisfaction", icon: <Sparkles className="w-6 h-6" />, color: "from-amber-500 to-orange-500" },
    { target: 24, suffix: "/7", label: "Support", icon: <Headphones className="w-6 h-6" />, color: "from-violet-500 to-purple-500" },
  ];
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const count3 = useCountUp(3, 2200, inView);
  const count2 = useCountUp(2, 2200, inView);
  const count98 = useCountUp(98, 2200, inView);
  const count24 = useCountUp(24, 2200, inView);
  const counts = [count3, count2, count98, count24];

  return (
    <section id="about" ref={sectionRef} className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050c18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 via-[#081525] to-cyan-950/40" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-teal-500/[0.04] rounded-full blur-[120px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-10 sm:mb-14">
          <ScrollReveal animation="blur-in">
            <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2 mb-6 sm:mb-8 border-teal-400/10">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-400 tracking-[0.15em] uppercase">About TunePoa</span>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-5 sm:mb-7 tracking-tight">
              Turn Every Call<br />
              <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">into an Opportunity</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={2}>
            <p className="text-base sm:text-lg text-white/40 leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-5 px-2">
              Our platform allows businesses to replace the traditional ringing sound with personalized music or messages while customers wait on the line.
            </p>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={3}>
            <p className="text-base sm:text-lg text-white/40 leading-relaxed max-w-2xl mx-auto px-2 mb-4">
              This service enhances customer experience, boosts brand visibility, and engages callers with professional, branded content. We help reduce perceived wait times and leave a lasting impression on clients.
            </p>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={4}>
            <a href="#benefits" className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold text-sm transition-colors duration-300 group">
              Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </ScrollReveal>
        </div>
        {/* Horizontal divider above stats */}
        <div className="line-glow mb-10 sm:mb-14" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((stat, i) => (
            <div key={stat.label} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-7 text-center group transition-all duration-300 hover:scale-[1.03] hover:border-white/15">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mx-auto mb-3 sm:mb-5 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                {stat.icon}
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1 sm:mb-1.5">
                {counts[i].toLocaleString()}{stat.suffix}
              </p>
              <p className="text-xs sm:text-sm text-white/40 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Benefits Section ─── */
function BenefitsSection() {
  const benefits = [
    { icon: <Megaphone className="w-7 h-7" />, title: "Enhanced Brand Identity", description: "Customize the ringback tone to reflect your business's personality, making every call a branding opportunity. It's a subtle yet effective way to ensure your brand resonates with customers.", accent: "from-red-500/15 to-orange-500/15", iconColor: "text-red-400", hoverShadow: "group-hover:shadow-red-500/15", num: "01" },
    { icon: <Users className="w-7 h-7" />, title: "Increased Customer Engagement", description: "With a captive audience waiting for their call to connect, RBT ensures your message is heard, keeping customers engaged and more likely to remember your brand.", accent: "from-orange-500/15 to-amber-500/15", iconColor: "text-orange-400", hoverShadow: "group-hover:shadow-orange-500/15", num: "02" },
    { icon: <TrendingUp className="w-7 h-7" />, title: "Cost-Effective Advertising", description: "RBT provides a direct channel to advertise your products or services without costly traditional ad campaigns, ensuring maximum reach at a fraction of the cost.", accent: "from-amber-500/15 to-yellow-500/15", iconColor: "text-amber-400", hoverShadow: "group-hover:shadow-amber-500/15", num: "03" },
    { icon: <Phone className="w-7 h-7" />, title: "Reduced Call Abandonment", description: "Engaging ringback tones keep callers entertained while they wait, significantly reducing hang-ups and abandoned calls that cost your business revenue.", accent: "from-teal-500/15 to-cyan-500/15", iconColor: "text-teal-400", hoverShadow: "group-hover:shadow-teal-500/15", num: "04" },
    { icon: <BarChart3 className="w-7 h-7" />, title: "Real-Time Analytics", description: "Monitor call engagement, tone performance, and listener behavior with our comprehensive analytics dashboard. Make data-driven decisions to optimize your RBT strategy.", accent: "from-cyan-500/15 to-blue-500/15", iconColor: "text-cyan-400", hoverShadow: "group-hover:shadow-cyan-500/15", num: "05" },
    { icon: <Zap className="w-7 h-7" />, title: "Seamless Integration", description: "Connect with your existing PBX, CRM, and telecom infrastructure in minutes. Our API-first approach ensures smooth deployment without disrupting your operations.", accent: "from-emerald-500/15 to-green-500/15", iconColor: "text-emerald-400", hoverShadow: "group-hover:shadow-emerald-500/15", num: "06" },
  ];
  return (
    <section id="benefits" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050c18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 via-[#081525] to-cyan-950/40" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-teal-500/[0.035] rounded-full blur-[100px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center mb-14 sm:mb-20">
          <ScrollReveal animation="reveal-left">
            <div>
              <div className="gradient-border-animated inline-block mb-6 sm:mb-8"><span>Why TunePoa</span></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-5 sm:mb-7 tracking-tight">
                More Than Just <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Music</span>
              </h2>
              <p className="text-base sm:text-lg text-white/40 leading-relaxed mb-8 sm:mb-10">With TunePoa, your ringback tone is not just music — it&apos;s a powerful tool for branding, advertising, and customer engagement.</p>
              <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-9 rounded-full shadow-lg shadow-teal-500/25 group transition-all duration-300 hover:scale-105">
                <a href="#contact">Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" /></a>
              </Button>
            </div>
          </ScrollReveal>
          {/* Right - Photo with gradient overlay + play button hint */}
          <ScrollReveal animation="reveal-right" className="hidden lg:block">
            <div className="relative group cursor-pointer">
              <img src="/images/woman-phone.png" alt="More Than Just Music" className="w-full h-auto object-contain rounded-[2rem]" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-teal-500/30">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
          {benefits.map((benefit, index) => (
            <div key={index} className="glass-card rounded-2xl sm:rounded-[1.5rem] p-6 sm:p-9 group relative">
              <span className="absolute top-5 right-5 text-white/[0.06] text-3xl font-extrabold tracking-tighter select-none">{benefit.num}</span>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.accent} flex items-center justify-center ${benefit.iconColor} mb-7 group-hover:scale-110 group-hover:shadow-lg ${benefit.hoverShadow} transition-all duration-300`}>{benefit.icon}</div>
              <h4 className="text-xl font-bold text-white mb-4 tracking-tight">{benefit.title}</h4>
              <p className="text-white/35 leading-relaxed text-[15px]">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works / Steps Section ─── */
function StepsSection() {
  const steps = [
    { icon: <Disc3 className="w-7 h-7" />, title: "We Script Your Tune", description: "Our creative team crafts the perfect script and composition tailored to your brand.", num: "01" },
    { icon: <Music className="w-7 h-7" />, title: "We Record", description: "Professional studio production with voice artists and crystal-clear audio quality.", num: "02" },
    { icon: <Rocket className="w-7 h-7" />, title: "We Put Live", description: "Instant deployment and activation across all supported telecom networks.", num: "03" },
  ];
  return (
    <section id="steps" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050c18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 via-[#081525] to-cyan-950/40" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-teal-500/[0.035] rounded-full blur-[120px]" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-12 sm:mb-20">
          <ScrollReveal animation="blur-in">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6 sm:mb-8 border-teal-400/10">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-400 tracking-[0.15em] uppercase">Timeline</span>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-5 tracking-tight">
              From Idea to Live in <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={2}>
            <p className="text-base sm:text-lg text-white/35 max-w-2xl mx-auto">We handle everything — you just tell us what you want, and we make it happen.</p>
          </ScrollReveal>
        </div>

        <div className="relative">
          {/* Connecting line - hidden on mobile */}
          <div className="hidden sm:block absolute top-1/2 left-[16.6%] right-[16.6%] h-[2px] -translate-y-1/2 z-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(13,148,136,0.3), rgba(13,148,136,0.3) 8px, transparent 8px, transparent 16px)" }} />
          <div className="grid sm:grid-cols-3 gap-5 sm:gap-8 relative z-10">
            {steps.map((item, i) => (
              <div key={i} className="glass-card rounded-2xl sm:rounded-[1.5rem] p-6 sm:p-8 text-center group transition-all duration-300 hover:scale-[1.02] hover:border-white/15">
                <span className="text-5xl font-extrabold bg-gradient-to-b from-teal-400/20 to-transparent bg-clip-text text-transparent select-none block mb-4">{item.num}</span>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-3 tracking-tight">{item.title}</h4>
                <p className="text-white/35 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Express Through Tones ─── */
function IntegrationsSection() {
  const features = [
    { text: "500+ Licensed Tones", icon: <Music className="w-4 h-4" /> },
    { text: "Custom Voice Messages", icon: <MessageSquare className="w-4 h-4" /> },
    { text: "Time-Based Scheduling", icon: <CalendarClock className="w-4 h-4" /> },
  ];
  return (
    <section id="integrations" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/60 to-white" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[100px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Left - Photo */}
          <ScrollReveal animation="reveal-left" className="hidden lg:block">
            <img src="/images/man-phone.png" alt="Express Through Tones" className="w-full h-auto object-contain rounded-[2rem]" />
          </ScrollReveal>
          {/* Right - Content */}
          <ScrollReveal animation="reveal-right">
            <div>
              <div className="inline-flex items-center gap-2.5 glass-card-light rounded-full px-5 py-2 mb-6 sm:mb-8">
                <AudioLines className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-bold text-teal-600 tracking-[0.15em] uppercase">Express</span>
                {/* Waveform animation */}
                <div className="flex items-center gap-[2px] ml-1">
                  {[8, 14, 10, 16, 6].map((h, i) => (
                    <div key={i} className="w-[2px] rounded-full bg-teal-500/60" style={{ height: `${h}px`, animation: `wave-bar ${0.6 + i * 0.15}s ease-in-out ${i * 0.1}s infinite` }} />
                  ))}
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-5 sm:mb-7 tracking-tight">
                Express Through <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">Tones</span>
              </h3>
              <p className="text-base sm:text-lg text-gray-500/80 leading-relaxed mb-4 sm:mb-5">
                TunePoa enables businesses to enhance their brand identity with custom ringback tones. Personalizing call experiences ensures every interaction is memorable and strengthens brand recognition.
              </p>
              <p className="text-base sm:text-lg text-gray-500/80 leading-relaxed mb-6 sm:mb-8">
                With RBT, businesses can share promotions, updates, or special offers, creating an engaging way to connect with customers while reinforcing their brand message.
              </p>
              {/* Feature checkmarks */}
              <div className="flex flex-col gap-3 mb-8">
                {features.map((feat) => (
                  <div key={feat.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
                      {feat.icon}
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{feat.text}</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-500 ml-auto shrink-0" />
                  </div>
                ))}
              </div>
              <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-9 rounded-full shadow-lg shadow-teal-500/20 group transition-all duration-300 hover:scale-105">
                <a href="#contact">Get Started <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" /></a>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Telecom Integrations Section ─── */
function TelecomIntegrationsSection() {
  const providers = [
    { name: "Vodacom", logo: "/images/logo-vodacom.png" },
    { name: "Safaricom", logo: "/images/logo-safaricom.png" },
    { name: "Airtel", logo: "/images/logo-airtel.png" },
    { name: "Telkom", logo: "/images/logo-telkom.png" },
    { name: "MANGO 4G", logo: "/images/logo-mango.png" },
    { name: "Maroc Telecom", logo: "/images/logo-maroc.png" },
  ];
  return (
    <section id="telecom-integrations" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050c18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/50 via-[#081525] to-cyan-950/30" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[120px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-12 sm:mb-20">
          <ScrollReveal animation="blur-in">
            <div className="gradient-border-animated inline-block mb-6 sm:mb-8"><span>Integrations</span></div>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-5 tracking-tight">
              Stable Ringback Tones<br /><span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Across Africa</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={2}>
            <p className="text-base sm:text-lg text-white/35 max-w-2xl mx-auto mb-6">Seamlessly integrated with Africa&apos;s leading telecom networks for reliable, crystal-clear ringback tone delivery.</p>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={3}>
            <div className="inline-flex items-center gap-2 pro-badge">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>6+ Networks</span>
            </div>
          </ScrollReveal>
        </div>
        {/* Logo Slider */}
        <div className="relative overflow-hidden">
          <div className="flex animate-slide gap-10 items-center w-max">
            {[...providers, ...providers].map((provider, i) => (
              <div key={`${provider.name}-${i}`} className="telecom-card rounded-2xl px-8 py-5 border border-white/10 backdrop-blur-md bg-transparent flex flex-col items-center gap-3 flex-shrink-0">
                <img src={provider.logo} alt={provider.name} className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300" />
                <span className="text-white/20 text-[9px] font-bold uppercase tracking-[0.15em] flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Tiers Section ─── */
function PricingTiersSection() {
  const durations = [
    { label: "1 Month", badge: null },
    { label: "3 Months", badge: "Popular" },
    { label: "6 Months", badge: null },
    { label: "12 Months", badge: "Best Value" },
  ];

  const tiers = [
    { lines: "1–10", prices: ["25,000", "23,000", "21,000", "19,000"] },
    { lines: "11–25", prices: ["23,000", "21,000", "19,000", "17,000"] },
    { lines: "25–50", prices: ["21,000", "19,000", "17,000", "15,000"] },
    { lines: "50+", prices: ["19,000", "17,000", "15,000", "13,000"] },
  ];

  return (
    <section id="pricing-tiers" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050c18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/50 via-[#081525] to-cyan-950/30" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-[5%] left-[15%] w-[600px] h-[600px] bg-teal-500/[0.02] rounded-full blur-[160px]" />
      <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] bg-cyan-500/[0.02] rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
          <ScrollReveal animation="blur-in">
            <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 mb-6 sm:mb-8 border-teal-400/10">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-400 tracking-[0.15em] uppercase">Pricing</span>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-extrabold text-white leading-[1.08] mb-4 sm:mb-6 tracking-tight">
              Simple, Transparent<br /><span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Per-Line Pricing</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={2}>
            <p className="text-base sm:text-lg text-white/30 max-w-lg mx-auto">Commit longer, pay less. Every line includes full RBT service with no hidden fees.</p>
          </ScrollReveal>
        </div>

        {/* Pricing Table */}
        <ScrollReveal animation="reveal-up" stagger={2}>
          <div className="relative">
            {/* Subtle glow border */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/[0.06] via-transparent to-white/[0.04] rounded-[2rem] sm:rounded-[2.5rem]" />
            <div className="relative bg-[#080f1e]/95 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/[0.05]">

              {/* Column Headers */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-7 sm:py-9 px-6 sm:px-8">
                        <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Lines</span>
                      </th>
                      {durations.map((dur) => (
                        <th key={dur.label} className="py-7 sm:py-9 px-2 sm:px-4 text-center relative">
                          <div className="flex flex-col items-center gap-2">
                            {dur.badge ? (
                              <span className={`text-[8px] font-extrabold uppercase tracking-[0.25em] px-3 py-1 rounded-full ${
                                dur.badge === "Popular"
                                  ? "text-teal-300 bg-teal-400/[0.12] ring-1 ring-teal-400/20"
                                  : "text-emerald-300 bg-emerald-400/[0.12] ring-1 ring-emerald-400/20"
                              }`}>
                                {dur.badge}
                              </span>
                            ) : <div className="h-[22px]" />}
                            <span className="text-white/50 text-xs sm:text-sm font-semibold tracking-wide">{dur.label}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {tiers.map((tier, idx) => (
                      <tr
                        key={tier.lines}
                        className={`group transition-all duration-300 ${
                          idx !== tiers.length - 1 ? "border-b border-white/[0.04]" : ""
                        } hover:bg-white/[0.03]`}
                      >
                        <td className="py-5 sm:py-7 px-6 sm:px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 opacity-30 group-hover:opacity-80 transition-opacity duration-300" />
                            <span className="text-white/50 font-semibold text-sm group-hover:text-white/70 transition-colors duration-300">
                              {tier.lines} <span className="hidden sm:inline text-white/20">lines</span>
                            </span>
                          </div>
                        </td>
                        {tier.prices.map((price, colIdx) => {
                          const isPopular = durations[colIdx]?.badge === "Popular";
                          const isBestValue = durations[colIdx]?.badge === "Best Value";
                          return (
                            <td key={colIdx} className="py-5 sm:py-7 px-2 sm:px-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`font-bold text-base sm:text-lg tracking-tight ${
                                  isBestValue
                                    ? "text-emerald-300"
                                    : isPopular
                                    ? "text-teal-300"
                                    : "text-white/80"
                                }`}>
                                  {price}
                                </span>
                                <span className="text-white/15 text-[9px] font-medium mt-0.5">TZS</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audio Recording Row */}
              <div className="border-t border-white/[0.06]">
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/[0.08] flex items-center justify-center">
                      <AudioLines className="w-4 h-4 text-violet-400/80" />
                    </div>
                    <span className="text-white/50 font-semibold text-sm">Audio Recording</span>
                    <span className="text-[8px] font-bold text-violet-400/50 bg-violet-400/[0.06] px-2.5 py-0.5 rounded-full hidden sm:inline uppercase tracking-wider">one-time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 font-bold text-lg tracking-tight">50,000</span>
                    <span className="text-white/15 text-xs font-medium">TZS</span>
                    <span className="text-[8px] font-bold text-violet-400/50 bg-violet-400/[0.06] px-2.5 py-0.5 rounded-full sm:hidden uppercase tracking-wider">one-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Starter Package */}
        <ScrollReveal animation="reveal-up" stagger={3}>
          <div className="mt-6 sm:mt-8">
            <div className="relative">
              {/* Animated glow border */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/25 via-orange-500/15 to-rose-500/25 rounded-[1.75rem] sm:rounded-[2rem] animate-pulse-glow" />
              <div className="relative bg-[#0b1320]/95 backdrop-blur-2xl rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border border-amber-500/[0.08]">
                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] bg-amber-500/[0.04] rounded-full blur-[100px]" />

                <div className="relative z-10 px-6 sm:px-8 lg:px-10 py-7 sm:py-9">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
                    {/* Left - Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/15">
                          Starter Package
                        </div>
                        <div className="text-[9px] font-extrabold text-rose-400 bg-rose-400/[0.08] px-3 py-1.5 rounded-full ring-1 ring-rose-400/15">SAVE 40%</div>
                      </div>
                      <div className="flex items-baseline gap-3 mb-5">
                        <span className="text-white/15 text-lg sm:text-xl font-bold line-through decoration-1">125,000</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl sm:text-[3.25rem] font-extrabold text-white tracking-tighter leading-none">75,000</span>
                          <span className="text-white/25 text-sm font-semibold">TZS</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                        {[
                          { icon: <Clock className="w-3.5 h-3.5" />, text: "3 Months" },
                          { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: "No Setup Fees" },
                          { icon: <AudioLines className="w-3.5 h-3.5" />, text: "Free Audio Recording" },
                        ].map((f) => (
                          <div key={f.text} className="flex items-center gap-2">
                            <span className="text-amber-500/60">{f.icon}</span>
                            <span className="text-white/40 text-xs sm:text-sm font-medium">{f.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right - CTA */}
                    <div className="shrink-0 w-full lg:w-auto">
                      <Button asChild size="lg" className="w-full lg:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-8 sm:px-12 py-6 sm:py-7 rounded-2xl shadow-xl shadow-amber-500/15 hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.03] text-sm sm:text-base">
                        <a href="#contact">Get Started <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" /></a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Testimonials Carousel ─── */
function TestimonialsSection() {
  const testimonials = [
    { quote: "TunePoa transformed how our customers perceive wait times. Since implementing custom ringback tones, we've seen a 40% increase in caller retention and our brand recognition has skyrocketed.", name: "Grace Odhiambo", title: "Marketing Director, TelcoPlus", avatar: "GO" },
    { quote: "The ROI on TunePoa's RBT service is incredible. We replaced expensive radio ads with targeted ringback tones and reached more customers at a fraction of the cost.", name: "James Mwangi", title: "CEO, SwiftConnect", avatar: "JM" },
    { quote: "Setting up TunePoa was seamless. Within a day, our entire fleet of business lines had professional branded tones. The analytics dashboard gives us real insight.", name: "Amina Hassan", title: "Operations Manager, AfriCall", avatar: "AH" },
    { quote: "Working with Vodacom through TunePoa has been a game-changer. The network reliability combined with beautiful ringback tones has elevated our entire customer experience.", name: "David Kimani", title: "CTO, NetWave Solutions", avatar: "DK" },
    { quote: "Our callers used to hang up after 20 seconds. Now with custom RBT, they stay on the line 3x longer. TunePoa turned our hold time into a marketing channel.", name: "Sarah Ndegwa", title: "VP Marketing, CloudTel", avatar: "SN" },
    { quote: "The tone library is incredible — over 500 options. We rotate seasonal tones automatically and our customers love the fresh experience every time they call.", name: "Peter Okafor", title: "Brand Manager, AfriNet", avatar: "PO" },
    { quote: "TunePoa's API made integration with our existing PBX system effortless. We had 200 lines running custom tones within 48 hours of signing up.", name: "Fatima Abubakar", title: "IT Director, SaharaConnect", avatar: "FA" },
    { quote: "As a Vodacom partner ourselves, TunePoa's deep integration with their network ensures crystal-clear audio quality on every single call. Highly recommended.", name: "Michael Banda", title: "Operations Lead, VodaBiz", avatar: "MB" },
    { quote: "We switched from a competitor and the difference is night and day. TunePoa's scheduling feature lets us run promotional tones during peak hours and relaxing music after hours — brilliant.", name: "Rachel Mtero", title: "Head of CX, PamojaBank", avatar: "RM" },
  ];

  const [current, setCurrent] = useState(0);
  const itemsPerView = 3;
  const totalSlides = Math.ceil(testimonials.length / itemsPerView);

  const next = useCallback(() => setCurrent((c) => (c + 1) % totalSlides), [totalSlides]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + totalSlides) % totalSlides), [totalSlides]);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  const visibleTestimonials = testimonials.slice(current * itemsPerView, current * itemsPerView + itemsPerView);

  return (
    <section id="testimonials" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-teal-50/15 to-white" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-teal-100/20 rounded-full blur-[100px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 sm:mb-16">
          <ScrollReveal animation="reveal-left">
            <div>
              <div className="inline-flex items-center gap-2.5 glass-card-light rounded-full px-5 py-2 mb-5 sm:mb-8">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-bold text-teal-600 tracking-[0.15em] uppercase">Testimonials</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                Loved by Businesses <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">Across Africa</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="flex items-center gap-3 mt-6 sm:mt-0">
            <button onClick={prev} className="w-12 h-12 rounded-full glass-card-light flex items-center justify-center text-gray-400 hover:text-teal-600 transition-all duration-300 hover:scale-105" aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="w-12 h-12 rounded-full glass-card-light flex items-center justify-center text-gray-400 hover:text-teal-600 transition-all duration-300 hover:scale-105" aria-label="Next">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7 transition-all duration-500">
          {visibleTestimonials.map((testimonial) => (
            <div key={testimonial.name} className="glass-card-light rounded-2xl sm:rounded-[1.5rem] p-6 sm:p-9 group relative">
              {/* Decorative quote icon */}
              <span className="absolute top-5 right-6 text-teal-500/10 text-6xl font-serif leading-none select-none">&ldquo;</span>
              {/* Star ratings */}
              <div className="flex items-center gap-1.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                ))}
              </div>
              <p className="text-gray-500 leading-relaxed mb-8 text-[15px]">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-500/20">{testimonial.avatar}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-gray-400 text-xs font-medium">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-gradient-to-r from-teal-500 to-cyan-500" : "w-2 bg-gray-300 hover:bg-gray-400"}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Popular RBTs - Industry Categories ─── */
function RBTsSection() {
  const [activeCategory, setActiveCategory] = useState("Hospitality");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const categories = [
    { name: "Hospitality", icon: <Sparkles className="w-4 h-4" />, color: "from-amber-500 to-orange-600" },
    { name: "Healthcare", icon: <Headphones className="w-4 h-4" />, color: "from-emerald-500 to-teal-600" },
    { name: "Finance", icon: <BarChart3 className="w-4 h-4" />, color: "from-blue-500 to-indigo-600" },
    { name: "Corporate", icon: <Megaphone className="w-4 h-4" />, color: "from-pink-500 to-rose-600" },
    { name: "Education", icon: <Globe className="w-4 h-4" />, color: "from-violet-500 to-purple-600" },
  ];

  const albumGradients = [
    "from-amber-600/40 to-orange-800/40",
    "from-emerald-600/40 to-teal-800/40",
    "from-blue-600/40 to-indigo-800/40",
    "from-pink-600/40 to-rose-800/40",
    "from-violet-600/40 to-purple-800/40",
  ];

  const tones = [
    { name: "Serenity Hotels", sub: "Hotel", category: "Hospitality", duration: "0:30", color: "from-amber-500 to-orange-600", waveformHeights: [30, 55, 40, 70, 45, 65, 35, 80, 50, 60, 40, 75, 55, 45, 70, 35, 65, 50, 40, 60] },
    { name: "QuickBite TZ", sub: "Fast Food", category: "Hospitality", duration: "0:25", color: "from-amber-500 to-orange-600", waveformHeights: [45, 70, 35, 65, 80, 40, 75, 55, 65, 45, 80, 35, 60, 70, 50, 65, 40, 75, 55, 45] },
    { name: "Zanzibar Resorts", sub: "Resort", category: "Hospitality", duration: "0:20", color: "from-amber-500 to-orange-600", waveformHeights: [35, 60, 50, 70, 40, 75, 55, 65, 45, 80, 35, 60, 50, 70, 40, 55, 65, 45, 75, 55] },
    { name: "Java House", sub: "Cafe", category: "Hospitality", duration: "0:30", color: "from-amber-500 to-orange-600", waveformHeights: [25, 45, 60, 35, 55, 70, 40, 65, 50, 30, 55, 70, 45, 60, 35, 50, 65, 40, 55, 30] },
    { name: "Moyo Safari Lodge", sub: "Safari", category: "Hospitality", duration: "0:25", color: "from-amber-500 to-orange-600", waveformHeights: [50, 75, 60, 45, 80, 35, 70, 55, 65, 40, 75, 50, 60, 70, 45, 80, 35, 65, 55, 70] },
    { name: "CloudNine Spa", sub: "Spa & Wellness", category: "Hospitality", duration: "0:20", color: "from-amber-500 to-orange-600", waveformHeights: [40, 55, 65, 45, 70, 50, 60, 35, 75, 55, 45, 65, 40, 55, 70, 50, 60, 45, 55, 35] },
    { name: "Aga Khan Hospital", sub: "Hospital", category: "Healthcare", duration: "0:30", color: "from-emerald-500 to-teal-600", waveformHeights: [35, 60, 50, 70, 40, 75, 55, 65, 45, 80, 35, 60, 50, 70, 40, 55, 65, 45, 75, 55] },
    { name: "CarePoint Clinic", sub: "Clinic", category: "Healthcare", duration: "0:25", color: "from-emerald-500 to-teal-600", waveformHeights: [25, 45, 60, 35, 55, 70, 40, 65, 50, 30, 55, 70, 45, 60, 35, 50, 65, 40, 55, 30] },
    { name: "MedPlus Pharmacy", sub: "Pharmacy", category: "Healthcare", duration: "0:20", color: "from-emerald-500 to-teal-600", waveformHeights: [40, 55, 65, 45, 70, 50, 60, 35, 75, 55, 45, 65, 40, 55, 70, 50, 60, 45, 55, 35] },
    { name: "SmileCare Dental", sub: "Dental", category: "Healthcare", duration: "0:30", color: "from-emerald-500 to-teal-600", waveformHeights: [50, 75, 60, 45, 80, 35, 70, 55, 65, 40, 75, 50, 60, 70, 45, 80, 35, 65, 55, 70] },
    { name: "VisionFirst Opticals", sub: "Optical", category: "Healthcare", duration: "0:25", color: "from-emerald-500 to-teal-600", waveformHeights: [30, 55, 40, 70, 45, 65, 35, 80, 50, 60, 40, 75, 55, 45, 70, 35, 65, 50, 40, 60] },
    { name: "Zen Wellness Center", sub: "Wellness", category: "Healthcare", duration: "0:20", color: "from-emerald-500 to-teal-600", waveformHeights: [45, 70, 35, 65, 80, 40, 75, 55, 65, 45, 80, 35, 60, 70, 50, 65, 40, 75, 55, 45] },
    { name: "CRDB Bank", sub: "Bank", category: "Finance", duration: "0:30", color: "from-blue-500 to-indigo-600", waveformHeights: [50, 75, 60, 45, 80, 35, 70, 55, 65, 40, 75, 50, 60, 70, 45, 80, 35, 65, 55, 70] },
    { name: "Azania Insurance", sub: "Insurance", category: "Finance", duration: "0:25", color: "from-blue-500 to-indigo-600", waveformHeights: [40, 55, 65, 45, 70, 50, 60, 35, 75, 55, 45, 65, 40, 55, 70, 50, 60, 45, 55, 35] },
    { name: "PesaPal Microfinance", sub: "Microfinance", category: "Finance", duration: "0:20", color: "from-blue-500 to-indigo-600", waveformHeights: [35, 60, 50, 70, 40, 75, 55, 65, 45, 80, 35, 60, 50, 70, 40, 55, 65, 45, 75, 55] },
    { name: "DarCapital Investments", sub: "Investment", category: "Finance", duration: "0:30", color: "from-blue-500 to-indigo-600", waveformHeights: [30, 55, 40, 70, 45, 65, 35, 80, 50, 60, 40, 75, 55, 45, 70, 35, 65, 50, 40, 60] },
    { name: "SwiftRemit", sub: "Remittance", category: "Finance", duration: "0:25", color: "from-blue-500 to-indigo-600", waveformHeights: [25, 45, 60, 35, 55, 70, 40, 65, 50, 30, 55, 70, 45, 60, 35, 50, 65, 40, 55, 30] },
    { name: "TrustAudit Co.", sub: "Audit Firm", category: "Finance", duration: "0:20", color: "from-blue-500 to-indigo-600", waveformHeights: [45, 70, 35, 65, 80, 40, 75, 55, 65, 45, 80, 35, 60, 70, 50, 65, 40, 75, 55, 45] },
    { name: "Vodacom Tanzania", sub: "Telecom", category: "Corporate", duration: "0:30", color: "from-pink-500 to-rose-600", waveformHeights: [55, 75, 40, 60, 80, 50, 70, 45, 65, 55, 75, 35, 60, 80, 50, 70, 40, 65, 55, 75] },
    { name: "Twiga Foods", sub: "Logistics", category: "Corporate", duration: "0:25", color: "from-pink-500 to-rose-600", waveformHeights: [40, 60, 50, 70, 35, 65, 55, 75, 45, 60, 40, 70, 55, 65, 35, 75, 50, 60, 45, 55] },
    { name: "SaharaTech Solutions", sub: "IT Services", category: "Corporate", duration: "0:20", color: "from-pink-500 to-rose-600", waveformHeights: [35, 55, 70, 45, 60, 75, 40, 65, 55, 45, 70, 50, 60, 75, 40, 55, 65, 50, 70, 45] },
    { name: "KPMG East Africa", sub: "Consulting", category: "Corporate", duration: "0:30", color: "from-pink-500 to-rose-600", waveformHeights: [30, 50, 65, 40, 55, 70, 45, 60, 35, 75, 50, 65, 40, 55, 70, 45, 60, 50, 35, 65] },
    { name: "SimbaLogistics", sub: "Transport", category: "Corporate", duration: "0:25", color: "from-pink-500 to-rose-600", waveformHeights: [50, 75, 60, 45, 80, 35, 70, 55, 65, 40, 75, 50, 60, 70, 45, 80, 35, 65, 55, 70] },
    { name: "Orbit Advertising", sub: "Agency", category: "Corporate", duration: "0:20", color: "from-pink-500 to-rose-600", waveformHeights: [45, 70, 35, 65, 80, 40, 75, 55, 65, 45, 80, 35, 60, 70, 50, 65, 40, 75, 55, 45] },
    { name: "University of Dar", sub: "University", category: "Education", duration: "0:30", color: "from-violet-500 to-purple-600", waveformHeights: [35, 55, 70, 45, 60, 75, 40, 65, 55, 45, 70, 50, 60, 75, 40, 55, 65, 50, 70, 45] },
    { name: "BrightPath Academy", sub: "Academy", category: "Education", duration: "0:25", color: "from-violet-500 to-purple-600", waveformHeights: [30, 50, 65, 40, 55, 70, 45, 60, 35, 75, 50, 65, 40, 55, 70, 45, 60, 50, 35, 65] },
    { name: "eLearn Africa", sub: "E-Learning", category: "Education", duration: "0:20", color: "from-violet-500 to-purple-600", waveformHeights: [50, 75, 60, 45, 80, 35, 70, 55, 65, 40, 75, 50, 60, 70, 45, 80, 35, 65, 55, 70] },
    { name: "Kiswahili Institute", sub: "Language School", category: "Education", duration: "0:30", color: "from-violet-500 to-purple-600", waveformHeights: [40, 60, 50, 70, 35, 65, 55, 75, 45, 60, 40, 70, 55, 65, 35, 75, 50, 60, 45, 55] },
    { name: "TechBridge Bootcamp", sub: "Bootcamp", category: "Education", duration: "0:25", color: "from-violet-500 to-purple-600", waveformHeights: [25, 45, 60, 35, 55, 70, 40, 65, 50, 30, 55, 70, 45, 60, 35, 50, 65, 40, 55, 30] },
    { name: "Nuru School", sub: "Primary School", category: "Education", duration: "0:20", color: "from-violet-500 to-purple-600", waveformHeights: [45, 70, 35, 65, 80, 40, 75, 55, 65, 45, 80, 35, 60, 70, 50, 65, 40, 75, 55, 45] },
  ];

  const filteredTones = tones.filter((t) => t.category === activeCategory);
  const handlePlay = (index: number) => setPlayingIndex(playingIndex === index ? null : index);
  const catIndex = categories.findIndex((c) => c.name === activeCategory);

  return (
    <section id="rbts" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050c18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-[#081525] to-cyan-950/30" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/[0.035] rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/[0.025] rounded-full blur-[80px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-10 sm:mb-16">
          <ScrollReveal animation="blur-in">
            <div className="gradient-border-animated inline-block mb-6 sm:mb-8"><span>Ringback Tones</span></div>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-5 tracking-tight">
              RBT Samples by <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Industry</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={2}>
            <p className="text-base sm:text-lg text-white/35 max-w-2xl mx-auto">Explore ringback tones tailored for your industry. Hit play to preview.</p>
          </ScrollReveal>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-14">
          {categories.map((cat) => (
            <button key={cat.name} onClick={() => { setActiveCategory(cat.name); setPlayingIndex(null); }} className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${activeCategory === cat.name ? `bg-gradient-to-r ${cat.color} text-white shadow-lg` : "glass text-white/40 hover:text-white/70 hover:bg-white/10"}`}>
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTones.map((tone, index) => (
            <div key={tone.name} className={`glass-card rounded-[1.5rem] p-6 group cursor-pointer transition-all duration-300 ${playingIndex === index ? "border-teal-400/25 scale-[1.02]" : ""}`} onClick={() => handlePlay(index)}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-400/70 bg-teal-400/10 px-3 py-1 rounded-full">{tone.sub}</span>
                <span className="text-white/20 text-xs font-medium">{tone.duration}</span>
              </div>
              {/* Album art + Now Playing */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${albumGradients[catIndex] ?? albumGradients[0]} flex items-center justify-center`}>
                    <Music className="w-5 h-5 text-white/60" />
                  </div>
                  {playingIndex === index && (
                    <div className="absolute -bottom-1 -right-1 flex items-end gap-[2px]">
                      {[6, 10, 7].map((h, i) => (
                        <div key={i} className="now-playing-bar playing" style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white truncate tracking-tight">{tone.name}</h4>
                  </div>
                  {playingIndex === index && (
                    <span className="text-teal-400 text-[10px] font-bold uppercase tracking-wider">Now Playing</span>
                  )}
                </div>
                <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${playingIndex === index ? "bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30 scale-110" : "glass hover:bg-white/10 hover:scale-105"}`} onClick={(e) => { e.stopPropagation(); handlePlay(index); }}>
                  {playingIndex === index ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                </button>
              </div>
              <div className="flex items-center gap-[3px] h-8">
                {tone.waveformHeights.map((h, i) => (
                  <div key={i} className={`waveform-bar flex-1 transition-all duration-300 ${playingIndex === index ? "playing" : ""}`} style={{
                    height: playingIndex === index ? undefined : `${h}%`,
                    animationDelay: playingIndex === index ? `${i * 0.06}s` : undefined,
                    background: playingIndex === index ? "linear-gradient(to top, rgba(13, 148, 136, 0.5), rgba(45, 212, 191, 0.8))" : "linear-gradient(to top, rgba(255,255,255,0.05), rgba(255,255,255,0.15))",
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ Section ─── */
function FAQSection() {
  const faqs = [
    { q: "What is a Ringback Tone (RBT)?", a: "A Ringback Tone is the sound that callers hear while waiting for their call to be answered. Instead of the standard ringing sound, RBT replaces it with music, messages, or any audio content of your choice." },
    { q: "How does TunePoa's RBT service work?", a: "TunePoa allows businesses to select or upload custom audio content that plays for callers while they wait. Simply choose from our extensive tone library or upload your own branded content, assign it to your business lines, and your callers will enjoy a personalized waiting experience immediately." },
    { q: "Can I customize the ringback tone for different callers?", a: "Yes! TunePoa supports time-based and caller-group-based tone scheduling. You can set different tones for different times of day, specific caller groups, or even run promotional campaigns that rotate automatically." },
    { q: "What types of audio content can I use?", a: "You can use music tracks from our licensed library, custom voice messages, promotional content, seasonal greetings, or any professionally produced audio. Our platform supports all standard audio formats." },
    { q: "How quickly can I get started?", a: "Getting started takes just minutes. Sign up, select your plan, choose or upload your tones, and assign them to your business lines. Our team is also available to help with setup." },
    { q: "Is the service compatible with all telecom networks?", a: "TunePoa integrates with all major telecom networks. As a Vodacom core partner, we ensure seamless deployment regardless of your carrier, handling all technical integration on our end." },
  ];
  return (
    <section id="faq" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/40 to-white" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-teal-100/15 rounded-full blur-[120px]" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-10 sm:mb-16">
          <ScrollReveal animation="blur-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-3 sm:mb-4 tracking-tight">Frequently asked questions</h2>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={1}>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5 mb-2"><Search className="w-4 h-4" />Common Questions</p>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={2}>
            <p className="text-base sm:text-lg text-gray-400">Still have more questions? Don&apos;t hesitate to <a href="#contact" className="text-teal-600 font-semibold hover:text-teal-700 underline underline-offset-4 decoration-teal-300/30 hover:decoration-teal-400 transition-all">contact us</a>!</p>
          </ScrollReveal>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass-card-light rounded-2xl px-7 overflow-hidden data-[state=open]:border-teal-200/50 data-[state=open]:faq-item-open">
              <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-teal-600 hover:no-underline py-6 text-[15px]">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed pb-6">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ─── Contact Section - With Form ─── */
function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`New Inquiry from ${formData.name} — TunePoa`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}\nCompany: ${formData.company || "Not provided"}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:hello@tunepoa.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
      setSent(false);
    }, 3000);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050c18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 via-[#081525] to-cyan-950/40" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-teal-500/[0.04] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <ScrollReveal animation="blur-in">
            <div className="gradient-border-animated inline-block mb-6 sm:mb-8"><span>Contact Us</span></div>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-5 tracking-tight">
              Let&apos;s Make Your <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Calls Memorable</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="reveal-up" stagger={2}>
            <p className="text-base sm:text-lg text-white/40 leading-relaxed max-w-2xl mx-auto">
              Ready to transform your call-waiting experience? Get in touch and we&apos;ll help you find the perfect ringback tone solution for your business.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 items-stretch">
          {/* Left - Info Card */}
          <ScrollReveal animation="reveal-left" className="lg:col-span-2">
            <div className="glass-card rounded-[1.5rem] p-6 sm:p-8 h-full flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Get in Touch</h3>
              <div className="space-y-5 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wider mb-0.5">Email</p>
                    <a href="mailto:hello@tunepoa.com" className="text-white/70 hover:text-teal-300 transition-colors text-sm font-medium">hello@tunepoa.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wider mb-0.5">Phone</p>
                    <a href="tel:+255123456789" className="text-white/70 hover:text-teal-300 transition-colors text-sm font-medium">+255 123 456 789</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-white/70 text-sm font-medium">Dar es Salaam, Tanzania</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wider mb-0.5">Live Chat</p>
                    <p className="text-white/70 text-sm font-medium">We respond within minutes</p>
                  </div>
                </div>
              </div>
              <div className="line-glow mt-6 mb-5" />
              <p className="text-white/25 text-xs leading-relaxed">
                Our team is available Monday to Friday, 8 AM - 6 PM (EAT). We typically respond within a few hours.
              </p>
            </div>
          </ScrollReveal>

          {/* Right - Form Card */}
          <ScrollReveal animation="reveal-right" className="lg:col-span-3">
            <div className="glass-card rounded-[1.5rem] p-6 sm:p-8 lg:p-10 h-full">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/20">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Opening Email Client!</h3>
                  <p className="text-white/40 leading-relaxed">Your email app should open now with the message pre-filled. Just hit send!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 block">Full Name *</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-400/40 focus:bg-white/[0.06] transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 block">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@company.com"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-400/40 focus:bg-white/[0.06] transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 block">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+255 123 456 789"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-400/40 focus:bg-white/[0.06] transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 block">Company</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Your Company"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-400/40 focus:bg-white/[0.06] transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 block">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your ringback tone needs..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-400/40 focus:bg-white/[0.06] transition-all duration-300 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold py-4 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Send Message <Send className="w-4 h-4" />
                    </span>
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#040810] pt-16 sm:pt-24 pb-8 sm:pb-10 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-teal-500/[0.025] rounded-full blur-[80px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-14 mb-14 sm:mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="TunePoa" className="h-9 w-auto" />
            </div>
            <p className="text-white/30 text-sm font-medium leading-relaxed mb-8 max-w-xs">Make your callers&apos; wait unique to you. Whether you want a song that defines your mood or a personalized message, our service lets you choose the perfect tone to fit your style.</p>
            {/* Newsletter signup */}
            <div className="mb-6">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Stay Updated</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-400/40 transition-all duration-300"
                />
                <Button type="submit" size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold rounded-lg px-4 shrink-0 transition-all duration-300">
                  {subscribed ? "✓" : "Subscribe"}
                </Button>
              </form>
            </div>
            <div className="flex items-center gap-3">
              {[{ icon: <Facebook className="w-4 h-4" />, label: "Facebook", href: "https://www.facebook.com/tunepoa" }, { icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn", href: "https://www.linkedin.com/company/tunepoa" }, { icon: <Instagram className="w-4 h-4" />, label: "Instagram", href: "https://www.instagram.com/tunepoa" }, { icon: <Twitter className="w-4 h-4" />, label: "X", href: "#" }].map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all duration-300 hover:scale-110">{social.icon}</a>
              ))}
            </div>
          </div>
          <div>
            <h6 className="text-xs font-bold text-teal-400 tracking-[0.2em] uppercase mb-7">Company</h6>
            <ul className="space-y-4">{["About", "Features", "Pricing", "Why TunePoa", "Contact"].map((item) => (<li key={item}><a href="#" className="text-white/30 hover:text-white/70 transition-colors duration-300 text-sm font-medium">{item}</a></li>))}</ul>
          </div>
          <div>
            <h6 className="text-xs font-bold text-teal-400 tracking-[0.2em] uppercase mb-7">Product</h6>
            <ul className="space-y-4">{["API", "Partnership", "Coverage", "Support Desk", "Blog"].map((item) => (<li key={item}><a href="#" className="text-white/30 hover:text-white/70 transition-colors duration-300 text-sm font-medium">{item}</a></li>))}</ul>
          </div>
          <div>
            <h6 className="text-xs font-bold text-teal-400 tracking-[0.2em] uppercase mb-7">Legal</h6>
            <ul className="space-y-4">{[{ name: "Privacy Policy", href: "/privacy" }, { name: "Terms Of Services", href: "/terms" }, { name: "Refund Policy", href: "/refund" }, { name: "Cookies Policy", href: "/cookies" }, { name: "FAQ", href: "/faq" }].map((item) => (<li key={item.name}><a href={item.href} className="text-white/30 hover:text-white/70 transition-colors duration-300 text-sm font-medium">{item.name}</a></li>))}</ul>
          </div>
        </div>
        <div className="section-divider mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="#" className="text-white/20 text-xs sm:text-sm hover:text-white/40 transition-colors font-medium">&copy; {new Date().getFullYear()} Tune Poa. All Rights Reserved.</a>
          <button onClick={scrollToTop} className="flex items-center gap-2 text-white/20 hover:text-teal-400 text-xs font-medium transition-colors duration-300 group" aria-label="Back to top">
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <div>
        <HeroSection />
        <AboutSection />
        <BenefitsSection />
        <StepsSection />
        <IntegrationsSection />
        <TelecomIntegrationsSection />
        <PricingTiersSection />
        <TestimonialsSection />
        <RBTsSection />
        <FAQSection />
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
}
