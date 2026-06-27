-- Adiciona colunas para o Robô de Compliance e Auditoria

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS seal_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_audit_date timestamp with time zone;

-- Index para otimizar a filtragem das ONGs com selo ativo (utilizado no Dashboard Corporativo)
CREATE INDEX IF NOT EXISTS idx_profiles_seal_active ON public.profiles(seal_active);
