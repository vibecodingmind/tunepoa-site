"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  Users,
  CreditCard,
  LogOut,
  Loader2,
  Menu,
  Music,
  ShieldCheck,
  X,
  ChevronLeft,
  Mail,
  FileText,
  Globe,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
];

/* ─── Sidebar Content Component (declared outside render) ─── */
function SidebarContent({
  mobile = false,
  sidebarCollapsed,
  user,
  pathname,
  onNavigate,
  onLogout,
}: {
  mobile?: boolean;
  sidebarCollapsed: boolean;
  user: { name: string; email: string };
  pathname: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
          <Music className="w-5 h-5 text-white" />
        </div>
        {(!sidebarCollapsed || mobile) && (
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm tracking-tight truncate">TunePoa</h1>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span className="text-teal-400/70 text-[10px] font-semibold tracking-wider uppercase">Admin</span>
            </div>
          </div>
        )}
        {mobile && (
          <button
            onClick={() => onNavigate("")}
            className="ml-auto text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <Separator className="bg-white/5 mx-3 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-teal-400" : ""}`} />
              {(!sidebarCollapsed || mobile) && <span className="truncate">{item.label}</span>}
              {isActive && (!sidebarCollapsed || mobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50" />
              )}
            </button>
          );
        })}
      </nav>

      <Separator className="bg-white/5 mx-3 w-auto" />

      {/* User Section */}
      <div className="p-3">
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 ${sidebarCollapsed && !mobile ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-white/30 text-[10px] truncate">{user.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          className={`w-full mt-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 text-xs h-9 rounded-xl gap-2 transition-colors duration-200 ${sidebarCollapsed && !mobile ? "px-0 justify-center" : ""}`}
        >
          <LogOut className="w-3.5 h-3.5" />
          {(!sidebarCollapsed || mobile) && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleNavigate = (href: string) => {
    if (!href) {
      setMobileOpen(false);
      return;
    }
    router.push(href);
    setMobileOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050c18]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050c18] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/50 via-[#081525] to-cyan-950/30" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-teal-500/[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[100px]" />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 glass-strong border-r border-white/5 transition-all duration-300 ${
          sidebarCollapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        <SidebarContent
          sidebarCollapsed={sidebarCollapsed}
          user={user}
          pathname={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#0d1a2e] border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/20 transition-all duration-200"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="bg-[#060e1a]/98 backdrop-blur-2xl border-white/5 w-64 p-0">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SheetDescription className="sr-only">Navigation menu for the admin panel</SheetDescription>
          <SidebarContent
            mobile
            sidebarCollapsed={sidebarCollapsed}
            user={user}
            pathname={pathname}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className={`relative z-10 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 navbar-scrolled border-b border-white/5">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-white/50 hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/25 text-[10px] px-2 py-0 font-semibold">
                  ADMIN
                </Badge>
                <span className="text-white/20 text-xs">/</span>
                <span className="text-white/60 text-xs font-medium">
                  {navItems.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)))?.label || "Dashboard"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={() => setLocale(locale === "en" ? "sw" : "en")}
                className="flex items-center gap-1.5 text-white/40 hover:text-teal-400 text-[10px] font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                title={locale === "en" ? "Badilisha kwa Kiswahili" : "Switch to English"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{locale}</span>
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white/50 text-xs font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
