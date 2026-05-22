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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Crown,
  Gem,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
  Silver: <Award className="w-4 h-4" />,
  Bronze: <Award className="w-4 h-4" />,
  Gold: <Crown className="w-4 h-4" />,
  Ruby: <Gem className="w-4 h-4" />,
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

const emptyForm = {
  category: "starter",
  tier: "Silver",
  name: "",
  maxPhoneNumbers: 1,
  features: "",
  price3mo: 0,
  price6mo: 0,
  price12mo: 0,
  popular: false,
};

export default function AdminPackagesPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/packages", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (isAdmin) fetchPackages();
  }, [authLoading, isAdmin, router, fetchPackages]);

  const openCreateDialog = () => {
    setEditingPkg(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: PackageItem) => {
    setEditingPkg(pkg);
    const features = (() => {
      try {
        const parsed = JSON.parse(pkg.features);
        return Array.isArray(parsed) ? parsed.join("\n") : pkg.features;
      } catch {
        return pkg.features;
      }
    })();
    setForm({
      category: pkg.category,
      tier: pkg.tier,
      name: pkg.name,
      maxPhoneNumbers: pkg.maxPhoneNumbers,
      features,
      price3mo: pkg.price3mo,
      price6mo: pkg.price6mo,
      price12mo: pkg.price12mo,
      popular: pkg.popular,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.tier) return;
    setSubmitting(true);
    try {
      const featuresArray = form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        features: JSON.stringify(featuresArray),
      };

      let res: Response;
      if (editingPkg) {
        res = await fetch(`/api/admin/packages/${editingPkg.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Operation failed");
      }

      setDialogOpen(false);
      await fetchPackages();
    } catch (err) {
      console.error("Failed to save package:", err);
      alert(err instanceof Error ? err.message : "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/packages/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteId(null);
      await fetchPackages();
    } catch (err) {
      console.error("Failed to delete package:", err);
      alert("Failed to delete package");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const grouped = filteredPackages.reduce<Record<string, PackageItem[]>>((acc, pkg) => {
    if (!acc[pkg.category]) acc[pkg.category] = [];
    acc[pkg.category].push(pkg);
    return acc;
  }, {});

  const categoryOrder = ["starter", "business", "premium"];
  const categoryLabels: Record<string, string> = {
    starter: "Starter",
    business: "Business",
    premium: "Premium",
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Package Management</h1>
          <p className="text-white/40 text-sm mt-1">Create, edit, and manage RBT packages</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-10 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <Input
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-10 rounded-xl"
        />
      </div>

      {/* Package Groups */}
      {filteredPackages.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">
            {searchQuery ? "No packages match your search" : "No packages yet"}
          </p>
          <p className="text-white/25 text-xs">
            {searchQuery ? "Try a different search term" : "Click 'Add Package' to create one"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categoryOrder.map((category) => {
            const pkgs = grouped[category];
            if (!pkgs || pkgs.length === 0) return null;
            return (
              <div key={category}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-teal-400">
                    <Star className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{categoryLabels[category] || category}</h3>
                  <Badge variant="outline" className="bg-white/5 text-white/30 border-white/10 text-[10px]">
                    {pkgs.length} {pkgs.length === 1 ? "package" : "packages"}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pkgs.map((pkg) => {
                    const features: string[] = (() => {
                      try {
                        return JSON.parse(pkg.features || "[]");
                      } catch {
                        return [];
                      }
                    })();
                    return (
                      <div
                        key={pkg.id}
                        className={`glass-card rounded-xl p-4 relative flex flex-col ${pkg.popular ? "ring-1 ring-teal-500/30" : ""}`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-teal-500/25">
                              POPULAR
                            </span>
                          </div>
                        )}

                        {/* Tier header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tierColorMap[pkg.tier] || ""} flex items-center justify-center ${tierTextMap[pkg.tier] || "text-white"}`}>
                            {tierIconMap[pkg.tier]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-bold text-xs ${tierTextMap[pkg.tier] || "text-white"}`}>{pkg.tier}</h4>
                            <p className="text-white/30 text-[10px] truncate">{pkg.name}</p>
                          </div>
                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                            <p className="text-white font-bold text-xs">{formatPrice(pkg.price3mo)}</p>
                            <p className="text-white/25 text-[9px]">3 mo</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                            <p className="text-white font-bold text-xs">{formatPrice(pkg.price6mo)}</p>
                            <p className="text-white/25 text-[9px]">6 mo</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                            <p className="text-white font-bold text-xs">{formatPrice(pkg.price12mo)}</p>
                            <p className="text-white/25 text-[9px]">12 mo</p>
                          </div>
                        </div>

                        {/* Numbers & Features */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <Package className="w-3 h-3 text-teal-400/60" />
                          <span className="text-white/40 text-[10px]">Up to {pkg.maxPhoneNumbers >= 9999 ? "1501+" : pkg.maxPhoneNumbers} numbers</span>
                        </div>

                        {features.length > 0 && (
                          <div className="flex-1 mb-3 max-h-24 overflow-y-auto">
                            <ul className="space-y-1">
                              {features.slice(0, 3).map((feat, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/35">
                                  <CheckCircle2 className="w-3 h-3 text-teal-500/50 mt-0.5 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </li>
                              ))}
                              {features.length > 3 && (
                                <li className="text-white/20 text-[10px] pl-4">+{features.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        <Separator className="bg-white/5 mb-3" />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(pkg)}
                            className="flex-1 text-white/40 hover:text-teal-400 hover:bg-teal-500/10 text-xs h-8 gap-1.5"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(pkg.id)}
                            className="flex-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 text-xs h-8 gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPkg ? "Edit Package" : "Add Package"}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {editingPkg ? "Update package details" : "Create a new RBT package"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1628] border-white/10">
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Tier</Label>
                <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1628] border-white/10">
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Ruby">Ruby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Package Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Starter Silver"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Max Phone Numbers</Label>
              <Input
                type="number"
                value={form.maxPhoneNumbers}
                onChange={(e) => setForm({ ...form, maxPhoneNumbers: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Price 3mo (TZS)</Label>
                <Input
                  type="number"
                  value={form.price3mo}
                  onChange={(e) => setForm({ ...form, price3mo: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Price 6mo (TZS)</Label>
                <Input
                  type="number"
                  value={form.price6mo}
                  onChange={(e) => setForm({ ...form, price6mo: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Price 12mo (TZS)</Label>
                <Input
                  type="number"
                  value={form.price12mo}
                  onChange={(e) => setForm({ ...form, price12mo: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-9 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Features (one per line)</Label>
              <textarea
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder={"Up to 5 phone numbers\nCustom tone selection\nBasic analytics\nEmail support"}
                rows={4}
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 rounded-lg text-xs p-2.5 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="popular"
                checked={form.popular}
                onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/20"
              />
              <Label htmlFor="popular" className="text-white/60 text-xs cursor-pointer">Mark as Popular</Label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.name}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPkg ? "Save Changes" : "Create Package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#0a1628] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Package</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              This will permanently delete this package. Active subscriptions using this package will not be affected, but new subscriptions cannot be created with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
