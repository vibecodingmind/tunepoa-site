"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Users,
  Search,
  Loader2,
  Eye,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserX,
  Mail,
  Building,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { subscriptions: number };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    userId: string;
    currentStatus: string;
    action: "activate" | "suspend";
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (isAdmin) fetchUsers();
  }, [authLoading, isAdmin, router, fetchUsers]);

  const handleToggleStatus = async () => {
    if (!confirmDialog) return;
    const { userId, action } = confirmDialog;
    setTogglingId(userId);
    try {
      const newStatus = action === "activate" ? "active" : "suspended";
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      alert("Failed to update user status");
    } finally {
      setTogglingId(null);
      setConfirmDialog(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

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
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage platform users and their access</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
            <UserCheck className="w-3 h-3" /> {activeCount} Active
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] gap-1">
            <UserX className="w-3 h-3" /> {suspendedCount} Suspended
          </Badge>
          <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[10px] gap-1">
            <ShieldCheck className="w-3 h-3" /> {adminCount} Admin
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <Input
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-10 rounded-xl"
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">
            {searchQuery ? "No users match your search" : "No users yet"}
          </p>
          <p className="text-white/25 text-xs">
            {searchQuery ? "Try a different search term" : "Users will appear here when they register"}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">User</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Company</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Role</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Status</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Subs</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Joined</th>
                  <th className="text-right text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-white/20" />
                            <p className="text-white/35 text-[10px] truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {user.company ? (
                          <>
                            <Building className="w-3 h-3 text-white/20" />
                            <span className="text-white/50 text-xs">{user.company}</span>
                          </>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className={`text-[10px] px-2 py-0 ${
                          user.role === "admin"
                            ? "bg-teal-500/15 text-teal-400 border-teal-500/25"
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className={`text-[10px] px-2 py-0 ${
                          user.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                            : "bg-red-500/15 text-red-400 border-red-500/25"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white/50 text-xs">{user._count.subscriptions}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white/30 text-xs">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setConfirmDialog({
                              userId: user.id,
                              currentStatus: user.status,
                              action: user.status === "active" ? "suspend" : "activate",
                            })
                          }
                          disabled={togglingId === user.id || user.role === "admin"}
                          className={`h-7 px-2 text-[10px] gap-1 ${
                            user.status === "active"
                              ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                              : "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                          title={user.role === "admin" ? "Cannot modify admin status" : user.status === "active" ? "Suspend user" : "Activate user"}
                        >
                          {togglingId === user.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : user.status === "active" ? (
                            <ToggleRight className="w-3.5 h-3.5" />
                          ) : (
                            <ToggleLeft className="w-3.5 h-3.5" />
                          )}
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                      <Badge
                        className={`text-[9px] px-1.5 py-0 ${
                          user.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                            : "bg-red-500/15 text-red-400 border-red-500/25"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-white/35 text-xs truncate">{user.email}</p>
                  </div>
                  <Badge
                    className={`text-[9px] px-1.5 py-0 ${
                      user.role === "admin"
                        ? "bg-teal-500/15 text-teal-400 border-teal-500/25"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}
                  >
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-white/30 text-xs">
                    {user.company && (
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" /> {user.company}
                      </span>
                    )}
                    <span>{user._count.subscriptions} subs</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setConfirmDialog({
                        userId: user.id,
                        currentStatus: user.status,
                        action: user.status === "active" ? "suspend" : "activate",
                      })
                    }
                    disabled={togglingId === user.id || user.role === "admin"}
                    className={`h-7 px-2 text-[10px] gap-1 ${
                      user.status === "active"
                        ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                        : "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    {togglingId === user.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : user.status === "active" ? (
                      "Suspend"
                    ) : (
                      "Activate"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent className="bg-[#0a1628] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {confirmDialog?.action === "suspend" ? "Suspend User" : "Activate User"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              {confirmDialog?.action === "suspend"
                ? "This will suspend the user's account. They will not be able to log in or access their subscriptions."
                : "This will reactivate the user's account. They will be able to log in and access their subscriptions again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={`${
                confirmDialog?.action === "suspend"
                  ? "bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30"
              }`}
            >
              {confirmDialog?.action === "suspend" ? "Suspend" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
