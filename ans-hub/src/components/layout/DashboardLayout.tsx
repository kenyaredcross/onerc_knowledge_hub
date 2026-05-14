import { useState, useEffect, useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  BookOpen,
  Layers,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
  Users,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { UserContext } from "../../contexts/UserContext";

const navItems = [
  { path: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "/news", label: "News & Stories", icon: Newspaper },
  { path: "/events", label: "Events", icon: Calendar },
  { path: "/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { path: "/national-societies", label: "National Societies", icon: Globe2 },
  { path: "/pillars", label: "Pillars", icon: Layers },
];

const createItems = [
  { path: "/create/knowledge", label: "Knowledge", icon: BookOpen },
  { path: "/create/news", label: "News & Stories", icon: Newspaper },
];

const managementItems = [
  { path: "/users", label: "Users", icon: Users },
  { path: "/faqs", label: "FAQs", icon: HelpCircle },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, logout } = useContext(UserContext);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (item: { path: string; exact?: boolean }) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/");

  const allNavItems = [...navItems, ...createItems, ...managementItems];
  const currentPage =
    allNavItems.find((n) => isActive(n))?.label ?? "Overview";

  // Get user initials
  const userInitials = userData
    ? `${userData.first_name?.[0] || ""}${userData.last_name?.[0] || ""}`.toUpperCase()
    : "LA";

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-dash-bg overflow-hidden">
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "fixed top-0 left-0 z-50 flex h-full flex-col bg-dash-navy transition-all duration-300 ease-out",
          "lg:relative lg:translate-x-0",
          collapsed ? "lg:w-[68px]" : "lg:w-[252px]",
          mobileOpen ? "translate-x-0 w-[252px]" : "-translate-x-full w-[252px] lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-3 px-4 border-b border-white/10 shrink-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-dash-red font-bold text-white text-sm">
            +
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white leading-tight whitespace-nowrap">
                Localisation Hub
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-dash-red/20 text-white"
                      : "text-white/60 hover:bg-white/8 hover:text-white",
                    collapsed ? "justify-center px-0" : "",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute left-0 h-6 w-0.5 rounded-r bg-dash-red" />
                  )}
                  <item.icon
                    className={[
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      active ? "text-dash-red" : "text-white/50 group-hover:text-white/80",
                    ].join(" ")}
                    style={{ height: "1.125rem", width: "1.125rem" }}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-dash-red" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Create Section */}
          <div className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Create
              </div>
            )}
            {createItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-dash-red/20 text-white"
                      : "text-white/60 hover:bg-white/8 hover:text-white",
                    collapsed ? "justify-center px-0" : "",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute left-0 h-6 w-0.5 rounded-r bg-dash-red" />
                  )}
                  <item.icon
                    className={[
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      active ? "text-dash-red" : "text-white/50 group-hover:text-white/80",
                    ].join(" ")}
                    style={{ height: "1.125rem", width: "1.125rem" }}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-dash-red" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Management Section */}
          <div className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Management.
              </div>
            )}
            {managementItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-dash-red/20 text-white"
                      : "text-white/60 hover:bg-white/8 hover:text-white",
                    collapsed ? "justify-center px-0" : "",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute left-0 h-6 w-0.5 rounded-r bg-dash-red" />
                  )}
                  <item.icon
                    className={[
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      active ? "text-dash-red" : "text-white/50 group-hover:text-white/80",
                    ].join(" ")}
                    style={{ height: "1.125rem", width: "1.125rem" }}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-dash-red" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-end border-t border-white/10 px-3 py-3 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-white/5 p-3 text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-4 border-b border-dash-border bg-white px-4 lg:px-6 shrink-0">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400">Hub</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <span className="font-medium text-gray-800">{currentPage}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 h-8 w-52 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span>Search…</span>
            </div>

            {/* Notification bell */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-dash-red" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate("/profile")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-navy text-[11px] font-bold text-white select-none hover:bg-opacity-90 transition-all hover:ring-2 hover:ring-dash-red hover:ring-offset-2 cursor-pointer"
              title="View Profile"
            >
              {userInitials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
