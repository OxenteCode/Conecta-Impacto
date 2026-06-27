/**
 * Tipos base de autenticação e sessão da plataforma Conecta Impacto.
 * Define os dois perfis de usuário e a estrutura de sessão persistida.
 */

/** Os dois perfis suportados pela plataforma */
export type TipoUsuario = 'voluntario' | 'ong';

/** Objeto de sessão persistido no localStorage e no contexto de autenticação */
export interface SessaoUsuario {
  /** UUID do usuário vindo do Supabase Auth */
  id: string;
  nome: string;
  email: string;
  /** Perfil ativo que controla o roteamento e os módulos disponíveis */
  role: TipoUsuario;
  /** Preenchido apenas quando role === 'ong' */
  ongName?: string;
}

/** Payload para criação de conta de Voluntário */
export interface RegisterVoluntarioPayload {
  nome: string;
  email: string;
  senha: string;
  /** ID da ONG selecionada no cadastro (opcional) */
  ongId?: string;
}

/** Payload para criação de conta de ONG */
export interface RegisterOngPayload {
  nomeGestor: string;
  nomeOng: string;
  cnpj: string;
  email: string;
  senha: string;
}
