import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Globe, 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Code, 
  Download, 
  Layers, 
  Terminal, 
  CreditCard, 
  ExternalLink,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  History,
  TrendingUp,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ImpactForest } from '@/components/impact/ImpactForest';
import { useAuth } from '@/hooks/useAuth';
import { useImpactForest } from '@/hooks/useImpactForest';
import { Logo } from '@/components/shared/Logo';

export default function DonorDashboardPage() {
  const { sessao } = useAuth();
  const [activeTab, setActiveTab] = useState<'bosque' | 'recompensas' | 'integracao' | 'historico'>('bosque');
  const [demoProfile, setDemoProfile] = useState<string>('default');
  const [apiKey, setApiKey] = useState('conecta_live_oxente_9b8a21f8a846b412');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);

  useEffect(() => {
    document.title = 'Portal da Empresa — Raízes do Bem';
  }, []);

  const handleCopyKey = () => {
    void navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyWidget = () => {
    const code = `<iframe src="https://conecta-impacto.com/widget/oxente-code" width="220" height="220" frameborder="0" style="border:none; overflow:hidden;" title="Selo Oficial Raízes do Bem"></iframe>`;
    void navigator.clipboard.writeText(code);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  const { level, isSuffering, daysSinceLastDonation, commits } = useImpactForest(demoProfile === 'default' ? (sessao?.id || 'default') : demoProfile);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background text-slate-800 dark:text-foreground flex flex-col font-sans">
      
      {/* ── TOP NAV BAR ── */}
      <header className="border-b border-border bg-white/80 dark:bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mr-2">
              <ArrowLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Início</span>
            </Link>
            <Logo size={32} />
            <div>
              <span className="font-black text-sm text-slate-900 dark:text-foreground tracking-tight">
                Raízes do Bem
              </span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">
                Portal Corporate
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Logged Sponsor Profile Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 text-xs font-black uppercase">
                {(sessao?.ongName || sessao?.nome || 'ME').slice(0, 2)}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{sessao?.ongName ?? sessao?.nome ?? 'Minha Empresa'}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD PANEL ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner de Boas Vindas & Status */}
        <div className={cn(
          "p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm",
          isSuffering 
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/20 dark:to-orange-950/10 dark:border-amber-900/40" 
            : "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-100 dark:border-emerald-800/20"
        )}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
              <h1 className="text-xl font-black text-slate-800 dark:text-white">{sessao?.ongName ?? sessao?.nome ?? 'Minha Empresa'}</h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gerencie suas doações recorrentes, acesse insígnias corporativas e acompanhe a evolução do seu Bosque ESG.
            </p>
          </div>

          {isSuffering ? (
            <div className="flex items-center gap-2.5 bg-amber-500 text-white px-4 py-2 rounded-2xl font-bold text-xs shadow-md border border-amber-300 animate-pulse">
              <AlertTriangle size={15} />
              <span>ALERTA AMARELO: {daysSinceLastDonation} DIAS SEM IMPACTO VALIDADO</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-2 rounded-2xl font-bold text-xs shadow-md border border-emerald-500">
              <ShieldCheck size={15} />
              <span>STATUS: ASSINATURA ESG ATIVA</span>
            </div>
          )}
        </div>

        {/* ── TABS NAVIGATION ── */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('bosque')}
            className={cn(
              "pb-4 text-sm font-bold tracking-tight transition-all relative cursor-pointer whitespace-nowrap",
              activeTab === 'bosque' 
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 font-extrabold" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span className="flex items-center gap-2">
              <Layers size={16} />
              Meu Bosque ESG
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recompensas')}
            className={cn(
              "pb-4 text-sm font-bold tracking-tight transition-all relative cursor-pointer whitespace-nowrap",
              activeTab === 'recompensas' 
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 font-extrabold" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span className="flex items-center gap-2">
              <Trophy size={16} />
              Recompensas & Selos {level >= 1 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('integracao')}
            className={cn(
              "pb-4 text-sm font-bold tracking-tight transition-all relative cursor-pointer whitespace-nowrap",
              activeTab === 'integracao' 
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 font-extrabold" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span className="flex items-center gap-2">
              <Code size={16} />
              Integração Web & API
            </span>
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={cn(
              "pb-4 text-sm font-bold tracking-tight transition-all relative cursor-pointer whitespace-nowrap",
              activeTab === 'historico' 
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 font-extrabold" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span className="flex items-center gap-2">
              <History size={16} />
              Extrato do Bem
            </span>
          </button>
        </div>

        {/* ── TAB CONTENT 1: MEU BOSQUE (CENTRAL DA ÁRVORE) ── */}
        {activeTab === 'bosque' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Painel de Pitch (Colocado aqui para controle de demonstração) */}
            <div className="p-6 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/15">
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-400 mb-2.5 flex items-center gap-2">
                <Sparkles size={16} />
                Controle de Demonstração (Apresentação para a Banca)
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-4">
                Como jurado ou apresentador, mude os perfis de doação abaixo para ver a árvore evoluir na hora, simulando as regras ESG do sistema:
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setDemoProfile('default')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'default' ? 'bg-slate-800 text-white border-slate-900 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  🎲 Dados Reais da Conta
                </button>
                <button
                  onClick={() => setDemoProfile('mock-iniciante')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'mock-iniciante' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  🌱 Nível 1: Semente
                </button>
                <button
                  onClick={() => setDemoProfile('mock-broto')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'mock-broto' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  🌿 Nível 2: Broto
                </button>
                <button
                  onClick={() => setDemoProfile('mock-jovem')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'mock-jovem' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  🌲 Nível 3: Árvore Jovem
                </button>
                <button
                  onClick={() => setDemoProfile('mock-carvalho')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'mock-carvalho' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  🌳 Nível 4: Carvalho Guardião
                </button>
                <button
                  onClick={() => setDemoProfile('mock-ecossistema')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'mock-ecossistema' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  🌸 Nível 5: Ecossistema
                </button>
                <button
                  onClick={() => setDemoProfile('mock-diamante')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'mock-diamante' ? 'bg-cyan-600 text-white border-cyan-700 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  💎 Nível 6: Floresta Diamante
                </button>
                <button
                  onClick={() => setDemoProfile('mock-churn')}
                  className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                    demoProfile === 'mock-churn' ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  )}
                >
                  🍂 Risco de Churn (Seca)
                </button>
              </div>
            </div>

            {/* Renderização da Árvore Ampliada */}
            <ImpactForest companyId={demoProfile} />

            {/* Métricas Corporativas ESG Extras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Carbono Evitado</span>
                  <TrendingUp size={18} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-black">1.2 Tons CO₂</p>
                <p className="text-xs text-slate-500 leading-normal">Equivalente a {level * 8} árvores adultas nativas plantadas em áreas de reflorestamento.</p>
              </div>
              
              <div className="p-6 bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Marmitas Financiadas</span>
                  <Trophy size={18} className="text-amber-500" />
                </div>
                <p className="text-2xl font-black">{level * 125} Marmitas</p>
                <p className="text-xs text-slate-500 leading-normal">Apoio a cozinhas comunitárias cadastradas na rede Conecta.</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Próximo Débito Recorrente</span>
                  <Calendar size={18} className="text-indigo-500" />
                </div>
                <p className="text-2xl font-black">12/07/2026</p>
                <p className="text-xs text-slate-500 leading-normal">R$ {(level * 140).toLocaleString('pt-BR')} via Pix Recorrente. Status: Programado.</p>
              </div>
            </div>

            {/* Call to action de nova doação */}
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl shadow-md">
              <div>
                <h4 className="font-extrabold text-base">Quer acelerar o crescimento do seu Bosque?</h4>
                <p className="text-xs text-emerald-100 mt-1">Aporte fundos extras a qualquer momento para subir de nível e desbloquear novas insígnias corporativas.</p>
              </div>
              <Link to="/doador" className="px-5 py-2.5 bg-white text-emerald-700 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-50 transition-colors uppercase tracking-wider">
                Doar Recursos
              </Link>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT 2: RECOMPENSAS ESG ── */}
        {activeTab === 'recompensas' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="space-y-2">
              <h2 className="text-lg font-black">Área de Download e Ativação de Selos</h2>
              <p className="text-sm text-slate-500">
                Aqui você acessa e emite todos os direitos e selos ESG conquistados através da constância do seu patrocínio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nível 1 Certificado */}
              <div className={cn(
                "p-6 bg-white dark:bg-slate-950 rounded-3xl border shadow-sm space-y-4 relative overflow-hidden transition-all duration-300",
                level >= 1 ? "border-slate-200 dark:border-slate-800" : "border-slate-100 opacity-50 dark:border-slate-900"
              )}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível 1 Conquistado</span>
                    <h3 className="font-bold text-base">Certificado de Início de Jornada</h3>
                  </div>
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    level >= 1 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-900"
                  )}>
                    {level >= 1 ? 'Desbloqueado' : 'Bloqueado'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Certificado oficial digital assinado eletronicamente atestando o início do suporte da empresa aos projetos sociais do Raízes do Bem. Perfeito para stories e LinkedIn.
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    disabled={level < 1}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download size={14} />
                    Baixar PDF
                  </button>
                  <button 
                    disabled={level < 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Share2 size={14} />
                    Compartilhar
                  </button>
                </div>
              </div>

              {/* Nível 3 Selo de Transparência */}
              <div className={cn(
                "p-6 bg-white dark:bg-slate-950 rounded-3xl border shadow-sm space-y-4 relative overflow-hidden transition-all duration-300",
                level >= 3 ? "border-slate-200 dark:border-slate-800" : "border-slate-100 opacity-50 dark:border-slate-900"
              )}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível 3 Conquistado</span>
                    <h3 className="font-bold text-base">Selo Conecta de Transparência</h3>
                  </div>
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    level >= 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-900"
                  )}>
                    {level >= 3 ? 'Desbloqueado' : 'Bloqueado'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Selo vetorial de alta definição para inserção em embalagens físicas de produtos, assinaturas de e-mail corporativo ou rodapés de relatórios impressos.
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    disabled={level < 3 || isSuffering}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download size={14} />
                    Baixar Selo (PNG/SVG)
                  </button>
                </div>
                {isSuffering && level >= 3 && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80 backdrop-blur-[1px] flex items-center justify-center p-4">
                    <div className="bg-amber-500 text-white p-4 rounded-2xl text-center max-w-xs shadow-md border border-amber-400">
                      <p className="text-xs font-black uppercase">⚠️ Acesso Suspenso</p>
                      <p className="text-[10px] mt-1">Selo ESG suspenso temporariamente. Faça um aporte para recuperar a validação do mês.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Nível 4 Relatórios ESG */}
              <div className={cn(
                "p-6 bg-white dark:bg-slate-950 rounded-3xl border shadow-sm space-y-4 relative overflow-hidden transition-all duration-300",
                level >= 4 ? "border-slate-200 dark:border-slate-800" : "border-slate-100 opacity-50 dark:border-slate-900"
              )}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível 4 Conquistado</span>
                    <h3 className="font-bold text-base">Relatório ESG Automatizado</h3>
                  </div>
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    level >= 4 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-900"
                  )}>
                    {level >= 4 ? 'Desbloqueado' : 'Bloqueado'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Relatório social robusto detalhando toda a alocação de fundos, comprovantes de auditoria e métricas quantificadas de impacto da ONU (ODS), com a logomarca da sua empresa.
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    disabled={level < 4 || isSuffering}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download size={14} />
                    Exportar Relatório Anual (PDF)
                  </button>
                </div>
              </div>

              {/* Nível 5 Status Âncora */}
              <div className={cn(
                "p-6 bg-white dark:bg-slate-950 rounded-3xl border shadow-sm space-y-4 relative overflow-hidden transition-all duration-300",
                level >= 5 ? "border-slate-200 dark:border-slate-800" : "border-slate-100 opacity-50 dark:border-slate-900"
              )}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível 5 Conquistado</span>
                    <h3 className="font-bold text-base">Destaque de Empresa Âncora</h3>
                  </div>
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    level >= 5 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-900"
                  )}>
                    {level >= 5 ? 'Desbloqueado' : 'Bloqueado'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Destaque premium da sua logo no topo do feed do aplicativo dos cidadãos voluntários e doadores como patrocinador máster que mantém a operação das ONGs ativas.
                </p>
                <div className="flex gap-3 pt-2">
                  <Link 
                    to="/transparencia"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Visualizar na Transparência
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT 3: INTEGRACAO WEB E API ── */}
        {activeTab === 'integracao' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="space-y-2">
              <h2 className="text-lg font-black">Área de Integrações Digitais</h2>
              <p className="text-sm text-slate-500">
                Integre seu impacto diretamente nos canais digitais da sua empresa para divulgar aos seus clientes em tempo real.
              </p>
            </div>

            {/* Widget Nível 2 */}
            <div className={cn(
              "p-6 bg-white dark:bg-slate-950 rounded-3xl border shadow-sm space-y-5 relative overflow-hidden transition-all duration-300",
              level >= 2 ? "border-slate-200 dark:border-slate-800" : "border-slate-100 opacity-50 dark:border-slate-900"
            )}>
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recurso do Nível 2</span>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Code size={18} className="text-emerald-500" />
                    Widget Oficial Conecta (HTML Iframe)
                  </h3>
                </div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  level >= 2 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-900"
                )}>
                  {level >= 2 ? 'Ativo' : 'Requer Nível 2'}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cole o código abaixo no arquivo HTML do site institucional da sua empresa para exibir dinamicamente o status de doador e a árvore atual em tempo real:
                  </p>
                  
                  {/* Code box */}
                  <div className="bg-slate-950 dark:bg-slate-900 text-slate-300 p-4 rounded-2xl relative group font-mono text-[10px] border border-slate-800">
                    <button 
                      disabled={level < 2}
                      onClick={handleCopyWidget}
                      className="absolute right-3 top-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-sans font-bold text-[9px] cursor-pointer"
                    >
                      {copiedWidget ? 'Copiado!' : 'Copiar'}
                    </button>
                    <code className="block break-all max-w-[90%] pr-4 leading-normal">
                      {`<iframe src="https://conecta-impacto.com/widget/oxente-code" width="220" height="220" frameborder="0" style="border:none;" title="Selo Oficial Raízes do Bem"></iframe>`}
                    </code>
                  </div>
                </div>

                {/* Widget Visual Mock Preview */}
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-3">Prévia do Widget</span>
                  
                  {/* Mocked Widget inside */}
                  <div className="w-40 h-40 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Globe size={14} className="text-emerald-600" />
                    </div>
                    <div className="text-[10px] font-extrabold uppercase text-slate-400 mt-1">Apoiador Oficial</div>
                    <div className="text-xs font-bold">OxenteCode Tech</div>
                    <div className="w-16 h-16 scale-90">
                      {/* Mini rendering of tree */}
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <circle cx="100" cy="80" r="38" fill="#10B981" />
                        <path d="M94,160 Q97,120 95,95 Q103,120 106,160" fill="#4E3629" />
                        <path d="M10,160 Q100,143 190,160 L190,180 L10,180 Z" fill="#3F2314" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Nível 6 */}
            <div className={cn(
              "p-6 bg-white dark:bg-slate-950 rounded-3xl border shadow-sm space-y-5 relative overflow-hidden transition-all duration-300",
              level >= 6 ? "border-slate-200 dark:border-slate-800" : "border-slate-100 opacity-50 dark:border-slate-900"
            )}>
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recurso Premium do Nível 6</span>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Terminal size={18} className="text-cyan-500" />
                    API Aberta de Monitoramento (Transmissão de Recepção)
                  </h3>
                </div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  level >= 6 ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400" : "bg-slate-100 text-slate-500 dark:bg-slate-900"
                )}>
                  {level >= 6 ? 'Ativo' : 'Requer Nível 6'}
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para patrocinadores master nível **Floresta Diamante**, fornecemos uma API WebSocket em tempo real. Copie a chave de autenticação para configurar o feed nos televisores da sua recepção física ou telões corporativos em eventos:
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900/70 p-3 rounded-2xl font-mono text-[11px] flex items-center justify-between border border-slate-200/50 dark:border-slate-800 select-all">
                    <span className="truncate">{apiKey}</span>
                  </div>
                  <button
                    disabled={level < 6}
                    onClick={handleCopyKey}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  >
                    {copiedKey ? 'Copiado!' : 'Copiar Token API'}
                  </button>
                </div>

                <div className="p-4 bg-slate-950 dark:bg-slate-900 text-slate-300 rounded-2xl font-mono text-[10px] space-y-1 overflow-x-auto border border-slate-800">
                  <p className="text-cyan-400">// Exemplo de requisição GET real-time</p>
                  <p><span className="text-emerald-400">curl</span> -H <span className="text-amber-400">"Authorization: Bearer {level >= 6 ? apiKey : '...'}"</span> \</p>
                  <p>  https://api.conecta-impacto.com/v1/sponsor/forest-feed</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT 4: EXTRATO DO BEM (HISTÓRICO LEDGER) ── */}
        {activeTab === 'historico' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="space-y-2">
              <h2 className="text-lg font-black">Histórico Geral de Aportes</h2>
              <p className="text-sm text-slate-500">
                Extrato social de contribuições auditadas com o link de rastreabilidade na Ledger imutável.
              </p>
            </div>

            {/* Tabela de Doações Simples */}
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Data do Aporte</th>
                    <th className="px-6 py-4">ONG Destinatária</th>
                    <th className="px-6 py-4">Valor Auditado</th>
                    <th className="px-6 py-4">Método</th>
                    <th className="px-6 py-4">Hash do Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {commits
                    .filter(c => c.amount > 0)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="px-6 py-4 font-semibold">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {item.isMock ? 'ONG Parceira (Simulada)' : 'ONG Conectada'}
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">
                          R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {item.isMock ? 'Aporte IA' : 'Pix'}
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                          {item.isMock ? `0x${item.date.replace(/-/g, '')}...demo` : '0x8f2c...a7b1'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-border py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>Raízes do Bem © 2026 — Oxente Code</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/transparencia" className="hover:text-foreground transition-colors">Transparência</Link>
            <Link to="/doador" className="hover:text-foreground transition-colors">Fazer Nova Doação</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
