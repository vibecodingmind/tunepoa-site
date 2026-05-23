"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, X, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

interface NotificationBellProps {
  /** Which API prefix to use: "user" or "admin" */
  apiPrefix?: "user" | "admin";
  className?: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function typeColor(type: string): string {
  switch (type) {
    case "success": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    case "warning": return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    case "error": return "bg-red-500/15 text-red-400 border-red-500/25";
    default: return "bg-teal-500/15 text-teal-400 border-teal-500/25";
  }
}

export default function NotificationBell({ apiPrefix = "user", className = "" }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/${apiPrefix}/notifications?limit=15`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silent fail
    }
  }, [apiPrefix]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/${apiPrefix}/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silent fail
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch(`/api/${apiPrefix}/notifications`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // Silent fail
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/${apiPrefix}/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        const wasUnread = notifications.find((n) => n.id === id)?.isRead === false;
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silent fail
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.isRead) handleMarkRead(notif.id);
    if (notif.actionUrl) {
      setOpen(false);
      router.push(notif.actionUrl);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[9px] font-bold rounded-full px-1 shadow-lg shadow-teal-500/30">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-strong rounded-xl border border-white/10 shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="text-teal-400/70 hover:text-teal-400 text-[10px] font-medium flex items-center gap-1 transition-colors"
                >
                  {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/60 p-1 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Bell className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-white/30 text-xs">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03] ${
                      !notif.isRead ? "bg-teal-500/[0.03]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[8px] px-1.5 py-0 ${typeColor(notif.type)}`}>
                            {notif.category}
                          </Badge>
                          {!notif.isRead && (
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs font-medium mb-0.5 ${!notif.isRead ? "text-white" : "text-white/60"}`}>
                          {notif.title}
                        </p>
                        <p className="text-white/35 text-[10px] line-clamp-2">{notif.message}</p>
                        <p className="text-white/20 text-[9px] mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="text-white/15 hover:text-red-400 p-1 rounded transition-colors shrink-0 mt-0.5"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
