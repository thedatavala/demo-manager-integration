import { createFileRoute } from "@tanstack/react-router";
import DemoOpsCenter from "@/components/demo-ops/DemoOpsCenter";

export const Route = createFileRoute("/demo-ops")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Demo Operations Center — Software Vala" },
      {
        name: "description",
        content:
          "Live demo operations: health monitoring, failure detection, branding validation, SSL and domain checks, expiry, security, analytics, alerts and audit trail.",
      },
      { property: "og:title", content: "Demo Operations Center — Software Vala" },
      {
        property: "og:description",
        content:
          "Real-time demo health, failure detection, branding and domain validation, lifecycle, security, alerts and audit trail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoOpsCenter,
});
