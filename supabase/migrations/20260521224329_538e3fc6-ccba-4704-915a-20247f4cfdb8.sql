
CREATE TABLE public.parks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hours text,
  address text,
  arrival_tip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  title text NOT NULL,
  type text,
  park_id uuid REFERENCES public.parks(id) ON DELETE SET NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.timeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  time text,
  label text NOT NULL,
  note text,
  warn boolean NOT NULL DEFAULT false,
  star boolean NOT NULL DEFAULT false,
  coords text,
  maps_query text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.attractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id uuid NOT NULL REFERENCES public.parks(id) ON DELETE CASCADE,
  name text NOT NULL,
  area text,
  type text,
  duration text,
  estimated_wait text,
  strategy_tip text,
  coords text,
  must_do boolean NOT NULL DEFAULT false,
  lightning_lane boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.itinerary_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  attraction_id uuid REFERENCES public.attractions(id) ON DELETE SET NULL,
  time text,
  label text NOT NULL,
  note text,
  is_key_moment boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'pendente',
  assignee text,
  resolution text,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Shared group app: anyone with the link can read and write
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['parks','days','timeline_items','attractions','itinerary_steps','checklist_items']) LOOP
    EXECUTE format('CREATE POLICY "public_read" ON public.%I FOR SELECT USING (true);', t);
    EXECUTE format('CREATE POLICY "public_insert" ON public.%I FOR INSERT WITH CHECK (true);', t);
    EXECUTE format('CREATE POLICY "public_update" ON public.%I FOR UPDATE USING (true) WITH CHECK (true);', t);
    EXECUTE format('CREATE POLICY "public_delete" ON public.%I FOR DELETE USING (true);', t);
  END LOOP;
END $$;
