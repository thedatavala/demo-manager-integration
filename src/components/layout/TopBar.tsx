import { Link } from "@tanstack/react-router";
import { Activity, Bell, Menu, RefreshCw, Search, Settings, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDataRetry } from "@/hooks/useDataRetry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ICON_BTN =
  "icon3d relative grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground " +
  "transition-[transform,box-shadow,color,background-color] duration-200 " +
  "hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, signOut } = useAuth();
  const { retryAll, isRetrying, registered, lastRetryAt } = useDataRetry();

  const email = user?.email ?? "not signed in";
  const name = user?.user_metadata?.full_name || email.split("@")[0] || "Demo Manager";
  const initials = name.slice(0, 2).toUpperCase();

  const handleRecheck = async () => {
    await retryAll();
    toast.success(`Rechecked ${registered} panel${registered === 1 ? "" : "s"}`);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-full items-center gap-3 px-3 sm:px-5">
          <button onClick={onOpenMenu} className={cn(ICON_BTN, "lg:hidden")} aria-label="Open menu">
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <div className="hidden sm:flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2 max-w-md">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              placeholder="Search demos, categories, issues…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <nav className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 px-2.5 py-1.5">
              <Activity className="h-3.5 w-3.5 animate-pulse text-accent-emerald" />
              <span className="font-mono text-[11px] text-accent-emerald">LIVE MONITORING</span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => void handleRecheck()}
                  className={ICON_BTN}
                  aria-label="Recheck all panels"
                >
                  <RefreshCw className={cn("h-[18px] w-[18px]", isRetrying && "animate-spin")} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Recheck all · {registered} panels
                {lastRetryAt ? ` · ${new Date(lastRetryAt).toLocaleTimeString()}` : ""}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/demo-ops" className={ICON_BTN} aria-label="Notification center">
                  <Bell className="h-[18px] w-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Notification center</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/demo-ops"
                  className={cn(ICON_BTN, "hidden xl:grid")}
                  aria-label="Ops settings"
                >
                  <Settings className="h-[18px] w-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Ops settings</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/demo-workspace"
                  className={cn(ICON_BTN, "icon3d--accent text-primary-foreground")}
                  aria-label="Create demo"
                >
                  <Plus className="h-[18px] w-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Create demo</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-0.5 relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-[11px] font-bold text-primary-foreground ring-1 ring-foreground/15 transition-transform duration-200 active:scale-[0.96]"
                  aria-label="Profile"
                >
                  {initials}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-emerald ring-2 ring-background" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="min-w-0">
                  <div className="truncate text-sm font-semibold">{name}</div>
                  <div className="truncate text-[11px] font-normal text-muted-foreground">
                    {email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/demo-manager" className="cursor-pointer">
                    Demo dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/demo-ops" className="cursor-pointer">
                    Operations center
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={() => void signOut()}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
    </TooltipProvider>
  );
}

export default TopBar;
