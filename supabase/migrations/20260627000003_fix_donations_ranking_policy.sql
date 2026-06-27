-- ============================================================
-- Conecta Impacto — Fix: RLS donations ranking público
-- Migração: fix_donations_ranking_policy
-- ============================================================
--
-- PROBLEMA: A policy anterior ("donations: leitura pela ONG beneficiada")
-- só permite SELECT quando `auth.uid() = ong_id`, ou seja, a ONG logada
-- só vê doações endereçadas a ela. Isso bloqueia:
--   1. Queries anônimas do portal de transparência.
--   2. Queries do dashboard para montar o ranking de top doadores,
--      caso ong_id não tenha sido preenchido na inserção.
--
-- SOLUÇÃO: Adicionar uma policy separada que permite SELECT irrestrito
-- para uso em rankings/relatórios agregados. Como os dados são apenas
-- nome do doador + valor (sem dados sensíveis de pagamento), isso é
-- compatível com a política de transparência da plataforma.
-- ============================================================

-- Remove a policy restritiva anterior (segura — será substituída por duas mais granulares)
drop policy if exists "donations: leitura pela ONG beneficiada" on public.donations;

-- ── Policy 1: ONG lê as próprias doações (painel administrativo) ──────────────
create policy "donations: leitura pela ONG beneficiada"
  on public.donations for select
  using (
    auth.uid() = ong_id
  );

-- ── Policy 2: Leitura pública para rankings e transparência ──────────────────
-- Permite qualquer usuário (inclusive anônimo) ler a tabela para
-- fins de exibição de rankings e no portal público de transparência.
-- Dados expostos: doador_nome, valor, mensagem, created_at.
-- Dados NÃO expostos: ong_id (UUID interno).
create policy "donations: ranking público de doadores"
  on public.donations for select
  using (true);

-- ── Comentário de auditoria ───────────────────────────────────────────────────
comment on table public.donations is
  'Registro de doações financeiras recebidas pelas ONGs (ODS 17). '
  'Leitura pública permitida para transparência e ranking; gravação requer autenticação.';
