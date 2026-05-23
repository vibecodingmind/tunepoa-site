"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Music,
  LogOut,
  Loader2,
  Phone,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  Save,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  CreditCard,
  RefreshCw,
  Globe,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n-context";
import NotificationBell from "@/components/NotificationBell";

/* ─── Types ─── */
interface PackageItem {
  id: string;
  category: string;
  tier: string;
  name: string;
  maxPhoneNumbers: number;
  features: string;
  price3mo: number;
  price6mo: number;
  price12mo: number;
  popular: boolean;
}

interface AssignedNumberItem {
  id: string;
  phoneNumber: string;
  toneName: string | null;
  toneCategory: string | null;
  status: string;
  assignedAt: string;
  subscription: {
    package: { name: string; category: string; tier: string };
  };
}

interface SubscriptionItem {
  id: string;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string;
  adminNotes: string | null;
  package: PackageItem;
  numbers: AssignedNumberItem[];
}

interface ContactMessageItem {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  billingCycle: string;
  status: string;
  paymentMethod: string | null;
  pesapalTrackingId: string | null;
  paidAt: string | null;
  createdAt: string;
  package: { name: string; tier: string };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/* ─── Main User Dashboard ─── */
export default function UserDashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const { locale, setLocale, t } = useI18n();

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCompany, setProfileCompany] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Contact support
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([]);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessageText, setContactMessageText] = useState("");
  const [sendingContact, setSendingContact] = useState(false);

  // Subscribe dialog
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [selectedCycle, setSelectedCycle] = useState("3mo");
  const [subscribing, setSubscribing] = useState(false);

  // Renew dialog
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewSub, setRenewSub] = useState<SubscriptionItem | null>(null);
  const [renewCycle, setRenewCycle] = useState("3mo");
  const [renewing, setRenewing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [subsRes, msgsRes, pkgsRes] = await Promise.all([
        fetch("/api/user/subscriptions", { credentials: "include" }),
        fetch("/api/user/contact", { credentials: "include" }),
        fetch("/api/packages", { credentials: "include" }),
      ]);
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubscriptions(data.subscriptions || []);
      }
      if (msgsRes.ok) {
        const data = await msgsRes.json();
        setContactMessages(data.messages || []);
      }
      if (pkgsRes.ok) {
        const data = await pkgsRes.json();
        setPackages(data.packages || []);
      }

      // Fetch payments
      try {
        const payRes = await fetch("/api/user/payments", { credentials: "include" });
        if (payRes.ok) {
          const data = await payRes.json();
          setPayments(data.payments || []);
        }
      } catch {
        // Payments endpoint may not exist yet
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
        return;
      }
      if (user.status === "suspended") {
        router.push("/login");
        return;
      }
      setLoadingData(true);
      fetchData().finally(() => setLoadingData(false));
    }
  }, [user, authLoading, router, fetchData]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "");
      setProfileCompany(user.company || "");
    }
  }, [user]);

  // Handle payment callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "success") {
      toast.success("Payment completed successfully!");
      window.history.replaceState({}, "", "/dashboard");
      fetchData();
    } else if (paymentStatus === "error") {
      toast.error("Payment failed. Please try again.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: profileName, phone: profilePhone, company: profileCompany, locale }),
      });
      if (res.ok) {
        await refreshUser();
        setEditingProfile(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to save profile");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendContact = async () => {
    if (!contactSubject.trim() || !contactMessageText.trim()) return;
    setSendingContact(true);
    try {
      const res = await fetch("/api/user/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: contactSubject, message: contactMessageText }),
      });
      if (res.ok) {
        const data = await res.json();
        setContactMessages((prev) => [data.message, ...prev]);
        setContactSubject("");
        setContactMessageText("");
        toast.success("Message sent successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Failed to send contact:", err);
      toast.error("Failed to send message");
    } finally {
      setSendingContact(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPkg || !selectedCycle) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId: selectedPkg.id, billingCycle: selectedCycle }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Payment initiated! Redirecting to PesaPal...");
        setSubscribeOpen(false);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to initiate payment");
      }
    } catch (err) {
      console.error("Failed to subscribe:", err);
      toast.error("Failed to initiate payment");
    } finally {
      setSubscribing(false);
    }
  };

  const handleRenew = async () => {
    if (!renewSub || !renewCycle) return;
    setRenewing(true);
    try {
      const res = await fetch("/api/payments/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscriptionId: renewSub.id, billingCycle: renewCycle }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Renewal payment initiated! Redirecting to PesaPal...");
        setRenewOpen(false);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to initiate renewal");
      }
    } catch (err) {
      console.error("Failed to renew:", err);
      toast.error("Failed to initiate renewal");
    } finally {
      setRenewing(false);
    }
  };

  const openSubscribeDialog = (pkg: PackageItem) => {
    setSelectedPkg(pkg);
    setSelectedCycle("3mo");
    setSubscribeOpen(true);
  };

  const openRenewDialog = (sub: SubscriptionItem) => {
    setRenewSub(sub);
    setRenewCycle("3mo");
    setRenewOpen(true);
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050c18]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const activeSubscriptions = subscriptions.filter(s => s.status === "active");
  const totalNumbers = subscriptions.reduce((acc, s) => acc + s.numbers.filter(n => n.status === "active").length, 0);

  return (
    <div className="min-h-screen bg-[#050c18] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/70 via-[#081525] to-cyan-950/50" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10">
        {/* ─── Top Bar ─── */}
        <header className="sticky top-0 z-50 navbar-scrolled border-b border-white/5">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 group">
                <img src="/logo.png" alt="TunePoa" className="h-7 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
              </a>
              <Separator orientation="vertical" className="h-6 bg-white/10" />
              <span className="text-white/50 text-sm font-medium hidden sm:block">{t("nav.dashboard")}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={() => setLocale(locale === "en" ? "sw" : "en")}
                className="flex items-center gap-1.5 text-white/40 hover:text-teal-400 text-[10px] font-medium px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title={locale === "en" ? "Badilisha kwa Kiswahili" : "Switch to English"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{locale}</span>
              </button>
              {/* Notifications */}
              <NotificationBell apiPrefix="user" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-white/35 text-xs leading-tight">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/40 hover:text-white hover:bg-white/5 gap-1.5 text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10">
          {loadingData ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-14">
              {/* ─── Welcome & Stats ─── */}
              <section>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  {t("dashboard.welcome")}, <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">{user.name}</span>
                </h1>
                <p className="text-white/40 text-sm mb-6">
                  {user.company ? `${user.company} • ` : ""}Manage your ringback tone subscriptions and assigned numbers.
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="glass-card rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-2xl sm:text-3xl font-extrabold text-white">{activeSubscriptions.length}</p>
                    <p className="text-white/35 text-xs mt-1">{t("dashboard.activePlans")}</p>
                  </div>
                  <div className="glass-card rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">{totalNumbers}</p>
                    <p className="text-white/35 text-xs mt-1">{t("dashboard.assignedNumbers")}</p>
                  </div>
                  <div className="glass-card rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{subscriptions.length}</p>
                    <p className="text-white/35 text-xs mt-1">{t("dashboard.totalSubscriptions")}</p>
                  </div>
                </div>
              </section>

              <div className="line-glow" />

              {/* ─── Browse Packages ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{t("nav.browsePackages")}</h2>
                </div>

                {packages.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <p className="text-white/40 text-sm">No packages available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => {
                      const features: string[] = (() => {
                        try { return JSON.parse(pkg.features || "[]"); } catch { return []; }
                      })();
                      return (
                        <div key={pkg.id} className={`glass-card rounded-xl p-4 relative flex flex-col ${pkg.popular ? "ring-1 ring-teal-500/30" : ""}`}>
                          {pkg.popular && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-teal-500/25">
                                {t("pkg.popular")}
                              </span>
                            </div>
                          )}
                          <h4 className="text-white font-semibold text-sm mb-1">{pkg.name}</h4>
                          <p className="text-white/30 text-[10px] mb-3">{pkg.tier} • {t("pkg.upto")} {pkg.maxPhoneNumbers >= 9999 ? "1501+" : pkg.maxPhoneNumbers} {t("pkg.numbers")}</p>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                              <p className="text-white font-bold text-xs">{formatPrice(pkg.price3mo)}</p>
                              <p className="text-white/25 text-[9px]">{t("sub.3mo")}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                              <p className="text-white font-bold text-xs">{formatPrice(pkg.price6mo)}</p>
                              <p className="text-white/25 text-[9px]">{t("sub.6mo")}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                              <p className="text-white font-bold text-xs">{formatPrice(pkg.price12mo)}</p>
                              <p className="text-white/25 text-[9px]">{t("sub.12mo")}</p>
                            </div>
                          </div>

                          {features.length > 0 && (
                            <ul className="space-y-1 mb-3 flex-1">
                              {features.slice(0, 3).map((feat, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/35">
                                  <CheckCircle2 className="w-3 h-3 text-teal-500/50 mt-0.5 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </li>
                              ))}
                              {features.length > 3 && <li className="text-white/20 text-[10px] pl-4">+{features.length - 3} more</li>}
                            </ul>
                          )}

                          <Button
                            onClick={() => openSubscribeDialog(pkg)}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-8 rounded-lg shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs"
                          >
                            {t("btn.subscribe")}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Button variant="ghost" onClick={() => router.push("/dashboard/packages")} className="text-teal-400/70 hover:text-teal-400 hover:bg-teal-500/10 text-xs">
                    View All Packages →
                  </Button>
                </div>
              </section>

              <div className="line-glow" />

              {/* ─── My Subscriptions ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <Music className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{t("dashboard.mySubscriptions")}</h2>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 text-sm mb-1">{t("dashboard.noSubscriptions")}</p>
                    <p className="text-white/25 text-xs">{t("dashboard.noSubscriptionsDesc")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((sub) => {
                      const priceField = sub.billingCycle === "3mo" ? "price3mo" : sub.billingCycle === "6mo" ? "price6mo" : "price12mo";
                      const price = sub.package[priceField];
                      const cycleLabel = sub.billingCycle === "3mo" ? t("sub.3mo") : sub.billingCycle === "6mo" ? t("sub.6mo") : t("sub.12mo");
                      const remaining = daysRemaining(sub.endDate);
                      const isExpanded = expandedSub === sub.id;
                      const activeNumbers = sub.numbers.filter(n => n.status === "active");
                      const needsRenewal = remaining <= 30;

                      return (
                        <div key={sub.id} className="glass-card rounded-xl overflow-hidden">
                          <div className="p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-white font-semibold text-sm">{sub.package.name}</h4>
                                  <Badge className={`text-[10px] px-2 py-0 ${
                                    sub.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
                                    sub.status === "pending" ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
                                    sub.status === "cancelled" ? "bg-red-500/15 text-red-400 border-red-500/25" :
                                    "bg-gray-500/15 text-gray-400 border-gray-500/25"
                                  }`}>
                                    {sub.status}
                                  </Badge>
                                  {sub.status === "active" && remaining <= 7 && (
                                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px] px-2 py-0">
                                      {remaining}d left
                                    </Badge>
                                  )}
                                  {sub.status === "expired" && (
                                    <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px] px-2 py-0">
                                      {t("dashboard.expired")}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/35">
                                  <span>{cycleLabel}</span>
                                  <span>{formatPrice(price)} TZS</span>
                                  <span>Started: {formatDate(sub.startDate)}</span>
                                  <span>Expires: {formatDate(sub.endDate)}</span>
                                  <span className="text-teal-400/60">{activeNumbers.length} number{activeNumbers.length !== 1 ? "s" : ""}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Renew button */}
                                {needsRenewal && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openRenewDialog(sub)}
                                    className="text-teal-400/70 hover:text-teal-400 hover:bg-teal-500/10 text-xs gap-1.5 h-8"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    {t("dashboard.renew")}
                                  </Button>
                                )}
                                {sub.numbers.length > 0 && (
                                  <button
                                    onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                                    className="flex items-center gap-1 text-teal-400/70 hover:text-teal-400 text-xs font-medium transition-colors duration-200"
                                  >
                                    {isExpanded ? "Hide numbers" : "View numbers"}
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {isExpanded && sub.numbers.length > 0 && (
                            <div className="border-t border-white/5 bg-white/[0.01] p-4 sm:p-5">
                              <div className="space-y-2">
                                {sub.numbers.map((num) => (
                                  <div key={num.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        num.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
                                      }`}>
                                        <Phone className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="text-white text-sm font-medium">{num.phoneNumber}</p>
                                        <div className="flex items-center gap-2">
                                          {num.toneName && <span className="text-white/30 text-xs">{num.toneName}</span>}
                                          {num.toneCategory && (
                                            <Badge className="bg-white/5 text-white/30 border-white/5 text-[9px] px-1.5 py-0">
                                              {num.toneCategory}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge className={`text-[9px] px-1.5 py-0 ${
                                      num.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/30 border-white/5"
                                    }`}>
                                      {num.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <div className="line-glow" />

              {/* ─── My Payments ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{t("dashboard.myPayments")}</h2>
                </div>

                {payments.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 text-sm mb-1">{t("payment.noPayments")}</p>
                    <p className="text-white/25 text-xs">{t("payment.noPaymentsDesc")}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {payments.map((pay) => (
                      <div key={pay.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            pay.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                            pay.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{pay.package?.name || "Payment"}</p>
                            <p className="text-white/30 text-xs">{formatDate(pay.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">{formatPrice(pay.amount)} TZS</p>
                          <Badge className={`text-[9px] px-1.5 py-0 ${
                            pay.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
                            pay.status === "pending" ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
                            "bg-red-500/15 text-red-400 border-red-500/25"
                          }`}>
                            {pay.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="line-glow" />

              {/* ─── Contact Support ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{t("dashboard.contactSupport")}</h2>
                </div>

                <div className="glass-card rounded-2xl p-5 sm:p-6 mb-4">
                  <h3 className="text-white/60 text-sm font-semibold mb-4">Send us a message</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/60 text-sm">Subject</Label>
                      <Input
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="e.g., Need help with my subscription"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/60 text-sm">Message</Label>
                      <textarea
                        value={contactMessageText}
                        onChange={(e) => setContactMessageText(e.target.value)}
                        placeholder="Describe your issue or question..."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 rounded-xl text-sm p-3 resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleSendContact}
                      disabled={sendingContact || !contactSubject.trim() || !contactMessageText.trim()}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold h-10 rounded-xl px-6"
                    >
                      {sendingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      {sendingContact ? "Sending..." : t("btn.send")}
                    </Button>
                  </div>
                </div>

                {contactMessages.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider">Your Messages</h3>
                    {contactMessages.map((msg) => (
                      <div key={msg.id} className="glass-card rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white text-sm font-semibold truncate">{msg.subject}</h4>
                              <Badge className={`text-[9px] px-1.5 py-0 ${
                                msg.status === "open" ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
                                msg.status === "in_progress" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" :
                                msg.status === "resolved" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
                                "bg-white/5 text-white/40 border-white/10"
                              }`}>
                                {msg.status === "in_progress" ? "In Progress" : msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-white/35 text-xs line-clamp-2">{msg.message}</p>
                          </div>
                          <span className="text-white/20 text-[10px] shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        {msg.adminReply && (
                          <div className="mt-3 p-3 rounded-lg bg-teal-500/[0.06] border border-teal-500/10">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <CheckCircle2 className="w-3 h-3 text-teal-400" />
                              <span className="text-teal-400 text-[10px] font-semibold uppercase tracking-wider">Admin Reply</span>
                            </div>
                            <p className="text-white/60 text-xs">{msg.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="line-glow" />

              {/* ─── My Profile ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{t("dashboard.myProfile")}</h2>
                </div>

                <div className="glass-card rounded-2xl p-5 sm:p-6">
                  {editingProfile ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/60 text-sm">Full Name</Label>
                          <Input value={profileName} onChange={e => setProfileName(e.target.value)} className="bg-white/5 border-white/10 text-white h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/60 text-sm">Email</Label>
                          <Input value={user.email} disabled className="bg-white/[0.02] border-white/5 text-white/40 h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/60 text-sm">Phone</Label>
                          <Input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="+255..." className="bg-white/5 border-white/10 text-white h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/60 text-sm">Company</Label>
                          <Input value={profileCompany} onChange={e => setProfileCompany(e.target.value)} placeholder="Company name" className="bg-white/5 border-white/10 text-white h-10 rounded-xl" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold h-10 rounded-xl px-6">
                          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {savingProfile ? "Saving..." : t("btn.save")}
                        </Button>
                        <Button onClick={() => setEditingProfile(false)} variant="ghost" className="text-white/40 hover:text-white h-10 rounded-xl">
                          {t("btn.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg">{user.name}</h3>
                        <p className="text-white/40 text-sm">{user.email}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/35">
                          {user.phone && <span>Phone: {user.phone}</span>}
                          {user.company && <span>Company: {user.company}</span>}
                        </div>
                      </div>
                      <Button onClick={() => setEditingProfile(true)} variant="ghost" size="sm" className="text-teal-400/70 hover:text-teal-400 hover:bg-white/5">
                        {t("btn.edit")}
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>

        <footer className="border-t border-white/5 mt-16">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="TunePoa" className="h-5 w-auto object-contain opacity-50" />
              <span className="text-white/25 text-xs">&copy; {new Date().getFullYear()} TunePoa</span>
            </div>
            <a href="/" className="text-white/25 text-xs hover:text-teal-400 transition-colors duration-200">Back to Home</a>
          </div>
        </footer>
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Subscribe to {selectedPkg?.name}</DialogTitle>
            <DialogDescription className="text-white/40">
              Choose your billing cycle and proceed to payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">{t("sub.selectCycle")}</Label>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/10">
                  <SelectItem value="3mo">{t("sub.3mo")} — {selectedPkg ? formatPrice(selectedPkg.price3mo) : 0} TZS</SelectItem>
                  <SelectItem value="6mo">{t("sub.6mo")} — {selectedPkg ? formatPrice(selectedPkg.price6mo) : 0} TZS</SelectItem>
                  <SelectItem value="12mo">{t("sub.12mo")} — {selectedPkg ? formatPrice(selectedPkg.price12mo) : 0} TZS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-teal-500/[0.06] border border-teal-500/10">
              <p className="text-teal-400 text-xs font-semibold mb-1">Amount</p>
              <p className="text-white font-bold text-lg">
                {formatPrice(selectedCycle === "3mo" ? (selectedPkg?.price3mo || 0) : selectedCycle === "6mo" ? (selectedPkg?.price6mo || 0) : (selectedPkg?.price12mo || 0))} TZS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSubscribeOpen(false)} className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs">
              {t("btn.cancel")}
            </Button>
            <Button onClick={handleSubscribe} disabled={subscribing} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs">
              {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : t("sub.confirmPayment")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{t("btn.renew")}</DialogTitle>
            <DialogDescription className="text-white/40">
              Renew your {renewSub?.package.name} subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">{t("sub.selectCycle")}</Label>
              <Select value={renewCycle} onValueChange={setRenewCycle}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/10">
                  <SelectItem value="3mo">{t("sub.3mo")} — {renewSub ? formatPrice(renewSub.package.price3mo) : 0} TZS</SelectItem>
                  <SelectItem value="6mo">{t("sub.6mo")} — {renewSub ? formatPrice(renewSub.package.price6mo) : 0} TZS</SelectItem>
                  <SelectItem value="12mo">{t("sub.12mo")} — {renewSub ? formatPrice(renewSub.package.price12mo) : 0} TZS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-teal-500/[0.06] border border-teal-500/10">
              <p className="text-teal-400 text-xs font-semibold mb-1">Amount</p>
              <p className="text-white font-bold text-lg">
                {formatPrice(renewCycle === "3mo" ? (renewSub?.package.price3mo || 0) : renewCycle === "6mo" ? (renewSub?.package.price6mo || 0) : (renewSub?.package.price12mo || 0))} TZS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={() => setRenewOpen(false)} className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs">
              {t("btn.cancel")}
            </Button>
            <Button onClick={handleRenew} disabled={renewing} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs">
              {renewing ? <Loader2 className="w-4 h-4 animate-spin" /> : t("sub.confirmPayment")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
