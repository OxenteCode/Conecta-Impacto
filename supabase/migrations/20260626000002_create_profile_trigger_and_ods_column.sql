-- ============================================================
-- Conecta Impacto — Perfis Automáticos & Integração ODS
-- Migração: create_profile_trigger_and_ods_column
-- ============================================================

-- 1. Adiciona coluna ods_number na tabela volunteer_actions
alter table public.volunteer_actions 
  add column if not exists ods_number int check (ods_number in (3, 9, 10, 16, 17)) default 10;

comment on column public.volunteer_actions.ods_number is 'Objetivo de Desenvolvimento Sustentável (ODS) vinculado à ação';

-- 2. Cria função para manipulação de novos usuários cadastrados no auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, tipo_usuario, ong_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    coalesce(new.raw_user_meta_data->>'tipo_usuario', 'voluntario'),
    new.raw_user_meta_data->>'ong_name'
  )
  on conflict (id) do update
  set 
    nome = excluded.nome,
    tipo_usuario = excluded.tipo_usuario,
    ong_name = excluded.ong_name;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Cria trigger para executar a função após a criação do usuário no Supabase Auth
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
