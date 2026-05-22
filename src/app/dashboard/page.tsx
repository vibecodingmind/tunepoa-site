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

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCompany, setProfileCompany] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/subscriptions", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
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
      // Admin goes to admin dashboard
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
        body: JSON.stringify({ name: profileName, phone: profilePhone, company: profileCompany }),
      });
      if (res.ok) {
        await refreshUser();
        setEditingProfile(false);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSavingProfile(false);
    }
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
              <span className="text-white/50 text-sm font-medium hidden sm:block">My Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-white/35 text-xs leading-tight">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/40 hover:text-white hover:bg-white/5 gap-1.5 text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
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
                  Welcome back, <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">{user.name}</span>
                </h1>
                <p className="text-white/40 text-sm mb-6">
                  {user.company ? `${user.company} • ` : ""}Manage your ringback tone subscriptions and assigned numbers.
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="glass-card rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-2xl sm:text-3xl font-extrabold text-white">{activeSubscriptions.length}</p>
                    <p className="text-white/35 text-xs mt-1">Active Plans</p>
                  </div>
                  <div className="glass-card rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">{totalNumbers}</p>
                    <p className="text-white/35 text-xs mt-1">Assigned Numbers</p>
                  </div>
                  <div className="glass-card rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{subscriptions.length}</p>
                    <p className="text-white/35 text-xs mt-1">Total Subscriptions</p>
                  </div>
                </div>
              </section>

              <div className="line-glow" />

              {/* ─── My Subscriptions ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <Music className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">My Subscriptions</h2>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 text-sm mb-1">No subscriptions yet</p>
                    <p className="text-white/25 text-xs">Your assigned plans will appear here once activated by our team.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((sub) => {
                      const priceField = sub.billingCycle === "3mo" ? "price3mo" : sub.billingCycle === "6mo" ? "price6mo" : "price12mo";
                      const price = sub.package[priceField];
                      const cycleLabel = sub.billingCycle === "3mo" ? "3 Months" : sub.billingCycle === "6mo" ? "6 Months" : "12 Months";
                      const remaining = daysRemaining(sub.endDate);
                      const isExpanded = expandedSub === sub.id;
                      const activeNumbers = sub.numbers.filter(n => n.status === "active");

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
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/35">
                                  <span>{cycleLabel}</span>
                                  <span>{formatPrice(price)} TZS</span>
                                  <span>Started: {formatDate(sub.startDate)}</span>
                                  <span>Expires: {formatDate(sub.endDate)}</span>
                                  <span className="text-teal-400/60">{activeNumbers.length} number{activeNumbers.length !== 1 ? "s" : ""}</span>
                                </div>
                              </div>
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

              {/* ─── My Profile ─── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">My Profile</h2>
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
                          {savingProfile ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button onClick={() => setEditingProfile(false)} variant="ghost" className="text-white/40 hover:text-white h-10 rounded-xl">
                          Cancel
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
                        Edit
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
    </div>
  );
}
