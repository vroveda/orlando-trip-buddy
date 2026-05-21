import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchOrlandoWeather, weatherEmoji, weatherLabel } from "@/lib/weather";
import { Home, Users, Plane, Phone, Trophy } from "lucide-react";

export const Route = createFileRoute("/_tabs/info")({
  component: InfoPage,
});

function InfoPage() {
  const { data: weather } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchOrlandoWeather,
    staleTime: 1000 * 60 * 15,
  });

  return (
    <div className="px-5 pt-8 space-y-6">
      <header>
        <div className="flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.2em] font-semibold">Orlando World Cup 2026</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold">Informações da viagem</h1>
      </header>

      {weather && (
        <div className="rounded-2xl border border-primary/40 bg-card p-4 flex items-center gap-4">
          <div className="text-5xl">{weatherEmoji(weather.weatherCode, weather.isDay)}</div>
          <div>
            <p className="text-xs text-muted-foreground">Orlando · agora</p>
            <p className="text-xl font-bold">{Math.round(weather.temperature)}°C</p>
            <p className="text-xs text-muted-foreground">
              {weatherLabel(weather.weatherCode)} · sensação {Math.round(weather.apparent)}°
            </p>
          </div>
        </div>
      )}

      <Section icon={<Home className="h-4 w-4" />} title="Casa">
        <p className="text-sm">Cadastre endereço, código do portão e wifi em <span className="text-primary">/admin</span>.</p>
      </Section>

      <Section icon={<Users className="h-4 w-4" />} title="Grupo">
        <p className="text-sm text-muted-foreground">
          App compartilhado — qualquer um com o link pode editar checklist e ver o roteiro.
        </p>
      </Section>

      <Section icon={<Plane className="h-4 w-4" />} title="Voos">
        <p className="text-sm text-muted-foreground">
          Adicione informações dos voos em <span className="text-primary">/admin</span> (em breve).
        </p>
      </Section>

      <Section icon={<Phone className="h-4 w-4" />} title="Contatos úteis">
        <ul className="text-sm space-y-1">
          <li>🚨 Emergência (EUA): <span className="font-mono">911</span></li>
          <li>🇧🇷 Consulado BR em Miami: <span className="font-mono">+1 305-285-6200</span></li>
        </ul>
      </Section>

      <div className="pt-2">
        <a
          href="/admin"
          className="block text-center rounded-2xl border border-dashed border-primary/50 text-primary text-sm font-semibold py-3"
        >
          🔐 Área admin
        </a>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}