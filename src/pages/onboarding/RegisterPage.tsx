import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Building,
  Globe,
  Eye,
  EyeOff,
  Heart,
  BarChart3,
  ChevronDown,
  Search,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { registerVoluntario, registerOng, registerDoador } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import type { TipoUsuario } from '@/types/auth';

interface OngOption {
  id: string;
  nome: string;
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [perfil, setPerfil] = useState<TipoUsuario>(
    (searchParams.get('perfil') as TipoUsuario) ?? 'voluntario'
  );

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [nome, setNome] = useState('');
  const [nomeGestor, setNomeGestor] = useState('');
  const [nomeOng, setNomeOng] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjValid, setCnpjValid] = useState(false);

  // Estado do seletor de ONG
  const [ongOptions, setOngOptions] = useState<OngOption[]>([]);
  const [selectedOng, setSelectedOng] = useState<OngOption | null>(null);
  const [ongSearch, setOngSearch] = useState('');
  const [ongDropdownOpen, setOngDropdownOpen] = useState(false);
  const [loadingOngs, setLoadingOngs] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSessao } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Criar conta — Raízes do Bem';
  }, []);

  // Busca ONGs cadastradas no Supabase quando o perfil é 'voluntario'
  useEffect(() => {
    if (perfil !== 'voluntario') return;
    void loadOngs();
  }, [perfil]);

  // Efeito para validar o CNPJ em tempo real na Brasil API
  useEffect(() => {
    if (perfil !== 'ong' && perfil !== 'doador') return;
    
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length === 14) {
      const fetchCnpj = async () => {
        setCnpjLoading(true);
        setCnpjError(null);
        setCnpjValid(false);
        try {
          const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
          if (!res.ok) throw new Error('CNPJ não encontrado na base da Receita.');
          
          const data = await res.json();
          
          if (data.descricao_situacao_cadastral !== 'ATIVA') {
            setCnpjError(`CNPJ Irregular (Situação: ${data.descricao_situacao_cadastral}). Cadastro bloqueado para segurança.`);
            setCnpjValid(false);
            return;
          }
          
          // Sucesso na validação
          setNomeOng(data.nome_fantasia || data.razao_social || '');
          setCnpjValid(true);
        } catch (err: any) {
          setCnpjError(err.message || 'Erro ao validar CNPJ.');
          setCnpjValid(false);
        } finally {
          setCnpjLoading(false);
        }
      };
      
      fetchCnpj();
    } else {
      setCnpjValid(false);
      setCnpjError(null);
    }
  }, [cnpj, perfil]);

  const loadOngs = async () => {
    setLoadingOngs(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, ong_name')
        .eq('tipo_usuario', 'ong')
        .not('ong_name', 'is', null)
        .order('ong_name', { ascending: true });

      if (data) {
        setOngOptions(
          data.map(p => ({ id: p.id, nome: p.ong_name as string }))
        );
      }
    } catch (err) {
      console.error('Erro ao carregar ONGs:', err);
    } finally {
      setLoadingOngs(false);
    }
  };

  const filteredOngs = ongOptions.filter(o =>
    o.nome.toLowerCase().includes(ongSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    if ((perfil === 'ong' || perfil === 'doador') && !cnpjValid) {
      setError('O CNPJ informado é inválido ou irregular. Revise os dados e tente novamente.');
      return;
    }

    setLoading(true);
    try {
      if (perfil === 'voluntario') {
        const sessao = await registerVoluntario({
          nome,
          email,
          senha,
          ongId: selectedOng?.id,
        });
        setSessao(sessao);
        navigate('/meu-perfil', { replace: true });
      } else if (perfil === 'doador') {
        const sessao = await registerDoador({
          nomeGestor,
          nomeEmpresa: nomeOng,
          cnpj,
          email,
          senha,
        });
        setSessao(sessao);
        navigate('/portal-empresa', { replace: true });
      } else {
        const sessao = await registerOng({ nomeGestor, nomeOng, cnpj, email, senha });
        setSessao(sessao);
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = cn(
    'w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
    'transition-all duration-150 placeholder:text-muted-foreground/50'
  );

  const submitClass = cn(
    'w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 mt-2',
    loading
      ? 'bg-muted text-muted-foreground cursor-not-allowed'
      : perfil === 'voluntario'
        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 hover:brightness-105'
        : perfil === 'doador'
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
          : 'bg-violet-600 text-white shadow-md shadow-violet-600/20 hover:bg-violet-700'
  );

  return (
    <div className="min-h-screen flex">

      {/* ── Coluna decorativa — desktop ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-slate-900">
        {/* Padrão de grid sutil no fundo */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Barra de acento esmeralda/violeta na borda direita */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center items-start px-14 py-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <Logo size={36} />
            <span className="text-xl font-bold text-white">Raízes do Bem</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 leading-snug">
            Comece a medir o<br />impacto que você gera
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs mb-10">
            Solidariedade em dados. Dados em recursos. Recursos em mais impacto.
          </p>

          {/* Benefícios por perfil */}
          <div className={cn(
            'w-full max-w-xs p-5 rounded-xl border transition-all duration-500',
            perfil === 'voluntario'
              ? 'border-emerald-500/25 bg-emerald-500/8'
              : 'border-violet-500/25 bg-violet-500/8'
          )}>
            <div className="flex items-center gap-2 mb-4">
              {perfil === 'voluntario'
                ? <Heart size={15} className="text-emerald-400" />
                : <BarChart3 size={15} className="text-violet-400" />
              }
              <span className={cn(
                'text-sm font-semibold',
                perfil === 'voluntario' ? 'text-emerald-400' : 'text-violet-400'
              )}>
                {perfil === 'voluntario' ? 'Portal do Voluntário' : 'Dashboard da ONG'}
              </span>
            </div>
            <ul className="space-y-2">
              {(perfil === 'voluntario'
                ? ['Registre horas e ações de campo', 'Acompanhe seu bem-estar emocional', 'Ganhe insígnias por impacto', 'Vincule-se à sua ONG']
                : ['Dashboard com métricas em tempo real', 'Monitor de saúde emocional coletiva', 'Relatórios ESG automáticos', 'Validação IPEA Anti-Fraude']
              ).map(b => (
                <li key={b} className="flex items-center gap-2 text-sm text-slate-400">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    perfil === 'voluntario' ? 'bg-emerald-500' : 'bg-violet-500'
                  )} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Formulário ── */}
      <div className="flex-1 flex items-start justify-center px-5 py-10 bg-background overflow-y-auto">
        <div className="w-full max-w-sm pt-2">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <Logo size={28} />
            <span className="font-bold text-base text-foreground">Raízes do Bem</span>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-foreground">Criar conta</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium transition-colors">
              Entrar agora
            </Link>
          </p>

          {/* Seletor de perfil */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => {
                setPerfil('voluntario');
                setCnpj('');
                setNomeOng('');
              }}
              className={cn(
                'flex flex-col items-center gap-2 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer',
                perfil === 'voluntario'
                  ? 'border-primary/50 bg-primary/8 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Heart size={20} strokeWidth={perfil === 'voluntario' ? 2.5 : 1.75} />
              <span className="text-[11px] sm:text-xs">Voluntário</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPerfil('ong');
                setCnpj('');
                setNomeOng('');
              }}
              className={cn(
                'flex flex-col items-center gap-2 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer',
                perfil === 'ong'
                  ? 'border-violet-500/50 bg-violet-500/8 text-violet-600 dark:text-violet-400'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Building size={20} strokeWidth={perfil === 'ong' ? 2.5 : 1.75} />
              <span className="text-[11px] sm:text-xs truncate max-w-full">ONG</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPerfil('doador');
                setCnpj('');
                setNomeOng('');
              }}
              className={cn(
                'flex flex-col items-center gap-2 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer',
                perfil === 'doador'
                  ? 'border-emerald-500/50 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Sparkles size={20} strokeWidth={perfil === 'doador' ? 2.5 : 1.75} />
              <span className="text-[11px] sm:text-xs">Patrocinador</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {perfil === 'voluntario' ? (
              <>
                {/* Nome do voluntário */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-nome" className="text-sm font-medium text-foreground">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-nome"
                      type="text"
                      required
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Seletor de ONG */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-ong" className="text-sm font-medium text-foreground">
                    ONG vinculada
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(opcional)</span>
                  </label>

                  <div className="relative" id="reg-ong">
                    {/* Trigger do dropdown */}
                    <button
                      type="button"
                      onClick={() => setOngDropdownOpen(prev => !prev)}
                      className={cn(
                        'w-full flex items-center justify-between pl-3.5 pr-3 py-3 rounded-xl border border-border bg-background',
                        'text-sm transition-all duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
                        ongDropdownOpen && 'border-primary/50 ring-2 ring-primary/20'
                      )}
                    >
                      <span className={cn(
                        'flex items-center gap-2 truncate',
                        selectedOng ? 'text-foreground' : 'text-muted-foreground/60'
                      )}>
                        <Building size={15} className="text-muted-foreground shrink-0" />
                        {loadingOngs
                          ? 'Carregando ONGs...'
                          : selectedOng
                            ? selectedOng.nome
                            : 'Selecione uma ONG (opcional)'
                        }
                      </span>
                      <ChevronDown
                        size={15}
                        className={cn(
                          'text-muted-foreground transition-transform duration-150 shrink-0',
                          ongDropdownOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Painel dropdown */}
                    {ongDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1.5 rounded-xl border border-border bg-card shadow-card-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

                        {/* Campo de busca dentro do dropdown */}
                        <div className="p-2 border-b border-border">
                          <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Buscar ONG..."
                              value={ongSearch}
                              onChange={e => setOngSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                            />
                          </div>
                        </div>

                        <div className="max-h-44 overflow-y-auto">
                          {/* Opção de nenhuma ONG */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOng(null);
                              setOngDropdownOpen(false);
                              setOngSearch('');
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
                          >
                            Nenhuma / Não sei ainda
                          </button>

                          {loadingOngs ? (
                            <div className="flex items-center justify-center gap-2 py-5 text-xs text-muted-foreground">
                              <Loader2 size={14} className="animate-spin" />
                              Carregando...
                            </div>
                          ) : filteredOngs.length === 0 ? (
                            <div className="py-5 text-center text-xs text-muted-foreground">
                              {ongSearch ? `Nenhuma ONG encontrada para "${ongSearch}"` : 'Nenhuma ONG cadastrada ainda.'}
                            </div>
                          ) : (
                            filteredOngs.map(ong => (
                              <button
                                key={ong.id}
                                type="button"
                                onClick={() => {
                                  setSelectedOng(ong);
                                  setOngDropdownOpen(false);
                                  setOngSearch('');
                                }}
                                className={cn(
                                  'w-full text-left px-3.5 py-2.5 text-sm transition-colors flex items-center gap-2.5',
                                  selectedOng?.id === ong.id
                                    ? 'bg-primary/8 text-primary font-medium'
                                    : 'hover:bg-muted text-foreground'
                                )}
                              >
                                <Building size={13} className="text-muted-foreground shrink-0" />
                                {ong.nome}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : perfil === 'doador' ? (
              <>
                {/* Nome do Gestor do Doador */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-nome-gestor" className="text-sm font-medium text-foreground">
                    Nome do gestor responsável
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-nome-gestor"
                      type="text"
                      required
                      value={nomeGestor}
                      onChange={e => setNomeGestor(e.target.value)}
                      placeholder="Seu nome completo"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* CNPJ da Empresa */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-cnpj" className="text-sm font-medium text-foreground">
                    CNPJ da Empresa <span className="text-muted-foreground font-normal">(Validação Receita Federal)</span>
                  </label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-cnpj"
                      type="text"
                      required
                      value={cnpj}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 14) val = val.slice(0, 14);
                        val = val.replace(/^(\d{2})(\d)/, '$1.$2');
                        val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                        val = val.replace(/\.(\d{3})(\d)/, '.$1/$2');
                        val = val.replace(/(\d{4})(\d)/, '$1-$2');
                        setCnpj(val);
                      }}
                      placeholder="00.000.000/0000-00"
                      className={cn(inputClass, cnpjValid && 'border-emerald-500 ring-1 ring-emerald-500', cnpjError && 'border-destructive ring-1 ring-destructive')}
                    />
                    {cnpjLoading && (
                      <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {cnpjError && (
                    <p className="text-xs text-destructive mt-1">{cnpjError}</p>
                  )}
                  {cnpjValid && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <ShieldCheck size={12} /> Empresa Ativa verificada na Receita Federal
                    </p>
                  )}
                </div>

                {/* Razão Social / Nome da Empresa */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-nome-empresa" className="text-sm font-medium text-foreground">
                    Nome da Empresa / Razão Social
                  </label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-nome-empresa"
                      type="text"
                      required
                      value={nomeOng}
                      onChange={e => setNomeOng(e.target.value)}
                      placeholder="Nome da empresa (Automático pelo CNPJ)"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-nome-gestor" className="text-sm font-medium text-foreground">
                    Nome do gestor responsável
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-nome-gestor"
                      type="text"
                      required
                      value={nomeGestor}
                      onChange={e => setNomeGestor(e.target.value)}
                      placeholder="Seu nome completo"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-cnpj" className="text-sm font-medium text-foreground">
                    CNPJ <span className="text-muted-foreground font-normal">(Validação Receita/IPEA)</span>
                  </label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-cnpj"
                      type="text"
                      required
                      value={cnpj}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 14) val = val.slice(0, 14);
                        val = val.replace(/^(\d{2})(\d)/, '$1.$2');
                        val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                        val = val.replace(/\.(\d{3})(\d)/, '.$1/$2');
                        val = val.replace(/(\d{4})(\d)/, '$1-$2');
                        setCnpj(val);
                      }}
                      placeholder="00.000.000/0000-00"
                      className={cn(inputClass, cnpjValid && 'border-emerald-500 ring-1 ring-emerald-500', cnpjError && 'border-destructive ring-1 ring-destructive')}
                    />
                    {cnpjLoading && (
                      <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {cnpjError && (
                    <p className="text-xs text-destructive mt-1">{cnpjError}</p>
                  )}
                  {cnpjValid && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <Heart size={12} /> ONG Ativa verificada na base de dados
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-nome-ong" className="text-sm font-medium text-foreground">
                    Nome da instituição / ONG
                  </label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-nome-ong"
                      type="text"
                      required
                      value={nomeOng}
                      onChange={e => setNomeOng(e.target.value)}
                      placeholder="Nome da organização (Automático pelo CNPJ)"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-sm font-medium text-foreground">
                {perfil === 'ong' ? 'E-mail institucional' : perfil === 'doador' ? 'E-mail corporativo' : 'E-mail'}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-senha" className="text-sm font-medium text-foreground">
                Senha <span className="text-muted-foreground font-normal">(mín. 6 caracteres)</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-senha"
                  type={showSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className={cn(inputClass, 'pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={submitClass}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Criando conta...
                </span>
              ) : perfil === 'voluntario'
                ? 'Criar minha conta de voluntário'
                : 'Criar conta da minha ONG'
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
