"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  CreditCard,
  Plus,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone,
  AlertCircle,
  User,
  Package,
  Calendar,
  ArrowRight,
  X,
} from "lucide-react";

interface SubscriptionItem {
  id: string;
  userId: string;
  packageId: string;
  billingCycle: string;
  status: string;
  adminNotes: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; company: string | null };
  package: {
    id: string;
    name: string;
    category: string;
    tier: string;
    maxPhoneNumbers: number;
    price3mo: number;
    price6mo: number;
    price12mo: number;
  };
  numbers: AssignedNumberItem[];
}

interface AssignedNumberItem {
  id: string;
  phoneNumber: string;
  toneName: string | null;
  toneCategory: string | null;
  status: string;
  assignedAt: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface PackageOption {
  id: string;
  name: string;
  tier: string;
  category: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/25",
  expired: "bg-white/5 text-white/40 border-white/10",
};

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create subscription dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const [createForm, setCreateForm] = useState({ userId: "", packageId: "", billingCycle: "3mo" });
  const [creating, setCreating] = useState(false);

  // Add number dialog
  const [addNumberOpen, setAddNumberOpen] = useState(false);
  const [addNumberSubId, setAddNumberSubId] = useState<string | null>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newToneName, setNewToneName] = useState("");
  const [newToneCategory, setNewToneCategory] = useState("");
  const [addingNumber, setAddingNumber] = useState(false);

  // Change status
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
  const [removingNumberId, setRemovingNumberId] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscriptions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [usersRes, packagesRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/packages", { credentials: "include" }),
      ]);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUserOptions(
          (usersData.users || []).map((u: UserOption) => ({ id: u.id, name: u.name, email: u.email }))
        );
      }
      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setPackageOptions(
          (packagesData.packages || []).map((p: PackageOption) => ({
            id: p.id,
            name: p.name,
            tier: p.tier,
            category: p.category,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch options:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (isAdmin) fetchSubscriptions();
  }, [authLoading, isAdmin, router, fetchSubscriptions]);

  const openCreateDialog = async () => {
    setCreateForm({ userId: "", packageId: "", billingCycle: "3mo" });
    setCreateOpen(true);
    await fetchOptions();
  };

  const handleCreateSubscription = async () => {
    if (!createForm.userId || !createForm.packageId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setCreateOpen(false);
      await fetchSubscriptions();
    } catch (err) {
      console.error("Failed to create subscription:", err);
      alert(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setCreating(false);
    }
  };

  const handleChangeStatus = async (subId: string, newStatus: string) => {
    setChangingStatusId(subId);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error("Failed to change status:", err);
      alert("Failed to update subscription status");
    } finally {
      setChangingStatusId(null);
    }
  };

  const openAddNumber = (subId: string) => {
    setAddNumberSubId(subId);
    setNewPhoneNumber("");
    setNewToneName("");
    setNewToneCategory("");
    setAddNumberOpen(true);
  };

  const handleAddNumber = async () => {
    if (!addNumberSubId || !newPhoneNumber) return;
    setAddingNumber(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${addNumberSubId}/numbers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: newPhoneNumber,
          toneName: newToneName || undefined,
          toneCategory: newToneCategory || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add number");

      // Update local state
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === addNumberSubId
            ? { ...s, numbers: [...s.numbers, data.number] }
            : s
        )
      );
      setAddNumberOpen(false);
    } catch (err) {
      console.error("Failed to add number:", err);
      alert(err instanceof Error ? err.message : "Failed to add number");
    } finally {
      setAddingNumber(false);
    }
  };

  const handleRemoveNumber = async (subId: string, numberId: string) => {
    setRemovingNumberId(numberId);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subId}/numbers/${numberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove");
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subId
            ? { ...s, numbers: s.numbers.filter((n) => n.id !== numberId) }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to remove number:", err);
      alert("Failed to remove number");
    } finally {
      setRemovingNumberId(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter(
    (s) =>
      s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.package.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPrice = (sub: SubscriptionItem) => {
    if (sub.billingCycle === "3mo") return sub.package.price3mo;
    if (sub.billingCycle === "6mo") return sub.package.price6mo;
    return sub.package.price12mo;
  };

  const getCycleLabel = (cycle: string) => {
    if (cycle === "3mo") return "3 Months";
    if (cycle === "6mo") return "6 Months";
    return "12 Months";
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage all user subscriptions and assigned numbers</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-10 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Create Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: subscriptions.length, color: "text-white" },
          { label: "Active", value: subscriptions.filter((s) => s.status === "active").length, color: "text-emerald-400" },
          { label: "Pending", value: subscriptions.filter((s) => s.status === "pending").length, color: "text-amber-400" },
          { label: "Cancelled", value: subscriptions.filter((s) => s.status === "cancelled").length, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-white/30 text-[10px] font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <Input
          placeholder="Search by user, package, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-10 rounded-xl"
        />
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">
            {searchQuery ? "No subscriptions match your search" : "No subscriptions yet"}
          </p>
          <p className="text-white/25 text-xs">
            {searchQuery ? "Try a different search term" : "Click 'Create Subscription' to add one"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubscriptions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const price = getPrice(sub);
            const activeNumbers = sub.numbers.filter((n) => n.status === "active").length;
            return (
              <div key={sub.id} className="glass-card rounded-xl overflow-hidden">
                {/* Subscription Row */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-white font-semibold text-sm truncate">{sub.package.name}</h4>
                        <Badge className={`text-[10px] px-2 py-0 ${statusColors[sub.status] || "bg-white/5 text-white/40"}`}>
                          {sub.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/35">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {sub.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" /> {sub.package.tier}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {getCycleLabel(sub.billingCycle)}
                        </span>
                        <span>{formatPrice(price)} TZS</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {activeNumbers}/{sub.package.maxPhoneNumbers} numbers
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {sub.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChangeStatus(sub.id, "cancelled")}
                          disabled={changingStatusId === sub.id}
                          className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-[10px] h-7 gap-1"
                        >
                          {changingStatusId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cancel"}
                        </Button>
                      )}
                      {(sub.status === "cancelled" || sub.status === "expired" || sub.status === "pending") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChangeStatus(sub.id, "active")}
                          disabled={changingStatusId === sub.id}
                          className="text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 text-[10px] h-7 gap-1"
                        >
                          {changingStatusId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Activate"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/subscriptions/${sub.id}`)}
                        className="text-teal-400/60 hover:text-teal-400 hover:bg-teal-500/10 text-[10px] h-7 gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        className="text-white/30 hover:text-white/60 hover:bg-white/5 h-7 px-2"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded: Numbers */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-4 sm:px-5 py-4 bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white/60 text-xs font-semibold">Assigned Numbers ({sub.numbers.length})</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddNumber(sub.id)}
                        disabled={activeNumbers >= sub.package.maxPhoneNumbers}
                        className="text-teal-400/60 hover:text-teal-400 hover:bg-teal-500/10 text-[10px] h-7 gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Number
                      </Button>
                    </div>

                    {sub.numbers.length === 0 ? (
                      <p className="text-white/20 text-xs py-4 text-center">No numbers assigned</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sub.numbers.map((num) => (
                          <div
                            key={num.id}
                            className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-teal-400/50 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-white text-xs font-medium">{num.phoneNumber}</p>
                                <div className="flex items-center gap-2 text-[10px] text-white/25">
                                  {num.toneName && <span>{num.toneName}</span>}
                                  {num.toneCategory && <span className="text-teal-400/40">{num.toneCategory}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[9px] px-1.5 py-0 ${statusColors[num.status] || "bg-white/5 text-white/40"}`}>
                                {num.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveNumber(sub.id, num.id)}
                                disabled={removingNumberId === num.id}
                                className="text-white/20 hover:text-red-400 hover:bg-red-500/10 h-6 w-6 p-0"
                              >
                                {removingNumberId === num.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Subscription Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create Subscription</DialogTitle>
            <DialogDescription className="text-white/40">
              Assign a package to a user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">User</Label>
              <Select value={createForm.userId} onValueChange={(v) => setCreateForm({ ...createForm, userId: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/10 max-h-60">
                  {userOptions.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Package</Label>
              <Select value={createForm.packageId} onValueChange={(v) => setCreateForm({ ...createForm, packageId: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/10 max-h-60">
                  {packageOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.tier} ({p.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Billing Cycle</Label>
              <Select value={createForm.billingCycle} onValueChange={(v) => setCreateForm({ ...createForm, billingCycle: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/10">
                  <SelectItem value="3mo">3 Months</SelectItem>
                  <SelectItem value="6mo">6 Months</SelectItem>
                  <SelectItem value="12mo">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubscription}
              disabled={creating || !createForm.userId || !createForm.packageId}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Subscription"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Number Dialog */}
      <Dialog open={addNumberOpen} onOpenChange={setAddNumberOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Phone Number</DialogTitle>
            <DialogDescription className="text-white/40">
              Assign a new phone number to this subscription
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Phone Number</Label>
              <Input
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                placeholder="+255 7XX XXX XXX"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Tone Name (optional)</Label>
              <Input
                value={newToneName}
                onChange={(e) => setNewToneName(e.target.value)}
                placeholder="e.g., Company Welcome Tune"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Tone Category (optional)</Label>
              <Select value={newToneCategory} onValueChange={setNewToneCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/10">
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="ad">Ad</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setAddNumberOpen(false)}
              className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNumber}
              disabled={addingNumber || !newPhoneNumber}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs"
            >
              {addingNumber ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Number"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
