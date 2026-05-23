"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Package,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Crown,
  Gem,
  Award,
  Star,
  Music,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n-context";

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

function formatPrice(price: number): string {
  return price.toLocaleString();
}

const categoryOrder = ["starter", "business", "premium"];
const categoryLabels: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  premium: "Premium",
};

export default function BrowsePackagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [selectedCycle, setSelectedCycle] = useState("3mo");
  const [subscribing, setSubscribing] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/packages", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchPackages();
  }, [user, authLoading, router, fetchPackages]);

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

  const openSubscribeDialog = (pkg: PackageItem) => {
    setSelectedPkg(pkg);
    setSelectedCycle("3mo");
    setSubscribeOpen(true);
  };

  // Group by category
  const grouped = packages.reduce<Record<string, PackageItem[]>>((acc, pkg) => {
    if (!acc[pkg.category]) acc[pkg.category] = [];
    acc[pkg.category].push(pkg);
    return acc;
  }, {});

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050c18]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050c18] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/70 via-[#081525] to-cyan-950/50" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 navbar-scrolled border-b border-white/5">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-white/40 hover:text-teal-400 transition-colors text-sm group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Dashboard
              </button>
              <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/25 text-[10px] px-2 py-0 font-semibold">
                PACKAGES
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-teal-400/60" />
              <span className="text-white/50 text-sm font-medium">TunePoa</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {t("nav.browsePackages")}
            </h1>
            <p className="text-white/40 text-sm">Choose the right plan for your business</p>
          </div>

          {packages.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-white/40 text-sm">No packages available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {categoryOrder.map((category) => {
                const pkgs = grouped[category];
                if (!pkgs || pkgs.length === 0) return null;
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400">
                        <Star className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-lg font-bold text-white">{categoryLabels[category] || category}</h2>
                      <Badge variant="outline" className="bg-white/5 text-white/30 border-white/10 text-[10px]">
                        {pkgs.length} {pkgs.length === 1 ? "package" : "packages"}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {pkgs.map((pkg) => {
                        const features: string[] = (() => {
                          try { return JSON.parse(pkg.features || "[]"); } catch { return []; }
                        })();
                        return (
                          <div key={pkg.id} className={`glass-card rounded-2xl p-6 relative flex flex-col ${pkg.popular ? "ring-1 ring-teal-500/30" : ""}`}>
                            {pkg.popular && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[8px] font-bold px-3 py-0.5 rounded-full shadow-lg shadow-teal-500/25">
                                  {t("pkg.popular")}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierColorMap[pkg.tier] || ""} flex items-center justify-center ${tierTextMap[pkg.tier] || "text-white"}`}>
                                {tierIconMap[pkg.tier]}
                              </div>
                              <div>
                                <h3 className={`font-bold ${tierTextMap[pkg.tier] || "text-white"}`}>{pkg.tier}</h3>
                                <p className="text-white/30 text-[10px]">{pkg.name}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-white font-bold text-sm">{formatPrice(pkg.price3mo)}</p>
                                <p className="text-white/25 text-[10px]">{t("sub.3mo")}</p>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-white font-bold text-sm">{formatPrice(pkg.price6mo)}</p>
                                <p className="text-white/25 text-[10px]">{t("sub.6mo")}</p>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-white font-bold text-sm">{formatPrice(pkg.price12mo)}</p>
                                <p className="text-white/25 text-[10px]">{t("sub.12mo")}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 mb-3 text-white/40 text-xs">
                              <Package className="w-3.5 h-3.5 text-teal-400/60" />
                              <span>{t("pkg.upto")} {pkg.maxPhoneNumbers >= 9999 ? "1501+" : pkg.maxPhoneNumbers} {t("pkg.numbers")}</span>
                            </div>

                            {features.length > 0 && (
                              <ul className="space-y-2 mb-4 flex-1">
                                {features.map((feat, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-white/40">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500/50 mt-0.5 shrink-0" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <Button
                              onClick={() => openSubscribeDialog(pkg)}
                              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-10 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300"
                            >
                              {t("btn.subscribe")}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
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
              <label className="text-white/60 text-xs">{t("sub.selectCycle")}</label>
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
    </div>
  );
}
