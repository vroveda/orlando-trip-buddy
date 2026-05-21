import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_tabs/checklist")({
  component: ChecklistPage,
});

function ChecklistPage() {
  const qc = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Geral");

  const { data: items } = useQuery({
    queryKey: ["checklist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_items")
        .select("*")
        .order("status", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("checklist_items").insert({
        title: newTitle.trim(),
        category: newCategory.trim() || "Geral",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      qc.invalidateQueries({ queryKey: ["checklist"] });
    },
  });

  const toggleItem = useMutation({
    mutationFn: async (it: any) => {
      const next = it.status === "feito" ? "pendente" : "feito";
      const { error } = await supabase
        .from("checklist_items")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", it.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist"] }),
  });

  const updateResolution = useMutation({
    mutationFn: async ({ id, resolution, assignee }: any) => {
      const { error } = await supabase
        .from("checklist_items")
        .update({ resolution, assignee, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist"] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist"] }),
  });

  const grouped = (items ?? []).reduce<Record<string, any[]>>((acc, it) => {
    const k = it.category || "Geral";
    (acc[k] ||= []).push(it);
    return acc;
  }, {});

  const done = items?.filter((i) => i.status === "feito").length ?? 0;
  const total = items?.length ?? 0;

  return (
    <div className="px-5 pt-8">
      <header>
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Checklist do grupo</span>
        <h1 className="mt-2 text-3xl font-bold">Pendências</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {done}/{total} concluídas · qualquer um pode marcar
        </p>
      </header>

      <div className="mt-5 rounded-2xl border border-border bg-card p-3 space-y-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova tarefa…"
          className="w-full bg-transparent text-sm px-3 py-2 outline-none placeholder:text-muted-foreground"
        />
        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Categoria"
            className="flex-1 bg-secondary rounded-lg text-xs px-3 py-2 outline-none"
          />
          <button
            disabled={!newTitle.trim() || addItem.isPending}
            onClick={() => addItem.mutate()}
            className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {Object.entries(grouped).map(([cat, list]) => (
          <section key={cat}>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
              {cat}
            </h2>
            <ul className="space-y-2">
              {list.map((it) => (
                <ChecklistRow
                  key={it.id}
                  it={it}
                  onToggle={() => toggleItem.mutate(it)}
                  onSave={(resolution, assignee) =>
                    updateResolution.mutate({ id: it.id, resolution, assignee })
                  }
                  onDelete={() => removeItem.mutate(it.id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ChecklistRow({
  it,
  onToggle,
  onSave,
  onDelete,
}: {
  it: any;
  onToggle: () => void;
  onSave: (r: string, a: string) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState(it.resolution ?? "");
  const [assignee, setAssignee] = useState(it.assignee ?? "");
  const done = it.status === "feito";

  return (
    <li className={`rounded-2xl border bg-card ${done ? "border-border opacity-70" : "border-border"}`}>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
            done ? "bg-primary border-primary" : "border-muted-foreground"
          }`}
        >
          {done && <Check className="h-4 w-4 text-primary-foreground" />}
        </button>
        <button onClick={() => setOpen((o) => !o)} className="flex-1 text-left min-w-0">
          <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
            {it.title}
          </p>
          {it.assignee && <p className="text-[11px] text-primary mt-0.5">@{it.assignee}</p>}
          {it.resolution && <p className="text-xs text-muted-foreground truncate">↳ {it.resolution}</p>}
        </button>
      </div>
      {open && (
        <div className="p-3 pt-0 space-y-2">
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Quem cuida?"
            className="w-full bg-secondary rounded-lg text-xs px-3 py-2 outline-none"
          />
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Resolução / nota"
            rows={2}
            className="w-full bg-secondary rounded-lg text-xs px-3 py-2 outline-none resize-none"
          />
          <div className="flex justify-between gap-2">
            <button
              onClick={onDelete}
              className="text-xs text-destructive inline-flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> remover
            </button>
            <button
              onClick={() => {
                onSave(resolution, assignee);
                setOpen(false);
              }}
              className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              salvar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}