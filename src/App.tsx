import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthState } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { VolunteerLayout } from '@/components/layout/VolunteerLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/onboarding/LoginPage';
import RegisterPage from '@/pages/onboarding/RegisterPage';
import MeuPerfilPage from '@/pages/volunteer/MeuPerfilPage';
import AcoesPage from '@/pages/volunteer/AcoesPage';
import BemEstarPage from '@/pages/volunteer/BemEstarPage';
import ContaPage from '@/pages/volunteer/ContaPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import VoluntariosPage from '@/pages/dashboard/VoluntariosPage';
import RelatoriosPage from '@/pages/dashboard/RelatoriosPage';
import ConfiguracoesPage from '@/pages/dashboard/ConfiguracoesPage';
import PublicTransparencyPage from '@/pages/PublicTransparencyPage';
import OngProfilePage from '@/pages/transparency/OngProfilePage';
import DonorPage from '@/pages/donor/DonorPage';

/**
 * Componente raiz que provê o contexto de autenticação e define todas as rotas.
 * A lógica de proteção de rotas é delegada ao ProtectedRoute.
 */
function AppProviders() {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      <BrowserRouter>
        <Routes>
          {/* ── Rotas públicas ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/transparencia" element={<PublicTransparencyPage />} />
          <Route path="/transparencia/ong/:id" element={<OngProfilePage />} />
          <Route path="/doador" element={<DonorPage />} />

          {/* ── Portal do Voluntário ── */}
          <Route
            path="/meu-perfil"
            element={
              <ProtectedRoute requiredRole="voluntario">
                <VolunteerLayout>
                  <MeuPerfilPage />
                </VolunteerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meu-perfil/acoes"
            element={
              <ProtectedRoute requiredRole="voluntario">
                <VolunteerLayout>
                  <AcoesPage />
                </VolunteerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meu-perfil/bem-estar"
            element={
              <ProtectedRoute requiredRole="voluntario">
                <VolunteerLayout>
                  <BemEstarPage />
                </VolunteerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meu-perfil/conta"
            element={
              <ProtectedRoute requiredRole="voluntario">
                <VolunteerLayout>
                  <ContaPage />
                </VolunteerLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Dashboard da ONG ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="ong">
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/voluntarios"
            element={
              <ProtectedRoute requiredRole="ong">
                <DashboardLayout>
                  <VoluntariosPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/relatorios"
            element={
              <ProtectedRoute requiredRole="ong">
                <DashboardLayout>
                  <RelatoriosPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/configuracoes"
            element={
              <ProtectedRoute requiredRole="ong">
                <DashboardLayout>
                  <ConfiguracoesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default AppProviders;
