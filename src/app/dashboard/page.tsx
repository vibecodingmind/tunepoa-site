"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  LogOut,
  Loader2,
  CheckCircle2,
  Star,
  Crown,
  Gem,
  Award,
  ArrowRight,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

interface SubscriptionItem {
  id: string;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string;
  phoneNumbers: string;
  package: PackageItem;
}

/* ─── Icon mapping ─── */
const tierIconMap: Record<string, React.ReactNode> = {
  Silver: <Award className="w-5 h-5" />,
  Bronze: <Award className="w-5 h-5" />,
  Gold: <Crown className="w-5 h-5" />,
  Ruby: <Gem className="w-5 h-5" />,
};

const tierColorMap: Record<string, string> = {
  Silver: "from-gray-400/20 to-gray-300/10 border-gray-400/20",
  Bronze: "from-amber-600/20 to-amber-500/10 border-amber-500/20",
  Gold: "from-yellow-500/20 to-yellow-400/10 border-yellow-400/25",
  Ruby: "from-rose-500/20 to-pink-500/10 border-rose-400/25",
};

const tierTextMap: Record<string, string> = {
  Silver: "text-gray-300",
  Bronze: "text-amber-400",
  Gold: "text-yellow-400",
  Ruby: "text-rose-400",
};

const categoryInfo: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  starter: {
    title: "Starter",
    description: "Perfect for small businesses getting started with ringback tones",
    icon: <Star className="w-5 h-5" />,
  },
  business: {
    title: "Business",
    description: "Designed for growing companies that need more capacity and features",
    icon: <Award className="w-5 h-5" />,
  },
  premium: {
    title: "Premium",
    description: "Enterprise-grade solution for large organizations with advanced needs",
    icon: <Crown className="w-5 h-5" />,
  },
};

function formatPrice(price: number): string {
  return price.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─── Main Dashboard Component ─── */
export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [billingCycle, setBillingCycle] = useState<"3mo" | "6mo" | "12mo">("3mo");
  const [loadingData, setLoadingData] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [expandedSubs, setExpandedSubs] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/subscriptions", {
        headers: { "x-user-id": user.id },
      });
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    }
  }, [user]);

  const seedDatabase = useCallback(async () => {
    try {
      await fetch("/api/seed");
    } catch (err) {
      console.error("Failed to seed:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setLoadingData(true);
      Promise.all([seedDatabase(), fetchPackages(), fetchSubscriptions()]).finally(() =>
        setLoadingData(false)
      );
    }
  }, [user, authLoading, seedDatabase, fetchPackages, fetchSubscriptions]);

  const handleSubscribe = async (packageId: string) => {
    if (!user) return;
    setSubscribingId(packageId);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ packageId, billingCycle }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to subscribe");
        return;
      }
      await fetchSubscriptions();
    } catch {
      alert("Failed to subscribe");
    } finally {
      setSubscribingId(null);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "x-user-id": user.id },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to cancel subscription");
        return;
      }
      await fetchSubscriptions();
    } catch {
      alert("Failed to cancel subscription");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": user.id },
      });
      if (!res.ok) {
        alert("Failed to delete subscription");
        return;
      }
      await fetchSubscriptions();
    } catch {
      alert("Failed to delete subscription");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050c18]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Group packages by category
  const packagesByCategory = packages.reduce<Record<string, PackageItem[]>>((acc, pkg) => {
    if (!acc[pkg.category]) acc[pkg.category] = [];
    acc[pkg.category].push(pkg);
    return acc;
  }, {});

  const categoryOrder = ["starter", "business", "premium"];

  const getPrice = (pkg: PackageItem) => {
    if (billingCycle === "3mo") return pkg.price3mo;
    if (billingCycle === "6mo") return pkg.price6mo;
    return pkg.price12mo;
  };

  const billingLabel = billingCycle === "3mo" ? "3 Months" : billingCycle === "6mo" ? "6 Months" : "12 Months";

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const otherSubscriptions = subscriptions.filter((s) => s.status !== "active");
  const displayedSubscriptions = expandedSubs ? subscriptions : activeSubscriptions;

  return (
    <div className="min-h-screen bg-[#050c18] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/70 via-[#081525] to-cyan-950/50" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-teal-500/[0.04] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />

      <div className="relative z-10">
        {/* ─── Top Bar ─── */}
        <header className="sticky top-0 z-50 navbar-scrolled border-b border-white/5">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 group">
                <img src="/logo.png" alt="TunePoa" className="h-7 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
              </a>
              <Separator orientation="vertical" className="h-6 bg-white/10" />
              <span className="text-white/50 text-sm font-medium hidden sm:block">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-white text-sm font-medium leading-tight">{user.name}</p>
                  <p className="text-white/35 text-xs leading-tight">{user.email}</p>
                </div>
                {user.role === "admin" && (
                  <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/25 text-[10px] px-2 py-0">Admin</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/40 hover:text-white hover:bg-white/5 gap-1.5 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10">
          {loadingData ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {/* ─── My Subscriptions ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">My Subscriptions</h2>
                    <p className="text-white/35 text-sm">Manage your active ringback tone subscriptions</p>
                  </div>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 text-sm mb-1">No subscriptions yet</p>
                    <p className="text-white/25 text-xs">Choose a package below to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedSubscriptions.map((sub) => {
                      const priceField = sub.billingCycle === "3mo" ? "price3mo" : sub.billingCycle === "6mo" ? "price6mo" : "price12mo";
                      const price = sub.package[priceField];
                      const cycleLabel = sub.billingCycle === "3mo" ? "3 Months" : sub.billingCycle === "6mo" ? "6 Months" : "12 Months";
                      return (
                        <div key={sub.id} className="glass-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-semibold text-sm truncate">{sub.package.name}</h4>
                              <Badge
                                className={`text-[10px] px-2 py-0 ${
                                  sub.status === "active"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                    : sub.status === "cancelled"
                                    ? "bg-red-500/15 text-red-400 border-red-500/25"
                                    : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                                }`}
                              >
                                {sub.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/35">
                              <span>{cycleLabel}</span>
                              <span>{formatPrice(price)} TZS</span>
                              <span>Started: {formatDate(sub.startDate)}</span>
                              <span>Expires: {formatDate(sub.endDate)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {sub.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelSubscription(sub.id)}
                                className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-xs h-8"
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubscription(sub.id)}
                              className="text-white/25 hover:text-white/60 hover:bg-white/5 text-xs h-8"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {otherSubscriptions.length > 0 && (
                      <button
                        onClick={() => setExpandedSubs(!expandedSubs)}
                        className="flex items-center gap-1 text-teal-400/70 hover:text-teal-400 text-xs font-medium transition-colors duration-200 mx-auto pt-1"
                      >
                        {expandedSubs ? (
                          <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Show all ({otherSubscriptions.length} more) <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </section>

              <div className="line-glow" />

              {/* ─── Packages Section ─── */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Packages</h2>
                      <p className="text-white/35 text-sm">Choose the right plan for your business</p>
                    </div>
                  </div>

                  {/* Billing Cycle Toggle */}
                  <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10 self-start sm:self-auto">
                    {(["3mo", "6mo", "12mo"] as const).map((cycle) => {
                      const label = cycle === "3mo" ? "3 Months" : cycle === "6mo" ? "6 Months" : "12 Months";
                      const isBest = cycle === "12mo";
                      return (
                        <button
                          key={cycle}
                          onClick={() => setBillingCycle(cycle)}
                          className={`relative px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                            billingCycle === cycle
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20"
                              : "text-white/40 hover:text-white/60"
                          }`}
                        >
                          {label}
                          {isBest && billingCycle === cycle && (
                            <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                              BEST
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {categoryOrder.map((category) => {
                  const categoryPkgs = packagesByCategory[category] || [];
                  if (categoryPkgs.length === 0) return null;
                  const info = categoryInfo[category];
                  return (
                    <div key={category} className="mb-10 last:mb-0">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{info.title}</h3>
                          <p className="text-white/30 text-xs">{info.description}</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryPkgs.map((pkg) => {
                          const features: string[] = JSON.parse(pkg.features || "[]");
                          const price = getPrice(pkg);
                          return (
                            <div
                              key={pkg.id}
                              className={`glass-card rounded-2xl p-5 sm:p-6 relative flex flex-col ${
                                pkg.popular ? "ring-1 ring-teal-500/30" : ""
                              }`}
                            >
                              {pkg.popular && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                  <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-teal-500/25 animate-pulse-badge">
                                    POPULAR
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mb-4">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tierColorMap[pkg.tier] || ""} flex items-center justify-center ${tierTextMap[pkg.tier] || "text-white"}`}>
                                  {tierIconMap[pkg.tier]}
                                </div>
                                <div>
                                  <h4 className={`font-bold text-sm ${tierTextMap[pkg.tier] || "text-white"}`}>{pkg.tier}</h4>
                                  <p className="text-white/30 text-[10px]">Up to {pkg.maxPhoneNumbers >= 9999 ? "1501+" : pkg.maxPhoneNumbers} numbers</p>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-2xl font-extrabold text-white tracking-tight">
                                  {formatPrice(price)}
                                  <span className="text-white/30 text-xs font-normal ml-1">TZS</span>
                                </p>
                                <p className="text-white/25 text-[10px]">per {billingLabel.toLowerCase()}</p>
                              </div>

                              <div className="flex-1 mb-5">
                                <ul className="space-y-2">
                                  {features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-white/45">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500/60 mt-0.5 shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <Button
                                onClick={() => handleSubscribe(pkg.id)}
                                disabled={subscribingId === pkg.id}
                                className={`w-full font-semibold text-sm h-10 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                                  pkg.popular
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
                                    : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20"
                                }`}
                              >
                                {subscribingId === pkg.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    Subscribe <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
          )}
        </main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-white/5 mt-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="TunePoa" className="h-5 w-auto object-contain opacity-50" />
              <span className="text-white/25 text-xs">&copy; {new Date().getFullYear()} TunePoa. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-white/25 text-xs">
              <a href="/" className="hover:text-teal-400 transition-colors duration-200">Home</a>
              <a href="/login" className="hover:text-teal-400 transition-colors duration-200">Login</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
