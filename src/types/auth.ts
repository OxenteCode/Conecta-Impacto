/**
 * Tipos base de autenticação e sessão da plataforma Raízes do Bem.
 * Define os dois perfis de usuário e a estrutura de sessão persistida.
 */

/** Os três perfis suportados pela plataforma */
export type TipoUsuario = 'voluntario' | 'ong' | 'doador';

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

/** Payload para criação de conta de Doador Corporativo */
export interface RegisterDoadorPayload {
  nomeGestor: string;
  nomeEmpresa: string;
  cnpj: string;
  email: string;
  senha: string;
}
