import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDayShort, formatDayLong, todayISO } from "@/lib/date";
import { fetchOrlandoWeather, weatherEmoji, weatherLabel } from "@/lib/weather";
import { Star, AlertTriangle, MapPin, Trophy, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_tabs/")({
  component: RoteiroPage,
});

function RoteiroPage() {
  const { data: days } = useQuery({
    queryKey: ["days-with-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("days")
        .select("*, park:parks(name), timeline_items(*)")
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: weather } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchOrlandoWeather,
    staleTime: 1000 * 60 * 15,
  });

  const today = todayISO();

  return (
    <div className="px-5 pt-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.2em] font-semibold">Orlando 2026</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Roteiro da galera</h1>
        <p className="text-sm text-muted-foreground mt-1">10 dias de Copa, parques e Florida</p>

        {weather && (
          <div className="mt-5 rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Orlando agora</p>
              <p className="text-lg font-semibold mt-0.5">
                {Math.round(weather.temperature)}°C · {weatherLabel(weather.weatherCode)}
              </p>
              <p className="text-xs text-muted-foreground">
                Máx {Math.round(weather.maxToday)}° / Mín {Math.round(weather.minToday)}° · 💧 {weather.precipProb}%
              </p>
            </div>
            <div className="text-4xl">{weatherEmoji(weather.weatherCode, weather.isDay)}</div>
          </div>
        )}
      </header>

      {!days?.length && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum dia cadastrado ainda. Vá em <span className="text-primary font-medium">/admin</span> para adicionar.
        </div>
      )}

      <div className="space-y-3">
        {days?.map((day: any, idx: number) => {
          const isToday = day.date === today;
          const items = (day.timeline_items ?? []).slice().sort((a: any, b: any) => a.position - b.position);
          const ds = formatDayShort(day.date);
          return (
            <details
              key={day.id}
              open={isToday}
              className={`group rounded-2xl border bg-card overflow-hidden ${isToday ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-border"}`}
            >
              <summary className="flex items-center gap-4 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="w-14 h-14 rounded-xl bg-secondary flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase text-muted-foreground">{ds.month}</span>
                  <span className="text-xl font-bold leading-none">{ds.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Dia {idx + 1} · {ds.weekday}</span>
                    {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">HOJE</span>}
                  </div>
                  <h2 className="font-semibold truncate">{day.title}</h2>
                  {day.park?.name && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {day.park.name}
                    </p>
                  )}
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
              </summary>

              {items.length > 0 && (
                <ol className="p-4 pt-0 space-y-3 border-t border-border mt-0">
                  {items.map((it: any) => (
                    <li key={it.id} className="flex gap-3 pt-3 first:pt-4">
                      <div className="w-14 shrink-0 text-xs font-mono text-primary pt-0.5">{it.time || "—"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {it.star && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
                          {it.warn && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                          <span className="text-sm font-medium">{it.label}</span>
                        </div>
                        {it.note && <p className="text-xs text-muted-foreground mt-0.5">{it.note}</p>}
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
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}