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
  MessageCircle,
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  Building,
  Mail,
  Reply,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface ContactMessageItem {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
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

const statusColors: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  closed: "bg-white/5 text-white/40 border-white/10",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function AdminMessagesPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  // Reply dialog
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const url = filterStatus !== "all" ? `/api/admin/messages?status=${filterStatus}` : "/api/admin/messages";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (isAdmin) fetchMessages();
  }, [authLoading, isAdmin, router, fetchMessages]);

  const openReplyDialog = (msg: ContactMessageItem) => {
    setReplyingTo(msg);
    setReplyText(msg.adminReply || "");
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyingTo) return;
    setSendingReply(true);
    try {
      const newStatus = replyText.trim() ? "resolved" : replyingTo.status;
      const res = await fetch(`/api/admin/messages/${replyingTo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          adminReply: replyText.trim() || null,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to reply");
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === replyingTo.id ? { ...m, ...data.message } : m))
      );
      setReplyOpen(false);
      toast.success("Reply sent successfully!");
    } catch (err) {
      console.error("Failed to send reply:", err);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleChangeStatus = async (msgId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${msgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, ...data.message } : m))
      );
      toast.success(`Message marked as ${statusLabels[newStatus] || newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update message status");
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export?type=messages", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "messages.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Messages exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export messages");
    } finally {
      setExporting(false);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCount = messages.filter((m) => m.status === "open").length;
  const inProgressCount = messages.filter((m) => m.status === "in_progress").length;
  const resolvedCount = messages.filter((m) => m.status === "resolved").length;

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Support Messages</h1>
          <p className="text-white/40 text-sm mt-1">View and respond to user support requests</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] gap-1">
            <AlertCircle className="w-3 h-3" /> {openCount} Open
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] gap-1">
            <Clock className="w-3 h-3" /> {inProgressCount} In Progress
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
            <CheckCircle2 className="w-3 h-3" /> {resolvedCount} Resolved
          </Badge>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={exporting}
            className="bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white text-xs h-8 gap-1.5">
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <Input placeholder="Search by subject, message, or user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-10 rounded-xl" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 rounded-xl w-[160px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a1628] border-white/10">
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">{searchQuery ? "No messages match your search" : "No support messages yet"}</p>
          <p className="text-white/25 text-xs">{searchQuery ? "Try a different search term" : "User messages will appear here when they contact support"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0">
                    {msg.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-white font-semibold text-sm">{msg.subject}</h4>
                      <Badge className={`text-[9px] px-1.5 py-0 ${statusColors[msg.status] || "bg-white/5 text-white/40"}`}>
                        {statusLabels[msg.status] || msg.status}
                      </Badge>
                    </div>
                    <p className="text-white/40 text-xs mb-2 line-clamp-2">{msg.message}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/30">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {msg.user.name}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.user.email}</span>
                      {msg.user.company && <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {msg.user.company}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(msg.createdAt)}</span>
                    </div>
                    {msg.adminReply && (
                      <div className="mt-3 p-3 rounded-lg bg-teal-500/[0.06] border border-teal-500/10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Reply className="w-3 h-3 text-teal-400" />
                          <span className="text-teal-400 text-[10px] font-semibold uppercase tracking-wider">Your Reply</span>
                        </div>
                        <p className="text-white/60 text-xs">{msg.adminReply}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openReplyDialog(msg)}
                      className="text-teal-400/60 hover:text-teal-400 hover:bg-teal-500/10 text-[10px] h-7 gap-1">
                      <Reply className="w-3.5 h-3.5" /> Reply
                    </Button>
                    {msg.status === "open" && (
                      <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(msg.id, "in_progress")}
                        className="text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/10 text-[10px] h-7 gap-1">
                        <Clock className="w-3.5 h-3.5" /> In Progress
                      </Button>
                    )}
                    {(msg.status === "open" || msg.status === "in_progress") && !msg.adminReply && (
                      <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(msg.id, "resolved")}
                        className="text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 text-[10px] h-7 gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="bg-[#0a1628] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Reply to Message</DialogTitle>
            <DialogDescription className="text-white/40">Respond to {replyingTo?.user.name}&apos;s support request</DialogDescription>
          </DialogHeader>
          {replyingTo && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-white text-xs font-semibold">{replyingTo.user.name}</span>
                  <span className="text-white/20 text-[10px]">{formatDate(replyingTo.createdAt)}</span>
                </div>
                <p className="text-white/50 text-xs font-medium mb-1">{replyingTo.subject}</p>
                <p className="text-white/35 text-xs">{replyingTo.message}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Your Reply</Label>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your response..." rows={4}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 rounded-lg text-xs p-2.5 resize-none" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={() => setReplyOpen(false)} className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-9 rounded-xl text-xs">Cancel</Button>
            <Button onClick={handleSendReply} disabled={sendingReply || !replyText.trim()}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold h-9 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 text-xs">
              {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
              {sendingReply ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
