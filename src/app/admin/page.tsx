"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CreditCard,
  Phone,
  DollarSign,
  Loader2,
  TrendingUp,
  UserCheck,
  UserX,
  Package,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalNumbers: number;
  activeNumbers: number;
  totalPackages: number;
  totalRevenue: number;
}

interface AnalyticsData {
  monthlyRevenue: { month: string; revenue: number }[];
  subscriptionGrowth: { month: string; total: number; active: number }[];
  subscriptionStatus: { status: string; count: number }[];
  packagePopularity: { name: string; tier: string; subscriptions: number }[];
  paymentMethodDistribution: { method: string; count: number }[];
}

const defaultStats: DashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  suspendedUsers: 0,
  totalSubscriptions: 0,
  activeSubscriptions: 0,
  totalNumbers: 0,
  activeNumbers: 0,
  totalPackages: 0,
  totalRevenue: 0,
};

function formatTZS(amount: number): string {
  return amount.toLocaleString("en-TZ");
}

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  expired: "#6b7280",
};

const CHART_COLORS = ["#14b8a6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminOverviewPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats", { credentials: "include" }),
        fetch("/api/admin/analytics", { credentials: "include" }),
      ]);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || defaultStats);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [authLoading, isAdmin, fetchData]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/60 text-sm mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(""); fetchData(); }}
            className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const primaryCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-teal-500 to-emerald-500",
      bgGlow: "teal-500/[0.06]",
      detail: `${stats.activeUsers} active`,
      detailIcon: UserCheck,
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      gradient: "from-cyan-500 to-blue-500",
      bgGlow: "cyan-500/[0.06]",
      detail: `${stats.totalSubscriptions} total`,
      detailIcon: TrendingUp,
    },
    {
      label: "Active Numbers",
      value: stats.activeNumbers,
      icon: Phone,
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "emerald-500/[0.06]",
      detail: `${stats.totalNumbers} total`,
      detailIcon: Activity,
    },
    {
      label: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "amber-500/[0.06]",
      detail: "TZS",
      detailIcon: TrendingUp,
      isCurrency: true,
    },
  ];

  const secondaryCards = [
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Suspended Users",
      value: stats.suspendedUsers,
      icon: UserX,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Total Packages",
      value: stats.totalPackages,
      icon: Package,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Total Subscriptions",
      value: stats.totalSubscriptions,
      icon: CreditCard,
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-white/40 text-sm mt-1">Monitor your TunePoa platform at a glance</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {primaryCards.map((card) => {
          const Icon = card.icon;
          const DetailIcon = card.detailIcon;
          return (
            <div key={card.label} className="glass-card rounded-2xl p-5 relative overflow-hidden group">
              <div className={`absolute -top-8 -right-8 w-32 h-32 bg-${card.bgGlow} rounded-full blur-[60px] group-hover:bg-opacity-20 transition-all duration-500`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-black/20`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10 text-[10px] font-medium">
                    {card.isCurrency ? "TZS" : "Total"}
                  </Badge>
                </div>
                <div className="mb-1">
                  <p className="text-2xl font-extrabold text-white tracking-tight">
                    {card.isCurrency ? formatTZS(card.value) : card.value.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <DetailIcon className="w-3 h-3 text-white/25" />
                  <p className="text-white/35 text-xs">{card.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center ${card.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{card.value.toLocaleString()}</p>
                <p className="text-white/35 text-[10px] font-medium">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Revenue (Last 6 Months)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 12 }}
                    formatter={(value: number) => [`${formatTZS(value)} TZS`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: "#14b8a6" }} activeDot={{ r: 6, fill: "#14b8a6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscription Growth Chart */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Subscription Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subscriptionGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
                  <Bar dataKey="total" fill="#06b6d4" radius={[4, 4, 0, 0]} name="New" />
                  <Bar dataKey="active" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Active" />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscription Status Pie */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Subscription Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.subscriptionStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.subscriptionStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Package Popularity */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Package Popularity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.packagePopularity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} width={100} />
                  <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
                  <Bar dataKey="subscriptions" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Subscriptions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Manage Packages", href: "/admin/packages", icon: Package, color: "from-teal-500/10 to-cyan-500/10 border-teal-500/20 hover:border-teal-500/40" },
            { label: "View Users", href: "/admin/users", icon: Users, color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40" },
            { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, color: "from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40" },
            { label: "Active Numbers", href: "/admin/subscriptions", icon: Phone, color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40" },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${action.color} border transition-all duration-200 hover:scale-[1.02] text-left`}
              >
                <ActionIcon className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-white/60 text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
