-- ============================================================
-- Conecta Impacto — Public ONGs RLS
-- Migração: public_ongs_rls
-- ============================================================
-- Permite que usuários anônimos e não logados leiam os dados 
-- básicos das ONGs (tipo_usuario = 'ong') na tabela profiles.
-- Necessário para o Portal da Transparência e tela de Cadastro de Voluntário.

create policy "profiles: leitura publica de ongs"
  on public.profiles for select
  using (tipo_usuario = 'ong');
