-- ============================================================
-- Conecta Impacto — Schema Inicial
-- Migração: initial_schema
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
-- Extensão da tabela auth.users com dados de perfil da plataforma.
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  tipo_usuario text not null check (tipo_usuario in ('voluntario', 'ong')),
  nome        text not null,
  ong_name    text,
  created_at  timestamptz default now() not null
);

comment on table public.profiles is 'Perfis de usuários da plataforma Conecta Impacto (voluntarios e ONGs)';

-- RLS: apenas o próprio usuário lê/edita seu perfil
alter table public.profiles enable row level security;

create policy "profiles: leitura do próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: inserção do próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: atualização do próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- ── emotion_checkins ─────────────────────────────────────────
-- Registro anônimo/agregado do check-in emocional diário dos voluntários.
create table if not exists public.emotion_checkins (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  ong_id      uuid,
  score       int not null check (score between 1 and 5),
  checked_at  date default current_date not null,
  created_at  timestamptz default now() not null
);

comment on table public.emotion_checkins is 'Check-ins emocionais diários dos voluntários (escala 1-5, ODS 3)';
comment on column public.emotion_checkins.score is 'Nível emocional: 1=Exausto, 2=Cansado, 3=Bem, 4=Animado, 5=Incrível';

alter table public.emotion_checkins enable row level security;

-- Voluntário insere seu próprio check-in
create policy "checkins: inserção própria"
  on public.emotion_checkins for insert
  with check (auth.uid() = user_id);

-- Voluntário lê apenas seus próprios check-ins
create policy "checkins: leitura própria"
  on public.emotion_checkins for select
  using (auth.uid() = user_id);

-- ONGs leem todos os check-ins para métricas agregadas (via join com profiles)
create policy "checkins: ONGs leem todos"
  on public.emotion_checkins for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo_usuario = 'ong'
    )
  );

-- ── volunteer_actions ────────────────────────────────────────
-- Registro de ações em campo: horas, descrição e impacto quantificado.
create table if not exists public.volunteer_actions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  ong_id      uuid,
  descricao   text not null,
  horas       numeric(4,1) not null check (horas > 0),
  impacto     text,
  created_at  timestamptz default now() not null
);

comment on table public.volunteer_actions is 'Ações voluntárias registradas em campo (horas + impacto)';

alter table public.volunteer_actions enable row level security;

-- Voluntário gerencia suas próprias ações
create policy "actions: inserção própria"
  on public.volunteer_actions for insert
  with check (auth.uid() = user_id);

create policy "actions: leitura própria"
  on public.volunteer_actions for select
  using (auth.uid() = user_id);

-- ONGs leem todas as ações para métricas do dashboard
create policy "actions: ONGs leem todas"
  on public.volunteer_actions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo_usuario = 'ong'
    )
  );
