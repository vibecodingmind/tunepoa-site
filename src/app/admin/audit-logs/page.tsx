"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Loader2,
  Clock,
  User,
  AlertCircle,
  Filter,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const actionColors: Record<string, string> = {
  create: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  update: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  delete: "bg-red-500/15 text-red-400 border-red-500/25",
  login: "bg-teal-500/15 text-teal-400 border-teal-500/25",
  payment: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  forgot_password: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  reset_password: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  bulk_create: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};

const entityColors: Record<string, string> = {
  user: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  subscription: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  package: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  number: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  payment: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  message: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function AuditLogsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterAction !== "all") params.set("action", filterAction);
      if (filterEntity !== "all") params.set("entity", filterEntity);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", page.toString());
      params.set("limit", "50");

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterEntity, searchQuery, page]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (isAdmin) fetchLogs();
  }, [authLoading, isAdmin, router, fetchLogs]);

  const filteredLogs = logs;

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
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
        <p className="text-white/40 text-sm mt-1">Track all actions performed on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <Input
            placeholder="Search by user name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-10 rounded-xl"
          />
        </div>
        <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setPage(1); }}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 rounded-xl w-[160px] text-xs">
            <Filter className="w-3 h-3 mr-1.5 text-white/30" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a1628] border-white/10">
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="forgot_password">Forgot Password</SelectItem>
            <SelectItem value="reset_password">Reset Password</SelectItem>
            <SelectItem value="bulk_create">Bulk Create</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEntity} onValueChange={(v) => { setFilterEntity(v); setPage(1); }}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 rounded-xl w-[160px] text-xs">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a1628] border-white/10">
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="package">Package</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="message">Message</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-white/5 text-white/30 border-white/10 text-[10px]">
          {total} {total === 1 ? "entry" : "entries"}
        </Badge>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">No audit logs found</p>
          <p className="text-white/25 text-xs">
            {searchQuery || filterAction !== "all" || filterEntity !== "all"
              ? "Try adjusting your filters"
              : "Actions will be logged here as they occur"}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Time</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">User</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Action</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Entity</th>
                  <th className="text-left text-white/30 text-[10px] font-semibold tracking-wider uppercase px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-white/30 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(log.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400 text-[10px] font-bold shrink-0">
                          {log.userName ? log.userName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className="text-white/50 text-xs truncate max-w-[120px]">{log.userName || "System"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={`text-[9px] px-1.5 py-0 ${actionColors[log.action] || "bg-white/5 text-white/40 border-white/10"}`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={`text-[9px] px-1.5 py-0 ${entityColors[log.entity] || "bg-white/5 text-white/40 border-white/10"}`}>
                        {log.entity}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-white/35 text-xs truncate block max-w-[250px]">{log.details || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/5">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] px-1.5 py-0 ${actionColors[log.action] || "bg-white/5 text-white/40"}`}>
                      {log.action}
                    </Badge>
                    <Badge className={`text-[9px] px-1.5 py-0 ${entityColors[log.entity] || "bg-white/5 text-white/40"}`}>
                      {log.entity}
                    </Badge>
                  </div>
                  <span className="text-white/20 text-[10px]">{formatDate(log.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/35 text-[10px]">
                  <User className="w-3 h-3" />
                  {log.userName || "System"}
                </div>
                {log.details && (
                  <p className="text-white/25 text-[10px] truncate">{log.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 50 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-white/40 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 transition-colors"
          >
            Previous
          </button>
          <span className="text-white/30 text-xs">Page {page} of {Math.ceil(total / 50)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 50)}
            className="text-white/40 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
