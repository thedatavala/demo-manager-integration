import { createFileRoute } from "@tanstack/react-router";
import DemoManagerFullLayout from "@/components/demo-manager/DemoManagerFullLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Demo Manager — Software Vala" },
      {
        name: "description",
        content:
          "Software Vala Demo Manager: monitor live demos, health status, URLs, login roles and demo requests in one control room.",
      },
      { property: "og:title", content: "Demo Manager — Software Vala" },
      {
        property: "og:description",
        content:
          "Control room for every Software Vala demo: live status, health, URLs, credentials and requests.",
      },
    ],
  }),
  component: DemoManagerHome,
});

function DemoManagerHome() {
  return <DemoManagerFullLayout />;
}
