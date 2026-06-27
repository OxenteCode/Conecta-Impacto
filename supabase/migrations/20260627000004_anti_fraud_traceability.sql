-- Anti-Fraud Traceability Pivot

-- 1. Modify donations table
ALTER TABLE public.donations
ADD COLUMN company_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN tracking_code TEXT UNIQUE;

-- 2. Modify volunteer_actions table
ALTER TABLE public.volunteer_actions
ADD COLUMN title TEXT NOT NULL DEFAULT 'Ação Voluntária',
ADD COLUMN proof_image_url TEXT,
ADD COLUMN server_timestamp TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Create ledger table
CREATE TABLE public.ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    action_id UUID NOT NULL REFERENCES public.volunteer_actions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for ledger
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ledger is viewable by everyone." ON public.ledger
  FOR SELECT USING (true);
