import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
  LogOut,
  Settings,
} from "lucide-react";

import softwareValaLogo from "@/assets/software-vala-logo-transparent.png";
import { cn } from "@/lib/utils";
import { primary, type NavItem } from "@/lib/nav/navigation";
import { menuSections } from "@/components/demo-manager/DemoManagerSidebar";
import { useAuth } from "@/hooks/useAuth";

const COLLAPSE_KEY = "sv:sidebar:collapsed";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });

  return { collapsed, toggleCollapsed, mobileOpen, setMobileOpen };
}

/** Demo Manager sections become sidebar groups (`/?view=<id>`). */
const viewGroups = menuSections.map((section) => ({
  label: section.label,
  badge: section.badge ?? null,
  items: (section.subItems ?? []).map((sub) => ({
    label: sub.label,
    to: "/",
    view: sub.id,
    icon: sub.icon as NavItem["icon"],
  })),
}));

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as { view?: string };
  const activeView = search?.view ?? "live-demo-count";
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Demo Manager";
  const initials = userName.charAt(0).toUpperCase();

  const isActive = (item: NavItem) => {
    if (item.view) return pathname === "/" && activeView === item.view;
    if (item.to === "/") return pathname === "/" && !search?.view;
    return pathname.startsWith(item.to);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return viewGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  const groupOpen = (label: string, items: NavItem[]) =>
    openGroups[label] ?? items.some((i) => isActive(i));

  const ItemLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item);
    return (
      <Link
        to={item.to}
        search={item.view ? ({ view: item.view } as never) : undefined}
        onClick={onCloseMobile}
        title={item.label}
        className={cn(
          "group/item relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150",
          collapsed && "justify-center px-0",
          active
            ? "bg-primary/20 text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]",
        )}
      >
        {active && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary" />
        )}
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  const content = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b border-border px-3 shrink-0",
          collapsed && "justify-center px-0",
        )}
      >
        <Link to="/" className="flex items-center gap-2 min-w-0" onClick={onCloseMobile}>
          <img
            src={softwareValaLogo}
            alt="Software Vala"
            className="h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-primary/30"
          />
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">Software Vala</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggleCollapsed}
            className="ml-auto hidden lg:grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onCloseMobile}
          className="ml-auto lg:hidden grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={onToggleCollapsed}
          className="mx-auto mt-3 hidden lg:grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {!collapsed && (
        <div className="px-3 pt-3 shrink-0">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a section…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
        <div className="space-y-0.5">
          {primary.map((item) => (
            <ItemLink key={item.to} item={item} />
          ))}
        </div>

        {(filtered ?? viewGroups).map((group) => {
          const open = filtered ? true : groupOpen(group.label, group.items);
          if (collapsed) {
            return (
              <div key={group.label} className="space-y-0.5 border-t border-border/60 pt-2">
                {group.items.map((item) => (
                  <ItemLink key={item.view ?? item.to} item={item} />
                ))}
              </div>
            );
          }
          return (
            <div key={group.label}>
              <button
                onClick={() => setOpenGroups((s) => ({ ...s, [group.label]: !open }))}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="truncate">{group.label}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {"badge" in group && group.badge && (
                    <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-mono text-primary">
                      {group.badge}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      open && "rotate-180",
                    )}
                  />
                </span>
              </button>
              {open && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => (
                    <ItemLink key={item.view ?? item.to} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-2 space-y-2">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/60 px-2.5 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-[11px] font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{userName}</p>
              <p className="truncate text-[10px] text-muted-foreground">Demo Manager</p>
            </div>
            <button
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => void signOut()}
            aria-label="Sign out"
            className="mx-auto grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
        <Link
          to="/demo-ops"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Ops Settings</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 border-r border-border bg-background/80 backdrop-blur-xl sticky top-0 h-screen transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-[264px]",
        )}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-label="Close menu overlay"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-border bg-background shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default AppSidebar;
