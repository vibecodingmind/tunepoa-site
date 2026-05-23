"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  Phone,
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Pencil,
  User,
  Package,
  Calendar,
  Clock,
  Music,
  AlertCircle,
  CheckCircle2,
  Hash,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface AssignedNumberItem {
  id: string;
  phoneNumber: string;
  toneName: string | null;
  toneCategory: string | null;
  status: string;
  assignedAt: string;
  updatedAt: string;
}

interface SubscriptionDetail {
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

const numberStatusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  inactive: "bg-red-500/15 text-red-400 border-red-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subId = params.id as string;
  const { isAdmin, loading: authLoading } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add number dialog
  const [addNumberOpen, setAddNumberOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newToneName, setNewToneName] = useState("");
  const [newToneCategory, setNewToneCategory] = useState("");
  const [addingNumber, setAddingNumber] = useState(false);

  // Edit number dialog
  const [editNumberOpen, setEditNumberOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState<AssignedNumberItem | null>(null);
  const [editForm, setEditForm] = useState({ phoneNumber: "", toneName: "", toneCategory: "", status: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  // Remove number
  const [removeNumberId, setRemoveNumberId] = useState<string | null>(null);
  const [removingNumber, setRemovingNumber] = useState(false);

  // Change status
  const [changingStatus, setChangingStatus] = useState(false);

  // CSV upload
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [uploadingCsv, setUploadingCsv] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/subscriptions/${subId}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Subscription not found");
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setSubscription(data.subscription);
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      setError(err instanceof Error ? err.message : "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, [subId]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (isAdmin) fetchSubscription();
  }, [authLoading, isAdmin, router, fetchSubscription]);

  const getPrice = () => {
    if (!subscription) return 0;
    if (subscription.billingCycle === "3mo") return subscription.package.price3mo;
    if (subscription.billingCycle === "6mo") return subscription.package.price6mo;
    return subscription.package.price12mo;
  };

  const getCycleLabel = (cycle: string) => {
    if (cycle === "3mo") return "3 Months";
    if (cycle === "6mo") return "6 Months";
    return "12 Months";
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!subscription) return;
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSubscription((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(`Subscription ${newStatus === "active" ? "activated" : "updated"}!`);
    } catch (err) {
      console.error("Failed to change status:", err);
      alert("Failed to update subscription status");
      toast.error("Failed to update subscription status");
    }
  };

  const openAddNumber = () => {
    setNewPhoneNumber("");
    setNewToneName("");
    setNewToneCategory("");
    setAddNumberOpen(true);
  };

  const handleAddNumber = async () => {
    if (!subscription || !newPhoneNumber) return;
    setAddingNumber(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}/numbers`, {
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
      setSubscription((prev) =>
        prev ? { ...prev, numbers: [...prev.numbers, data.number] } : prev
      );
      setAddNumberOpen(false);
      toast.success("Phone number added successfully!");
    } finally {
      setAddingNumber(false);
    }
  };

  const openEditNumber = (num: AssignedNumberItem) => {
    setEditingNumber(num);
    setEditForm({
      phoneNumber: num.phoneNumber,
      toneName: num.toneName || "",
      toneCategory: num.toneCategory || "",
      status: num.status,
    });
    setEditNumberOpen(true);
  };

  const handleSaveEditNumber = async () => {
    if (!subscription || !editingNumber) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}/numbers/${editingNumber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: editForm.phoneNumber || undefined,
          toneName: editForm.toneName || null,
          toneCategory: editForm.toneCategory || null,
          status: editForm.status || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              numbers: prev.numbers.map((n) => (n.id === editingNumber.id ? { ...n, ...data.number } : n)),
            }
          : prev
      );
      setEditNumberOpen(false);
      toast.success("Phone number updated successfully!");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveNumber = async () => {
    if (!subscription || !removeNumberId) return;
    setRemovingNumber(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}/numbers/${removeNumberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove");
      setSubscription((prev) =>
        prev
          ? { ...prev, numbers: prev.numbers.filter((n) => n.id !== removeNumberId) }
          : prev
      );
      setRemoveNumberId(null);
      toast.success("Phone number removed successfully!");
    } finally {
      setRemovingNumber(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/60 text-sm mb-4">{error || "Subscription not found"}</p>
          <button
            onClick={() => router.push("/admin/subscriptions")}
            className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
          >
            Back to Subscriptions
          </button>
        </div>
      </div>
    );
  }

  const activeNumbers = subscription.numbers.filter((n) => n.status === "active").length;
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => router.push("/admin/subscriptions")}
        className="inline-flex items-center gap-2 text-white/40 hover:text-teal-400 transition-colors text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        Back to Subscriptions
      </button>

      {/* Subscription Header */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{subscription.package.name}</h1>
              <Badge className={`text-[10px] px-2.5 py-0.5 ${statusColors[subscription.status] || "bg-white/5 text-white/40"}`}>
                {subscription.status}
              </Badge>
            </div>
            <p className="text-white/35 text-xs">Subscription ID: {subscription.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {subscription.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleChangeStatus("cancelled")}
                disabled={changingStatus}
                className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-xs h-8 gap-1.5"
              >
                {changingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cancel Subscription"}
              </Button>
            )}
            {(subscription.status === "cancelled" || subscription.status === "expired" || subscription.status === "pending") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleChangeStatus("active")}
                disabled={changingStatus}
                className="text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 text-xs h-8 gap-1.5"
              >
                {changingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Reactivate"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Info */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-white/50 text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
            <User className="w-3 h-3" /> User
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0">
              {subscription.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{subscription.user.name}</p>
              <p className="text-white/35 text-xs truncate">{subscription.user.email}</p>
              {subscription.user.company && (
                <p className="text-white/25 text-[10px] truncate">{subscription.user.company}</p>
              )}
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-white/50 text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
            <Package className="w-3 h-3" /> Package
          </h3>
          <div>
            <p className="text-white text-sm font-semibold">{subscription.package.tier} — {subscription.package.name}</p>
            <p className="text-white/35 text-xs">{subscription.package.category} category</p>
            <p className="text-teal-400 font-bold text-sm mt-1">
              {formatPrice(getPrice())} <span className="text-white/30 text-xs font-normal">TZS / {getCycleLabel(subscription.billingCycle).toLowerCase()}</span>
            </p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-white/50 text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Billing
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-xs">Cycle</span>
              <span className="text-white text-xs font-medium">{getCycleLabel(subscription.billingCycle)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-xs">Start</span>
              <span className="text-white text-xs font-medium">{formatDate(subscription.startDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-xs">End</span>
              <span className="text-white text-xs font-medium">{formatDate(subscription.endDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-xs">Remaining</span>
              <span className={`text-xs font-medium ${daysRemaining <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
                {daysRemaining} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Numbers Section */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Assigned Numbers</h2>
              <p className="text-white/35 text-[10px]">
                {activeNumbers} active of {subscription.package.maxPhoneNumbers >= 9999 ? "1501+" : subscription.package.maxPhoneNumbers} max
              </p>
            </div>
          </div>
          <Button
            onClick={openAddNumber}
            disabled={activeNumbers >= subscription.package.maxPhoneNumbers}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-8 rounded-lg shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Number
          </Button>
          <Button
            onClick={() => { setCsvData(""); setCsvDialogOpen(true); }}
            variant="outline"
            className="bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white h-8 rounded-lg text-xs gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Upload CSV
          </Button>
        </div>

        {subscription.numbers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Phone className="w-7 h-7 text-white/15" />
            </div>
            <p className="text-white/35 text-sm mb-1">No numbers assigned</p>
            <p className="text-white/20 text-xs">Click &quot;Add Number&quot; to assign a phone number</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {subscription.numbers.map((num) => (
              <div
                key={num.id}
                className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center text-teal-400 shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-xs font-medium">{num.phoneNumber}</p>
                      <Badge className={`text-[9px] px-1.5 py-0 ${numberStatusColors[num.status] || "bg-white/5 text-white/40"}`}>
                        {num.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {num.toneName && (
                        <span className="flex items-center gap-1 text-white/30 text-[10px]">
                          <Music className="w-2.5 h-2.5" /> {num.toneName}
                        </span>
                      )}
                      {num.toneCategory && (
                        <span className="text-teal-400/40 text-[10px]">{num.toneCategory}</span>
                      )}
                      {!num.toneName && !num.toneCategory && (
                        <span className="text-white/15 text-[10px]">No tone assigned</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditNumber(num)}
                    className="text-white/25 hover:text-teal-400 hover:bg-teal-500/10 h-7 w-7 p-0"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveNumberId(num.id)}
                    className="text-white/25 hover:text-red-400 hover:bg-red-500/10 h-7 w-7 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* Edit Number Dialog */}
      <Dialog open={editNumberOpen} onOpenChange={setEditNumberOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Phone Number</DialogTitle>
            <DialogDescription className="text-white/40">
              Update tone name, category, or status for this number
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Phone Number</Label>
              <Input
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                className="bg-white/5 border-white/10 text-white focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Tone Name</Label>
              <Input
                value={editForm.toneName}
                onChange={(e) => setEditForm({ ...editForm, toneName: e.target.value })}
                placeholder="Enter tone name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Tone Category</Label>
              <Select value={editForm.toneCategory} onValueChange={(v) => setEditForm({ ...editForm, toneCategory: v })}>
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
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/10">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setEditNumberOpen(false)}
              className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditNumber}
              disabled={savingEdit}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs"
            >
              {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Number Confirmation */}
      <AlertDialog open={!!removeNumberId} onOpenChange={(open) => !open && setRemoveNumberId(null)}>
        <AlertDialogContent className="bg-[#0a1628] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Phone Number</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              This will permanently remove this phone number from the subscription. The number&apos;s ringback tone assignment will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveNumber}
              disabled={removingNumber}
              className="bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30"
            >
              {removingNumber ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Upload Dialog */}
      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Upload CSV Numbers</DialogTitle>
            <DialogDescription className="text-white/40">
              Upload a CSV file with phone numbers. Format: phoneNumber,toneName,toneCategory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">CSV Data</Label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={`phoneNumber,toneName,toneCategory\n+255712345678,Welcome Tune,music\n+255798765432,Ad Promo,ad`}
                rows={6}
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 rounded-lg text-xs p-2.5 resize-none font-mono"
              />
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-white/40 text-[10px]">Header row is required. Supported columns: phoneNumber (required), toneName (optional), toneCategory (optional)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={() => setCsvDialogOpen(false)} className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs">Cancel</Button>
            <Button
              onClick={async () => {
                if (!csvData.trim()) return;
                setUploadingCsv(true);
                try {
                  const res = await fetch(`/api/admin/subscriptions/${subId}/numbers/bulk`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ csv: csvData }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Upload failed");
                  toast.success(`${data.created} numbers created!${data.errors?.length > 0 ? ` (${data.errors.length} errors)` : ""}`);
                  setCsvDialogOpen(false);
                  fetchSubscription();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to upload CSV");
                } finally {
                  setUploadingCsv(false);
                }
              }}
              disabled={uploadingCsv || !csvData.trim()}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs"
            >
              {uploadingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
              {uploadingCsv ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
