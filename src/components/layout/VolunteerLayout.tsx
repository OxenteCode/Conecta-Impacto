import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Activity,
  Heart,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/**
 * Base Layout for the Volunteer Portal.
 * 
 * Design Features:
 * - Mobile: Bottom navigation bar for thumb-friendly reach.
 * - Desktop: Sticky sidebar with user profile context and collapsible navigation.
 * - Icons: Lucide React (strictly compliant with tech stack specifications).
 */
export function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const { sessao, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/meu-perfil', icon: Home, label: 'Início' },
    { to: '/meu-perfil/acoes', icon: Activity, label: 'Ações' },
    { to: '/meu-perfil/bem-estar', icon: Heart, label: 'Bem-estar' },
    { to: '/meu-perfil/conta', icon: User, label: 'Conta' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border px-4 py-6 justify-between shrink-0">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="px-2 flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Raízes do Bem
            </span>
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase mt-0.5">
              Portal do Voluntário
            </span>
          </div>

          {/* User Profile Info Card */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {sessao?.nome?.[0]?.toUpperCase() ?? 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">
                {sessao?.nome ?? 'Voluntário'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Voluntário
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/meu-perfil'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut size={18} />
          Sair do Portal
        </button>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <span className="font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Raízes do Bem
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <div className="relative w-72 bg-card h-full flex flex-col justify-between px-4 py-6 shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="flex flex-col gap-6">
                <div className="px-2 py-1">
                  <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    Raízes do Bem
                  </span>
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/meu-perfil'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        )
                      }
                    >
                      <Icon size={20} />
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
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive transition-all"
              >
                <LogOut size={20} />
                Sair do Portal
              </button>
            </div>
          </div>
        )}

        {/* View Container */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden flex border-t border-border bg-card/95 backdrop-blur-md shrink-0 pb-safe">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/meu-perfil'}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors duration-200',
                  isActive ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
