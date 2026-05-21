import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const STORAGE_KEY = "admin-auth-orlando";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Senha de acesso</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pw === "orlando2026") {
                sessionStorage.setItem(STORAGE_KEY, "1");
                setAuthed(true);
              }
            }}
            placeholder="••••••••"
            className="mt-4 w-full bg-secondary rounded-lg px-3 py-2 outline-none"
          />
          <button
            onClick={() => {
              if (pw === "orlando2026") {
                sessionStorage.setItem(STORAGE_KEY, "1");
                setAuthed(true);
              }
            }}
            className="mt-3 w-full bg-primary text-primary-foreground rounded-lg py-2 font-semibold"
          >
            Entrar
          </button>
          <Link to="/" className="block text-center text-xs text-muted-foreground mt-4">
            ← voltar
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [tab, setTab] = useState<"parks" | "days" | "attractions" | "steps" | "checklist">("days");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold">Admin · Orlando 2026</h1>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {(["days", "parks", "attractions", "steps", "checklist"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4">
        {tab === "parks" && <CrudTable table="parks" fields={["name", "hours", "address", "arrival_tip"]} />}
        {tab === "days" && (
          <CrudTable
            table="days"
            fields={["date", "title", "type", "position"]}
            fkSelect={{ park_id: { table: "parks", label: "name" } }}
          />
        )}
        {tab === "attractions" && (
          <CrudTable
            table="attractions"
            fields={["name", "area", "type", "duration", "estimated_wait", "strategy_tip", "coords", "must_do", "lightning_lane", "position"]}
            fkSelect={{ park_id: { table: "parks", label: "name" } }}
          />
        )}
        {tab === "steps" && (
          <CrudTable
            table="itinerary_steps"
            fields={["time", "label", "note", "is_key_moment", "position"]}
            fkSelect={{
              day_id: { table: "days", label: "title" },
              attraction_id: { table: "attractions", label: "name" },
            }}
          />
        )}
        {tab === "checklist" && (
          <CrudTable
            table="checklist_items"
            fields={["title", "category", "status", "assignee", "resolution", "deadline"]}
          />
        )}
        {tab === "days" && <TimelineEditor />}
      </main>
    </div>
  );
}

type FkSelect = Record<string, { table: string; label: string }>;

function CrudTable({
  table,
  fields,
  fkSelect = {},
}: {
  table: string;
  fields: string[];
  fkSelect?: FkSelect;
}) {
  const qc = useQueryClient();
  const { data: rows } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const fkData: Record<string, any[]> = {};
  for (const [col, cfg] of Object.entries(fkSelect)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const q = useQuery({
      queryKey: ["admin-fk", cfg.table],
      queryFn: async () => {
        const { data } = await (supabase as any).from(cfg.table).select(`id, ${cfg.label}`);
        return data ?? [];
      },
    });
    fkData[col] = q.data ?? [];
  }

  const upsert = useMutation({
    mutationFn: async (row: any) => {
      if (row.id) {
        const { id, created_at, updated_at, ...rest } = row;
        const { error } = await (supabase as any).from(table).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from(table).insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", table] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", table] }),
  });

  const allFields = [...Object.keys(fkSelect), ...fields];

  return (
    <section className="space-y-4">
      <RowForm
        fields={allFields}
        fkSelect={fkSelect}
        fkData={fkData}
        onSubmit={(row) => upsert.mutate(row)}
      />
      <ul className="space-y-2">
        {rows?.map((r: any) => (
          <li key={r.id} className="rounded-xl border border-border bg-card p-3">
            <RowForm
              initial={r}
              fields={allFields}
              fkSelect={fkSelect}
              fkData={fkData}
              onSubmit={(row) => upsert.mutate({ ...row, id: r.id })}
              onDelete={() => remove.mutate(r.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RowForm({
  initial,
  fields,
  fkSelect = {},
  fkData = {},
  onSubmit,
  onDelete,
}: {
  initial?: any;
  fields: string[];
  fkSelect?: FkSelect;
  fkData?: Record<string, any[]>;
  onSubmit: (row: any) => void;
  onDelete?: () => void;
}) {
  const [row, setRow] = useState<any>(initial ?? {});
  useEffect(() => {
    if (initial) setRow(initial);
  }, [initial?.id]);

  const isBool = (f: string) => ["must_do", "lightning_lane", "is_key_moment", "warn", "star"].includes(f);
  const isDate = (f: string) => ["date", "deadline"].includes(f);
  const isNum = (f: string) => ["position"].includes(f);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => {
          if (fkSelect[f]) {
            return (
              <label key={f} className="col-span-2 text-xs">
                <span className="text-muted-foreground">{f}</span>
                <select
                  value={row[f] ?? ""}
                  onChange={(e) => setRow({ ...row, [f]: e.target.value || null })}
                  className="mt-1 w-full bg-secondary rounded-lg px-2 py-1.5 text-sm"
                >
                  <option value="">—</option>
                  {fkData[f]?.map((opt: any) => (
                    <option key={opt.id} value={opt.id}>
                      {opt[fkSelect[f].label]}
                    </option>
                  ))}
                </select>
              </label>
            );
          }
          if (isBool(f)) {
            return (
              <label key={f} className="flex items-center gap-2 text-xs col-span-1">
                <input
                  type="checkbox"
                  checked={!!row[f]}
                  onChange={(e) => setRow({ ...row, [f]: e.target.checked })}
                />
                {f}
              </label>
            );
          }
          return (
            <label key={f} className={`text-xs ${f === "note" || f === "resolution" || f === "strategy_tip" ? "col-span-2" : "col-span-1"}`}>
              <span className="text-muted-foreground">{f}</span>
              {f === "note" || f === "resolution" || f === "strategy_tip" ? (
                <textarea
                  value={row[f] ?? ""}
                  onChange={(e) => setRow({ ...row, [f]: e.target.value })}
                  rows={2}
                  className="mt-1 w-full bg-secondary rounded-lg px-2 py-1.5 text-sm"
                />
              ) : (
                <input
                  type={isDate(f) ? "date" : isNum(f) ? "number" : "text"}
                  value={row[f] ?? ""}
                  onChange={(e) =>
                    setRow({ ...row, [f]: isNum(f) ? Number(e.target.value) : e.target.value })
                  }
                  className="mt-1 w-full bg-secondary rounded-lg px-2 py-1.5 text-sm"
                />
              )}
            </label>
          );
        })}
      </div>
      <div className="flex justify-between items-center">
        {onDelete ? (
          <button onClick={onDelete} className="text-xs text-destructive inline-flex items-center gap-1">
            <Trash2 className="h-3 w-3" /> deletar
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={() => {
            onSubmit(row);
            if (!initial) setRow({});
          }}
          className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1"
        >
          {initial ? <Save className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {initial ? "salvar" : "adicionar"}
        </button>
      </div>
    </div>
  );
}

function TimelineEditor() {
  const qc = useQueryClient();
  const { data: days } = useQuery({
    queryKey: ["admin-days-tl"],
    queryFn: async () => {
      const { data } = await supabase.from("days").select("id, date, title").order("date");
      return data ?? [];
    },
  });
  const [dayId, setDayId] = useState<string>("");

  const { data: items } = useQuery({
    queryKey: ["admin-tl", dayId],
    enabled: !!dayId,
    queryFn: async () => {
      const { data } = await supabase
        .from("timeline_items")
        .select("*")
        .eq("day_id", dayId)
        .order("position");
      return data ?? [];
    },
  });

  const upsert = useMutation({
    mutationFn: async (row: any) => {
      if (row.id) {
        const { id, created_at, ...rest } = row;
        const { error } = await supabase.from("timeline_items").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("timeline_items").insert({ ...row, day_id: dayId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tl", dayId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("timeline_items").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tl", dayId] }),
  });

  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="text-sm uppercase tracking-wider text-primary font-semibold mb-3">
        Timeline de um dia
      </h2>
      <select
        value={dayId}
        onChange={(e) => setDayId(e.target.value)}
        className="w-full bg-secondary rounded-lg px-2 py-2 text-sm"
      >
        <option value="">Selecione um dia…</option>
        {days?.map((d: any) => (
          <option key={d.id} value={d.id}>
            {d.date} — {d.title}
          </option>
        ))}
      </select>

      {dayId && (
        <div className="mt-4 space-y-3">
          <RowForm
            fields={["time", "label", "note", "warn", "star", "coords", "maps_query", "position"]}
            onSubmit={(row) => upsert.mutate(row)}
          />
          <ul className="space-y-2">
            {items?.map((it: any) => (
              <li key={it.id} className="rounded-xl border border-border bg-card p-3">
                <RowForm
                  initial={it}
                  fields={["time", "label", "note", "warn", "star", "coords", "maps_query", "position"]}
                  onSubmit={(row) => upsert.mutate({ ...row, id: it.id })}
                  onDelete={() => remove.mutate(it.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}