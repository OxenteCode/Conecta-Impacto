-- ============================================================
-- Conecta Impacto — Schema de Doações
-- Migração: add_donations
-- ============================================================

-- ── donations ────────────────────────────────────────────────
-- Registro de doações recebidas pelas ONGs para relatórios ESG e transparência.
create table if not exists public.donations (
  id          uuid default gen_random_uuid() primary key,
  ong_id      uuid references public.profiles(id) on delete cascade not null,
  doador_nome text not null,
  valor       numeric(10,2) not null check (valor > 0),
  mensagem    text,
  created_at  timestamptz default now() not null
);

comment on table public.donations is 'Registro de doações financeiras recebidas pelas ONGs (ODS 17)';

alter table public.donations enable row level security;

-- Qualquer doador pode registrar uma doação (checkout público)
create policy "donations: inserção pública"
  on public.donations for insert
  with check (true);

-- Apenas a própria ONG beneficiada pode ler suas doações para o painel administrativo
create policy "donations: leitura pela ONG beneficiada"
  on public.donations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo_usuario = 'ong' and id = public.donations.ong_id
    )
  );
