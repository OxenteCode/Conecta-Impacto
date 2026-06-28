-- ============================================================
-- Conecta Impacto — Perfil de Doador Corporativo / Patrocinador
-- Migração: 20260628000010_add_donor_role
-- ============================================================

-- 1. Modifica o constraint de tipo_usuario para incluir 'doador'
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_tipo_usuario_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_tipo_usuario_check 
  CHECK (tipo_usuario IN ('voluntario', 'ong', 'doador'));

-- 2. Adiciona colunas para CNPJ corporativo na tabela de perfis
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS cnpj_valid BOOLEAN DEFAULT false;

-- 3. Atualiza a trigger handle_new_user() para persistir metadados corporativos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, tipo_usuario, ong_name, cnpj, cnpj_valid)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.email),
    COALESCE(new.raw_user_meta_data->>'tipo_usuario', 'voluntario'),
    new.raw_user_meta_data->>'ong_name',
    new.raw_user_meta_data->>'cnpj',
    COALESCE((new.raw_user_meta_data->>'cnpj_valid')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    nome = excluded.nome,
    tipo_usuario = excluded.tipo_usuario,
    ong_name = excluded.ong_name,
    cnpj = excluded.cnpj,
    cnpj_valid = excluded.cnpj_valid;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Cria política de segurança RLS para doadores corporativos na tabela de doações
DROP POLICY IF EXISTS "donations: leitura pelo doador" ON public.donations;
CREATE POLICY "donations: leitura pelo doador"
  ON public.donations FOR SELECT
  USING (
    auth.uid() = company_id
  );
