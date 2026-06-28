import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Logo } from '@/components/shared/Logo';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout for the NGO Dashboard.
 *
 * Design:
 * - Sidebar colapsável no desktop.
 * - Mobile: header + drawer lateral.
 * - Navegação ativa com indicador de borda esquerda.
 * - ThemeToggle no rodapé do sidebar.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sessao, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Painel Geral' },
    { to: '/dashboard/voluntarios', icon: Users, label: 'Voluntários' },
    { to: '/dashboard/relatorios', icon: BarChart3, label: 'Relatórios ESG' },
    { to: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
      isActive
        ? 'bg-primary/8 text-primary font-semibold border-l-2 border-primary pl-[10px]'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-sidebar border-r border-border px-3 py-5 justify-between shrink-0">
        <div className="flex flex-col gap-5">

          {/* Logo */}
          <div className="px-3 flex items-center gap-2.5 mb-1">
            <Logo size={24} />
            <div>
              <p className="text-sm font-bold text-foreground leading-none">Raízes do Bem</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Gestão de Impacto</p>
            </div>
          </div>

          {/* Active NGO Profile Badge */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted border border-border">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shrink-0">
              <Building size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight text-foreground">
                {sessao?.ongName ?? 'Minha ONG'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {sessao?.nome ?? 'Gestor'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={navLinkClass}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer do sidebar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors duration-150"
          >
            <LogOut size={16} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-13 border-b border-border bg-background sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-bold text-sm text-foreground">Raízes do Bem</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Abrir menu de navegação"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative w-68 bg-sidebar h-full flex flex-col justify-between px-3 py-5 shadow-card-lg animate-in slide-in-from-left duration-250">
              <div className="flex flex-col gap-5">
                <div className="px-3">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {sessao?.ongName ?? 'Minha ONG'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Gestor: {sessao?.nome}
                  </p>
                </div>

                <nav className="flex flex-col gap-0.5">
                  {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/dashboard'}
                      onClick={() => setMenuOpen(false)}
                      className={navLinkClass}
                    >
                      <Icon size={18} />
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  void handleLogout();
                }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut size={18} />
                Sair do Painel
              </button>
            </div>
          </div>
        )}

        {/* View Container */}
        <main className="flex-1 overflow-y-auto bg-background focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
