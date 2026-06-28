import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { TipoUsuario } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Se definido, apenas este tipo de usuário pode acessar a rota */
  requiredRole?: TipoUsuario;
}

/**
 * Componente de guarda de rota.
 * - Sem sessão → redireciona para /login
 * - Role errado → redireciona para a home do seu perfil
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { sessao, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Sem sessão → login
  if (!sessao) {
    return <Navigate to="/login" replace />;
  }

  // Voluntário tentando acessar área de ONG ou Doador
  if (sessao.role === 'voluntario' && requiredRole && requiredRole !== 'voluntario') {
    return <Navigate to="/meu-perfil" replace />;
  }

  // ONG tentando acessar área de Voluntário ou Doador
  if (sessao.role === 'ong' && requiredRole && requiredRole !== 'ong') {
    return <Navigate to="/dashboard" replace />;
  }

  // Doador tentando acessar área de Voluntário ou ONG
  if (sessao.role === 'doador' && requiredRole && requiredRole !== 'doador') {
    return <Navigate to="/portal-empresa" replace />;
  }

  return <>{children}</>;
}
