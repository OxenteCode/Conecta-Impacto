-- ============================================================
-- Conecta Impacto — Associar Voluntário a uma ONG
-- Migração: add_ong_id_to_profiles
-- ============================================================
-- Adiciona a coluna ong_id na tabela profiles para ligar voluntários 
-- diretamente a ONGs específicas cadastrados na plataforma.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ong_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Comentário explicativo da coluna
COMMENT ON COLUMN public.profiles.ong_id IS 'Associação direta do voluntário à sua respectiva ONG beneficiada';
