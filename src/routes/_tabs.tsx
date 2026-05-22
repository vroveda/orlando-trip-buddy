import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Calendar, CalendarDays, CheckSquare, Info } from "lucide-react";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

const tabs = [
  { to: "/", label: "Roteiro", icon: Calendar },
  { to: "/parque", label: "Hoje", icon: CalendarDays },
  { to: "/checklist", label: "Checklist", icon: CheckSquare },
  { to: "/info", label: "Info", icon: Info },
] as const;

function TabsLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 pb-24 mx-auto w-full max-w-xl">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto w-full max-w-xl grid grid-cols-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.to === "/" }}
                className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground transition-colors"
                activeProps={{ className: "flex flex-col items-center justify-center gap-1 py-3 text-primary" }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium tracking-wide">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
