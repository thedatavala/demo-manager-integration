/**
 * DEMO MANAGER — LIVE PANEL DATA
 * ==============================
 * Every query here reads a real Software Vala table. No mock arrays, no
 * random generators: panels that cannot be backed by a real column render a
 * documented "monitor gap" note instead.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DemoRow = Database["public"]["Tables"]["demos"]["Row"];
type DemoStatus = Database["public"]["Enums"]["demo_status"];

export const demoPanelKeys = {
  demos: ["demo-panels", "demos"] as const,
  health: ["demo-panels", "health"] as const,
  clicks: ["demo-panels", "clicks"] as const,
  analytics: ["demo-panels", "analytics"] as const,
  catalog: ["demo-panels", "catalog"] as const,
  alerts: ["demo-panels", "alerts"] as const,
  roles: ["demo-panels", "login-roles"] as const,
};

/* ─────────────── Demos (status grid, URL manager) ─────────────── */

export interface DemoPanelItem {
  id: string;
  title: string;
  category: string;
  techStack: string;
  status: DemoStatus;
  uiStatus: "active" | "maintenance" | "offline";
  uptime: number | null;
  healthScore: number | null;
  responseTimeMs: number | null;
  httpStatus: number | null;
  lastCheck: string | null;
  url: string;
  loginUrl: string | null;
  maskedUrl: string | null;
  expiryDate: string | null;
  renewalDate: string | null;
  loginRoles: number;
  lifecycle: string | null;
  verification: string | null;
  createdAt: string;
  isTrending: boolean;
}

const toUi = (row: DemoRow): DemoPanelItem["uiStatus"] => {
  if (row.status === "active") return "active";
  if (row.status === "maintenance") return "maintenance";
  return "offline";
};

const mapDemo = (row: DemoRow): DemoPanelItem => ({
  id: row.id,
  title: row.title,
  category: row.category,
  techStack: row.tech_stack,
  status: row.status,
  uiStatus: toUi(row),
  uptime: row.uptime_percentage ?? null,
  healthScore: row.health_score ?? null,
  responseTimeMs: row.response_time_ms ?? null,
  httpStatus: row.http_status ?? null,
  lastCheck: row.last_health_check ?? null,
  url: row.url,
  loginUrl: row.login_url ?? null,
  maskedUrl: row.masked_url ?? null,
  expiryDate: row.expiry_date ?? null,
  renewalDate: row.renewal_date ?? null,
  loginRoles: row.total_login_roles ?? 0,
  lifecycle: row.lifecycle_status ?? null,
  verification: row.verification_status ?? null,
  createdAt: row.created_at,
  isTrending: Boolean(row.is_trending),
});

export const useDemoPanelDemos = () =>
  useQuery({
    queryKey: demoPanelKeys.demos,
    queryFn: async (): Promise<DemoPanelItem[]> => {
      const { data, error } = await supabase
        .from("demos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []).map(mapDemo);
    },
  });

/** Shared write actions used by the status grid and URL manager. */
export const useDemoPanelActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: demoPanelKeys.demos });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DemoStatus }) => {
      const { error } = await supabase.from("demos").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateUrl = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const { error } = await supabase
        .from("demos")
        .update({ url, normalized_url: url.replace(/\/+$/, "").toLowerCase() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setExpiry = useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) => {
      const next = new Date(Date.now() + days * 86_400_000).toISOString();
      const { error } = await supabase
        .from("demos")
        .update({ expiry_date: next, renewal_date: next })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { setStatus, updateUrl, setExpiry, invalidate };
};

/* ─────────────── Health / uptime ─────────────── */

export interface HealthCheckItem {
  id: string;
  demoId: string;
  status: DemoStatus;
  responseTime: number | null;
  errorMessage: string | null;
  checkedAt: string;
}

export const useDemoHealthChecks = (limit = 300) =>
  useQuery({
    queryKey: [...demoPanelKeys.health, limit],
    queryFn: async (): Promise<HealthCheckItem[]> => {
      const { data, error } = await supabase
        .from("demo_health")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        demoId: row.demo_id,
        status: row.status,
        responseTime: row.response_time ?? null,
        errorMessage: row.error_message ?? null,
        checkedAt: row.checked_at,
      }));
    },
  });

/* ─────────────── Clicks / analytics ─────────────── */

export interface ClickItem {
  id: string;
  demoId: string;
  clickedAt: string;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  referrer: string | null;
  converted: boolean;
  sessionDuration: number | null;
  resellerId: string | null;
  userRole: string | null;
}

export const useDemoClicks = (limit = 1000) =>
  useQuery({
    queryKey: [...demoPanelKeys.clicks, limit],
    queryFn: async (): Promise<ClickItem[]> => {
      const { data, error } = await supabase
        .from("demo_clicks")
        .select("*")
        .order("clicked_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        demoId: row.demo_id,
        clickedAt: row.clicked_at,
        country: row.country ?? null,
        region: row.region ?? null,
        city: row.city ?? null,
        deviceType: row.device_type ?? null,
        browser: row.browser ?? null,
        referrer: row.referrer ?? null,
        converted: Boolean(row.converted),
        sessionDuration: row.session_duration ?? null,
        resellerId: row.reseller_id ?? null,
        userRole: row.user_role ?? null,
      }));
    },
  });

export interface AnalyticsDayItem {
  id: string;
  demoId: string;
  date: string;
  totalViews: number;
  uniqueViews: number;
  bounceRate: number | null;
  conversionRate: number | null;
  conversionCount: number;
  avgDurationSeconds: number | null;
}

export const useDemoAnalytics = (days = 30) =>
  useQuery({
    queryKey: [...demoPanelKeys.analytics, days],
    queryFn: async (): Promise<AnalyticsDayItem[]> => {
      const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("demo_analytics")
        .select("*")
        .gte("date", from)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        demoId: row.demo_id,
        date: row.date,
        totalViews: row.total_views ?? 0,
        uniqueViews: row.unique_views ?? 0,
        bounceRate: row.bounce_rate ?? null,
        conversionRate: row.conversion_rate ?? null,
        conversionCount: row.conversion_count ?? 0,
        avgDurationSeconds: row.avg_duration_seconds ?? null,
      }));
    },
  });

/* ─────────────── Catalog ─────────────── */

export interface CatalogItem {
  id: string;
  name: string;
  category: string | null;
  vendor: string | null;
  type: string;
  demoUrl: string | null;
  demoId: string | null;
  registered: boolean;
  basePrice: number | null;
}

export const useSoftwareCatalog = () =>
  useQuery({
    queryKey: demoPanelKeys.catalog,
    queryFn: async (): Promise<CatalogItem[]> => {
      const { data, error } = await supabase
        .from("software_catalog")
        .select("*")
        .order("name", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category ?? null,
        vendor: row.vendor ?? null,
        type: row.type,
        demoUrl: row.demo_url ?? null,
        demoId: row.demo_id ?? null,
        registered: Boolean(row.is_demo_registered),
        basePrice: row.base_price ?? null,
      }));
    },
  });

/* ─────────────── Alerts / notifications ─────────────── */

export interface AlertItem {
  id: string;
  demoId: string;
  alertType: string;
  message: string;
  createdAt: string;
  isActive: boolean;
  requiresAction: boolean;
  acknowledgedAt: string | null;
  actionTaken: string | null;
}

export const useDemoAlerts = () =>
  useQuery({
    queryKey: demoPanelKeys.alerts,
    queryFn: async (): Promise<AlertItem[]> => {
      const { data, error } = await supabase
        .from("demo_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        demoId: row.demo_id,
        alertType: row.alert_type,
        message: row.message,
        createdAt: row.created_at,
        isActive: row.is_active !== false,
        requiresAction: Boolean(row.requires_action),
        acknowledgedAt: row.acknowledged_at ?? null,
        actionTaken: row.action_taken ?? null,
      }));
    },
  });

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action?: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("demo_alerts")
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: auth.user?.id ?? null,
          is_active: false,
          action_taken: action ?? "acknowledged",
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: demoPanelKeys.alerts }),
  });
};

/* ─────────────── Login roles (URL manager access modes) ─────────────── */

export const useDemoLoginRoleCounts = () =>
  useQuery({
    queryKey: demoPanelKeys.roles,
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("demo_login_roles")
        .select("demo_id,is_active")
        .limit(2000);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (row.is_active === false) continue;
        counts[row.demo_id] = (counts[row.demo_id] ?? 0) + 1;
      }
      return counts;
    },
  });
