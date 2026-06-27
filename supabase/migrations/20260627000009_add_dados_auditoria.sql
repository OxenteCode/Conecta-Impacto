-- ============================================================
-- Conecta Impacto — JSONB de Dados de Auditoria
-- Migração: add_dados_auditoria
-- ============================================================
-- Adiciona a coluna dados_auditoria na tabela profiles para salvar
-- o breakdown detalhado gerado pelo Robô de Compliance IA.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dados_auditoria JSONB;

COMMENT ON COLUMN public.profiles.dados_auditoria IS 'Breakdown de scores e critérios gerado pelo Robô de Compliance Gemini';
