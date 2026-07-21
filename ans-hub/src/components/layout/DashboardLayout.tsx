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
  Menu,
  X,
  Users,
  HelpCircle,
  LogOut,
  MessageSquare,
  GraduationCap,
  Settings,
  TrendingUp,
  ClipboardList,
  FileText,
  MessageSquarePlus,
} from "lucide-react";
import { UserContext } from "../../contexts/UserContext";
import { useFrappeGetCall } from "frappe-react-sdk";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from 'react-i18next';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, logout } = useContext(UserContext);
  const { t } = useTranslation(['navigation', 'common']);

  const navItems = [
    { path: "/home", label: t('navigation:overview'), icon: LayoutDashboard, exact: true },
    { path: "/news", label: t('navigation:newsStories'), icon: Newspaper },
    { path: "/events", label: t('navigation:events'), icon: Calendar },
    { path: "/knowledge", label: t('navigation:knowledgeHub'), icon: BookOpen },
    { path: "/learning", label: t('navigation:learningHub'), icon: GraduationCap },
    { path: "/national-societies", label: t('navigation:nationalSocieties'), icon: Globe2 },
    { path: "/pillars", label: t('navigation:pillars'), icon: Layers },
    { path: "/connect", label: t('navigation:connect'), icon: MessageSquare },
    { path: "/feedback", label: t('navigation:feedback'), icon: MessageSquarePlus },
  ];

  const createItems = [
    { path: "/create/knowledge", label: t('navigation:knowledge'), icon: BookOpen },
    { path: "/create/learning", label: t('navigation:learning'), icon: GraduationCap },
    { path: "/create/news", label: t('navigation:newsStories'), icon: Newspaper },
    { path: "/create/event", label: t('navigation:event'), icon: Calendar, adminOnly: true },
  ];

  const fsItems = [
    { path: "/financial-sustainability", label: "Dashboard", icon: TrendingUp, exact: true, managerOnly: true },
    { path: "/financial-sustainability/activities", label: "Activities", icon: Calendar, managerOnly: true },
    { path: "/financial-sustainability/responses", label: "Responses", icon: ClipboardList, managerOnly: true },
    { path: "/fs-assessment", label: "Take Assessment", icon: FileText, external: true, newTab: true },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch organization settings from onerc_core
  const { data: orgData } = useFrappeGetCall(
    "onerc_core.api.organization.get_organization_settings",
    {}
  );

  const orgSettings = orgData?.message || orgData || {};
  const organizationName = orgSettings.organization_name || "";

  // Check if user has admin or manager roles
  const userRoles = userData?.roles?.map((r: any) => r.role) || [];
  const isAdminOrManager =
    userRoles.includes("LH Admin") ||
    userRoles.includes("LH Manager") ||
    userRoles.includes("System Manager");

  const isAdmin =
    userRoles.includes("LH Admin") ||
    userRoles.includes("System Manager");

  const managementItems = [
    { path: "/users", label: t('navigation:users'), icon: Users },
    { path: "/feedback/admin", label: t('navigation:feedbackAdmin'), icon: ClipboardList, adminOnly: true },
    { path: "/faqs", label: t('navigation:faqs'), icon: HelpCircle },
    { path: "/app", label: t('navigation:desk'), icon: Settings, external: true },
  ];

  // Financial Sustainability admin pages are limited to FS managers.
  const isFsManager =
    userRoles.includes("LH FS Manager") ||
    userRoles.includes("System Manager");

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (item: { path: string; exact?: boolean }) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/");

  const allNavItems = [...navItems, ...fsItems, ...createItems, ...managementItems];
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
        <Link
          to="/"
          className="flex h-14 items-center gap-3 px-4 border-b border-white/10 shrink-0 hover:bg-white/5 transition-colors"
        >
          {orgSettings.logo ? (
            <img
              src={orgSettings.logo}
              alt="Logo"
              className="h-8 w-8 shrink-0 object-contain rounded"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-dash-red font-bold text-white text-sm">
              +
            </div>
          )}
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white leading-tight whitespace-nowrap">
                {organizationName}
              </div>
            </div>
          )}
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item);
              const className = [
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-dash-red/20 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white",
                collapsed ? "justify-center px-0" : "",
              ].join(" ");

              const content = (
                <>
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
                </>
              );

              // External links open in new tab
              if (item.external) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={collapsed ? item.label : undefined}
                    className={className}
                  >
                    {content}
                  </a>
                );
              }

              // Internal navigation
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={className}
                >
                  {content}
                </Link>
              );
            })}
          </div>

          {/* Language Switcher in Navbar */}
          <div className="px-3 py-2">
            <LanguageSwitcher />
          </div>

          {/* Financial Sustainability Section */}
          <div className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Financial Sustainability
              </div>
            )}
            {fsItems
              .filter((item: any) => !item.managerOnly || isFsManager)
              .map((item) => {
                const active = isActive(item);
                const className = [
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-dash-red/20 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white",
                  collapsed ? "justify-center px-0" : "",
                ].join(" ");

                const content = (
                  <>
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
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {active && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-dash-red" />
                    )}
                  </>
                );

                // The public assessment form is a separate Frappe page → open in a new tab
                if ((item as any).external) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      target={(item as any).newTab ? "_blank" : undefined}
                      rel={(item as any).newTab ? "noopener noreferrer" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={className}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              })}
          </div>

          {/* Create Section */}
          <div className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {t('navigation:sectionCreate')}
              </div>
            )}
            {createItems
              .filter((item: any) => !item.adminOnly || isAdminOrManager)
              .map((item) => {
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
                {t('navigation:sectionManagement')}
              </div>
            )}
            {managementItems
              .filter((item: any) => {
                if (item.adminOnly) return isAdmin;
                if (item.path === "/users" || item.path.startsWith("/app")) return isAdminOrManager;
                return true;
              })
              .map((item) => {
              const active = isActive(item);
              const className = [
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-dash-red/20 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white",
                collapsed ? "justify-center px-0" : "",
              ].join(" ");

              const content = (
                <>
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
                </>
              );

              // External links open in same tab (for Desk)
              if (item.external) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    title={collapsed ? item.label : undefined}
                    className={className}
                  >
                    {content}
                  </a>
                );
              }

              // Internal navigation
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={className}
                >
                  {content}
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
              <span>{t('common:signOut')}</span>
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

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-dash-red transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4.5 w-4.5 font-bold stroke-[3]" />
            ) : (
              <ChevronLeft className="h-4.5 w-4.5 font-bold stroke-[3]" />
            )}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <Link
              to="/home"
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {t('navigation:hub')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <span className="font-medium text-gray-800">{currentPage}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
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
        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
