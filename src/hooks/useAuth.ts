import { useState, useEffect, createContext, useContext } from 'react';
import type { SessaoUsuario } from '@/types/auth';
import { checkCurrentSession, logout as logoutService } from '@/services/authService';

interface AuthContextValue {
  sessao: SessaoUsuario | null;
  setSessao: (s: SessaoUsuario | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook para acessar o contexto de autenticação em qualquer componente.
 * Deve ser usado dentro de <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

/**
 * Hook interno que monta o estado inicial da sessão lendo o localStorage.
 * @returns Estado de autenticação e funções de controle
 */
export function useAuthState(): AuthContextValue {
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaura sessão do localStorage na inicialização
    const saved = checkCurrentSession();
    setSessao(saved);
    setIsLoading(false);
  }, []);

  const logout = async () => {
    await logoutService();
    setSessao(null);
  };

  return { sessao, setSessao, logout, isLoading };
}
