import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { todayISO, formatDayLong } from "@/lib/date";
import { MapPin, Clock, Zap, Star, Sparkles, AlertTriangle, Trophy } from "lucide-react";

export const Route = createFileRoute("/_tabs/parque")({
  component: HojePage,
});

function HojePage() {
  const today = todayISO();

  const { data: day } = useQuery({
    queryKey: ["day-hoje", today],
    queryFn: async () => {
      // Try today first
      const { data: exact } = await supabase
        .from("days")
        .select("*, park:parks(*), timeline_items(*), itinerary_steps(*, attraction:attractions(*))")
        .eq("date", today)
        .maybeSingle();
      if (exact) return exact;
      // Fallback: next upcoming day
      const { data: next } = await supabase
        .from("days")
        .select("*, park:parks(*), timeline_items(*), itinerary_steps(*, attraction:attractions(*))")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();
      return next;
    },
  });

  if (!day) {
    return (
      <div className="px-5 pt-10 text-center text-muted-foreground">
        Nenhum dia cadastrado.
      </div>
    );
  }

  const park = day.park;
  const isToday = day.date === today;
  const timelineItems = (day.timeline_items ?? [])
    .slice()
    .sort((a: any, b: any) => a.position - b.position);
  const itinerarySteps = (day.itinerary_steps ?? [])
    .slice()
    .sort((a: any, b: any) => a.position - b.position);

  return (
    <div className="px-5 pt-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2 text-primary">
          {park ? <Trophy className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          <span className="text-xs uppercase tracking-[0.2em] font-semibold">
            {isToday ? "Hoje" : "Próximo dia"}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold leading-tight">{day.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{formatDayLong(day.date)}</p>
      </header>

      {/* Park info card — only if day has a park linked */}
      {park && (
        <div className="mt-5 rounded-2xl border border-primary/40 bg-card p-4 space-y-2">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
            {park.name}
          </p>
          {park.hours && (
            <p className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              {park.hours}
            </p>
          )}
          {park.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(park.address)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm flex items-center gap-2 text-primary"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              {park.address}
            </a>
          )}
          {park.arrival_tip && (
            <p className="text-xs text-muted-foreground border-l-2 border-primary pl-3 mt-2">
              💡 {park.arrival_tip}
            </p>
          )}
        </div>
      )}

      {/* Timeline do dia */}
      {timelineItems.length > 0 && (
        <>
          <h2 className="mt-8 text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Programação do dia
          </h2>
          <ol className="mt-3 space-y-3">
            {timelineItems.map((it: any) => (
              <li key={it.id} className="flex gap-3">
                <div className="w-14 shrink-0 text-xs font-mono text-primary pt-0.5">
                  {it.time || "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {it.star && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
                    {it.warn && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    <span className="text-sm font-medium">{it.label}</span>
                  </div>
                  {it.note && (
                    <p className="text-xs text-muted-foreground mt-0.5">{it.note}</p>
                  )}
                  {it.maps_query && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.maps_query)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary mt-1 inline-flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" /> abrir no mapa
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Ordem de atrações do parque — só aparece se houver itinerary_steps */}
      {itinerarySteps.length > 0 && (
        <>
          <h2 className="mt-8 text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Ordem das atrações
          </h2>
          <ol className="mt-3 space-y-3">
            {itinerarySteps.map((s: any, i: number) => {
              const a = s.attraction;
              return (
                <li
                  key={s.id}
                  className={`rounded-2xl border bg-card p-4 ${
                    s.is_key_moment ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {s.time && (
                          <span className="text-xs font-mono text-primary">{s.time}</span>
                        )}
                        {s.is_key_moment && (
                          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                        )}
                      </div>
                      <h3 className="font-semibold mt-0.5">{s.label}</h3>
                      {s.note && (
                        <p className="text-xs text-muted-foreground mt-1">{s.note}</p>
                      )}
                      {a && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                          {a.area && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary">{a.area}</span>
                          )}
                          {a.duration && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary">
                              ⏱ {a.duration}
                            </span>
                          )}
                          {a.estimated_wait && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary">
                              fila ~{a.estimated_wait}
                            </span>
                          )}
                          {a.lightning_lane && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary flex items-center gap-1">
                              <Zap className="h-3 w-3" /> Lightning Lane
                            </span>
                          )}
                          {a.must_do && (
                            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                              MUST
                            </span>
                          )}
                        </div>
                      )}
                      {a?.strategy_tip && (
                        <p className="text-xs text-muted-foreground border-l-2 border-primary pl-3 mt-2">
                          💡 {a.strategy_tip}
                        </p>
                      )}
                      {a?.coords && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.coords)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-primary mt-2 inline-flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3" /> ver no mapa
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Mapa do parque */}
          <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
            <iframe
              title="Mapa do parque"
              className="w-full h-64"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                park?.address || park?.name || "Orlando FL",
              )}&output=embed`}
            />
          </div>
        </>
      )}

      {/* Empty state for days with no items at all */}
      {timelineItems.length === 0 && itinerarySteps.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhuma atividade cadastrada para este dia ainda.
        </div>
      )}
    </div>
  );
}
