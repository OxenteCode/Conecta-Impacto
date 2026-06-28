import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Globe, Eye, EyeOff, Sparkles } from 'lucide-react';
import { login } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSessao } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Entrar — Raízes do Bem';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sessao = await login(email, senha);
      setSessao(sessao);
      if (sessao.role === 'ong') {
        navigate('/dashboard', { replace: true });
      } else if (sessao.role === 'doador') {
        navigate('/portal-empresa', { replace: true });
      } else {
        navigate('/meu-perfil', { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSponsorLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    const demoSessao = {
      id: 'mock-diamante',
      nome: 'Lailson Code (Gestor)',
      email: 'patrocinio@oxentecode.com',
      role: 'doador' as const,
      ongName: 'OxenteCode Tech',
    };
    localStorage.setItem('conecta_impacto_session', JSON.stringify(demoSessao));
    setSessao(demoSessao);
    navigate('/portal-empresa', { replace: true });
  };

  const handleDemoOngLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setEmail('conecta@oxentecode.com.br');
    setSenha('123456');
    setLoading(true);
    setError('');
    try {
      const sessao = await login('conecta@oxentecode.com.br', '123456');
      setSessao(sessao);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar login de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoVolunteerLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setEmail('louiseagnes57@gmail.com');
    setSenha('q1w2e3r4t5y6');
    setLoading(true);
    setError('');
    try {
      const sessao = await login('louiseagnes57@gmail.com', 'q1w2e3r4t5y6');
      setSessao(sessao);
      navigate('/meu-perfil', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar login de demonstração de voluntário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Coluna decorativa — apenas desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-background">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-start px-16">
          <div className="flex items-center gap-3 mb-12">
            <Logo size={40} className="brightness-125 filter" />
            <span className="text-2xl font-bold text-white">Raízes do Bem</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Bem-vindo de volta ao impacto positivo
          </h1>
          <p className="text-emerald-200/80 text-lg leading-relaxed max-w-sm">
            Sua jornada de transformação social continua aqui.
          </p>
          <div className="mt-12 flex flex-col gap-4">
            {['Dados seguros com Supabase RLS', 'Check-in emocional protegido', 'Relatórios ESG verificáveis'].map(item => (
              <div key={item} className="flex items-center gap-3 text-emerald-200/70 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <Logo size={32} />
            <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Raízes do Bem
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Entrar na plataforma</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Criar conta gratuita
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-medium">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-200 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-senha" className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-senha"
                  type={showSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-200 placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 mt-2',
                loading
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/40 text-center space-y-3">
            <div className="flex flex-col gap-2 justify-center">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleDemoOngLogin}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 font-extrabold text-xs rounded-xl shadow-inner border border-violet-200/50 hover:bg-violet-100 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <Sparkles size={13} />
                  Demo ONG
                </button>
                <button
                  onClick={handleDemoSponsorLogin}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs rounded-xl shadow-inner border border-emerald-200/50 hover:bg-emerald-100 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <Sparkles size={13} />
                  Demo Patrocinador
                </button>
              </div>
              <div>
                <button
                  onClick={handleDemoVolunteerLogin}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 font-extrabold text-xs rounded-xl shadow-inner border border-amber-200/50 hover:bg-amber-100 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <Sparkles size={13} />
                  Demo Voluntário
                </button>
              </div>
            </div>
            <div>
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-block">
                ← Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
