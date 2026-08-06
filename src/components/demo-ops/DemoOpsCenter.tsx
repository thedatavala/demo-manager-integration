/**
 * DEMO OPERATIONS CENTER
 * ======================
 * Sectioned control room for monitoring, branding, lifecycle, security,
 * analytics, alerts, actions, audit and diagnostics. Same Software Vala
 * glass/neon design system as the rest of the Demo Manager.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bell,
  Bot,
  CalendarClock,
  Camera,
  FileStack,
  Gauge,
  Globe,
  Heart,
  Palette,
  ShieldAlert,
  UserCog,
  Zap,
  LineChart,
  DatabaseBackup,
} from "lucide-react";
import { OpsDetectionPanel, OpsHealthMonitor, OpsKpiGrid } from "./OpsHealthPanels";
import { OpsBrandingPanel, OpsDomainPanel } from "./OpsBrandingDomainPanels";
import { OpsBackupPanel, OpsLifecyclePanel } from "./OpsLifecyclePanels";
import {
  OpsAnalyticsPanel,
  OpsResourceStrip,
  OpsScorePanel,
  OpsScreenshotPanel,
  OpsSecurityPanel,
} from "./OpsQualityPanels";
import {
  OpsActionsPanel,
  OpsAlertsPanel,
  OpsAssignmentPanel,
  OpsAssistantPanel,
  OpsAuditPanel,
} from "./OpsOperationsPanels";

const SECTIONS = [
  { id: "overview", label: "Overview & KPIs", icon: Gauge },
  { id: "health", label: "Health Monitor", icon: Heart },
  { id: "detection", label: "Failure Detection", icon: ShieldAlert },
  { id: "branding", label: "Branding Engine", icon: Palette },
  { id: "domain", label: "Domain · SSL · DNS", icon: Globe },
  { id: "screenshots", label: "Screenshot Monitor", icon: Camera },
  { id: "lifecycle", label: "Expiry & Lifecycle", icon: CalendarClock },
  { id: "quality", label: "Performance & Resources", icon: Gauge },
  { id: "security", label: "Security Scan", icon: ShieldAlert },
  { id: "analytics", label: "Usage Analytics", icon: LineChart },
  { id: "alerts", label: "Notification Center", icon: Bell },
  { id: "actions", label: "One Click Actions", icon: Zap },
  { id: "assignment", label: "Issue Assignment", icon: UserCog },
  { id: "audit", label: "Audit Trail", icon: FileStack },
  { id: "backup", label: "Backup & Restore", icon: DatabaseBackup },
  { id: "assistant", label: "Diagnostics Assistant", icon: Bot },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const DemoOpsCenter = () => {
  const [active, setActive] = useState<SectionId>("overview");

  const render = () => {
    switch (active) {
      case "overview":
        return (
          <div className="space-y-4">
            <OpsKpiGrid />
            <OpsResourceStrip />
            <OpsHealthMonitor />
          </div>
        );
      case "health":
        return <OpsHealthMonitor />;
      case "detection":
        return <OpsDetectionPanel />;
      case "branding":
        return <OpsBrandingPanel />;
      case "domain":
        return <OpsDomainPanel />;
      case "screenshots":
        return <OpsScreenshotPanel />;
      case "lifecycle":
        return <OpsLifecyclePanel />;
      case "quality":
        return (
          <div className="space-y-4">
            <OpsResourceStrip />
            <OpsScorePanel />
          </div>
        );
      case "security":
        return <OpsSecurityPanel />;
      case "analytics":
        return <OpsAnalyticsPanel />;
      case "alerts":
        return <OpsAlertsPanel />;
      case "actions":
        return <OpsActionsPanel />;
      case "assignment":
        return <OpsAssignmentPanel />;
      case "audit":
        return <OpsAuditPanel />;
      case "backup":
        return <OpsBackupPanel />;
      case "assistant":
        return <OpsAssistantPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 shrink-0 border-r border-border/30 bg-card sticky top-0 h-screen">
        <div className="p-4 border-b border-border/30">
          <h1 className="text-sm font-semibold text-foreground">Operations Center</h1>
          <p className="text-[10px] text-muted-foreground font-mono">real monitoring · zero fake data</p>
        </div>
        <ScrollArea className="h-[calc(100vh-72px)]">
          <nav className="p-2 space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActive(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                    active === section.id
                      ? "bg-neon-teal/10 text-neon-teal border-l-2 border-neon-teal"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 min-w-0">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-5 space-y-4"
        >
          {render()}
        </motion.div>
      </main>
    </div>
  );
};

export default DemoOpsCenter;
