import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Gauge,
  Boxes,
  Package,
  MonitorPlay,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  /** Optional demo-manager view id — routed as `/?view=<id>`. */
  view?: string;
  icon: LucideIcon;
  badge?: string | null;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Route-level modules — always visible at the top of the sidebar. */
export const primary: NavItem[] = [
  { label: "Demo Control Room", to: "/", icon: LayoutGrid },
  { label: "Operations Center", to: "/demo-ops", icon: Gauge },
  { label: "Demo Workspace", to: "/demo-workspace", icon: MonitorPlay },
  { label: "Product & Demo Studio", to: "/product-demo-manager", icon: Package },
  { label: "Demo Dashboard", to: "/demo-manager", icon: Boxes },
];
