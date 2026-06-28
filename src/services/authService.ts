import { supabase } from '@/lib/supabaseClient';
import type { SessaoUsuario, RegisterVoluntarioPayload, RegisterOngPayload, RegisterDoadorPayload } from '@/types/auth';

const SESSION_KEY = 'conecta_impacto_session';

/**
 * Verifica se existe uma sessão ativa persistida no localStorage.
 * Usado no ProtectedRoute para decidir o redirecionamento inicial.
 * @returns SessaoUsuario ou null caso não haja sessão
 */
export function checkCurrentSession(): SessaoUsuario | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessaoUsuario) : null;
  } catch {
    return null;
  }
}

/**
 * Persiste a sessão no localStorage para ser lida pelo ProtectedRoute.
 * @param sessao - Objeto de sessão com id, nome, email e role
 */
function persistSession(sessao: SessaoUsuario): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
}

/**
 * Remove a sessão do localStorage, efetivando o logout local.
 */
function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Realiza login via Supabase Auth e monta a SessaoUsuario com dados do perfil.
 * @param email - E-mail do usuário
 * @param senha - Senha do usuário
 * @returns A sessão criada ou lança erro em caso de falha
 */
export async function login(email: string, senha: string): Promise<SessaoUsuario> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Erro ao realizar login.');
  }

  // Busca o perfil adicional criado na tabela `profiles`
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const sessao: SessaoUsuario = {
    id: data.user.id,
    nome: profile?.nome ?? data.user.email ?? '',
    email: data.user.email ?? '',
    role: profile?.tipo_usuario ?? 'voluntario',
    ongName: profile?.ong_name ?? undefined,
  };

  persistSession(sessao);
  return sessao;
}

/**
 * Cria uma conta de Voluntário no Supabase Auth e insere o perfil na tabela `profiles`.
 * Após cadastro, redireciona para /meu-perfil via retorno da sessão.
 * @param payload - Dados do voluntário (nome, email, senha)
 * @returns A sessão criada
 */
export async function registerVoluntario(payload: RegisterVoluntarioPayload): Promise<SessaoUsuario> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.senha,
    options: {
      data: { nome: payload.nome, tipo_usuario: 'voluntario' },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Erro ao criar conta.');
  }

  // Insere perfil com segurança via upsert (evita conflitos com a trigger)
  await supabase.from('profiles').upsert({
    id: data.user.id,
    tipo_usuario: 'voluntario',
    nome: payload.nome,
    ong_id: payload.ongId,
  });

  const sessao: SessaoUsuario = {
    id: data.user.id,
    nome: payload.nome,
    email: payload.email,
    role: 'voluntario',
  };

  persistSession(sessao);
  return sessao;
}

/**
 * Cria uma conta de ONG no Supabase Auth e insere o perfil na tabela `profiles`.
 * Após cadastro, redireciona para /dashboard via retorno da sessão.
 * @param payload - Dados da ONG (nomeGestor, nomeOng, cnpj, email, senha)
 * @returns A sessão criada
 */
export async function registerOng(payload: RegisterOngPayload): Promise<SessaoUsuario> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.senha,
    options: {
      data: { nome: payload.nomeGestor, tipo_usuario: 'ong', ong_name: payload.nomeOng },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Erro ao criar conta.');
  }

  await supabase.from('profiles').upsert({
    id: data.user.id,
    tipo_usuario: 'ong',
    nome: payload.nomeGestor,
    ong_name: payload.nomeOng,
    // Assume-se que no futuro a coluna cnpj será adicionada ou tratada no metadata
    // por enquanto, mandaremos no payload.
    // cnpj: payload.cnpj,
  });

  const sessao: SessaoUsuario = {
    id: data.user.id,
    nome: payload.nomeGestor,
    email: payload.email,
    role: 'ong',
    ongName: payload.nomeOng,
  };

  persistSession(sessao);
  return sessao;
}

/**
 * Cria uma conta de Doador Corporativo no Supabase Auth e insere o perfil na tabela `profiles`.
 * Após cadastro, redireciona para /portal-empresa via retorno da sessão.
 * @param payload - Dados do doador (nomeGestor, nomeEmpresa, cnpj, email, senha)
 * @returns A sessão criada
 */
export async function registerDoador(payload: RegisterDoadorPayload): Promise<SessaoUsuario> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.senha,
    options: {
      data: {
        nome: payload.nomeGestor,
        tipo_usuario: 'doador',
        ong_name: payload.nomeEmpresa,
        cnpj: payload.cnpj,
        cnpj_valid: true
      },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Erro ao criar conta de patrocinador.');
  }

  await supabase.from('profiles').upsert({
    id: data.user.id,
    tipo_usuario: 'doador',
    nome: payload.nomeGestor,
    ong_name: payload.nomeEmpresa,
    cnpj: payload.cnpj,
    cnpj_valid: true
  });

  const sessao: SessaoUsuario = {
    id: data.user.id,
    nome: payload.nomeGestor,
    email: payload.email,
    role: 'doador',
    ongName: payload.nomeEmpresa,
  };

  persistSession(sessao);
  return sessao;
}

/**
 * Realiza logout no Supabase Auth e limpa a sessão local.
 */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  clearSession();
}
