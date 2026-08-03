
CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  vibe text NOT NULL CHECK (vibe IN ('food','drink')),
  choice text NOT NULL,
  date_iso text NOT NULL,
  time_slot text NOT NULL
);

GRANT INSERT ON public.rsvps TO anon;
GRANT SELECT, INSERT ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an RSVP"
  ON public.rsvps
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
