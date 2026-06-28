import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Globe,
  Users,
  Clock,
  Leaf,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Landmark,
  QrCode,
  CheckCircle2,
  Building,
  ArrowLeft,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Logo } from '@/components/shared/Logo';
import { ImpactForest } from '@/components/impact/ImpactForest';
import { DonationTracker } from '@/components/impact/DonationTracker';

interface ImpactStats {
  totalHoras: number;
  totalAcoes: number;
  totalVoluntarios: number;
}

// ONGs reais disponíveis para doação (Filtradas via IA - Selo Ativo & Natal/RN)
const MOCK_ONGS_FALLBACK = [
  {
    id: 'casa-durval',
    nome: 'Casa Durval Paiva',
    cnpj: '01.396.800/0001-36',
    missao: 'Apoio ao tratamento e cura do câncer e doenças hematológicas infantojuvenis.',
    ods: ['ODS 3', 'ODS 10'],
    voluntarios: 85,
    impacto: 'Amparo completo a crianças e adolescentes',
    cor: 'border-l-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    seal_active: true,
    location: 'Natal/RN',
  }
];

const valorSugestoes = [25, 50, 100, 150, 300, 500];

type MetodoPagamento = 'pix' | 'cartao' | 'boleto';

const metodoPagamentoMeta: Record<MetodoPagamento, { label: string; icon: React.ElementType; desc: string }> = {
  pix: { label: 'Pix', icon: QrCode, desc: 'Aprovação instantânea' },
  cartao: { label: 'Cartão de Crédito', icon: CreditCard, desc: 'Parcele em até 12x' },
  boleto: { label: 'Boleto Bancário', icon: Landmark, desc: 'Vencimento em 3 dias' },
};

export default function DonorPage() {
  const [stats, setStats] = useState<ImpactStats>({ totalHoras: 0, totalAcoes: 0, totalVoluntarios: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // ONGs State
  const [ongs, setOngs] = useState<any[]>([]);
  const [loadingOngs, setLoadingOngs] = useState(true);
  const [recentDonors, setRecentDonors] = useState<any[]>([]);

  // Form state
  const [ongSelecionada, setOngSelecionada] = useState('');
  const [valorCustom, setValorCustom] = useState('');
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(100);
  const [metodo, setMetodo] = useState<MetodoPagamento>('pix');
  const [nomeTitular, setNomeTitular] = useState('');
  const [cpfDoador, setCpfDoador] = useState('');
  const [emailDoador, setEmailDoador] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Demo Pitch State
  const [demoProfile, setDemoProfile] = useState<string>('mock-diamante');

  useEffect(() => {
    document.title = 'Área do Doador — Raízes do Bem';
    void loadStats();
    void loadOngs();
  }, []);

  const loadOngs = async () => {
    setLoadingOngs(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, ong_name, cnpj, seal_active')
        .eq('tipo_usuario', 'ong');

      let mapped = [];
      if (data && data.length > 0) {
        mapped = data.map((ong, idx) => {
          const name = ong.ong_name || ong.nome || 'Instituição';
          const colors = ['border-l-emerald-500', 'border-l-blue-500', 'border-l-rose-500', 'border-l-violet-500'];
          const badges = [
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
            'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
            'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
            'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400'
          ];
          return {
            id: ong.id,
            nome: name,
            cnpj: ong.cnpj || 'Sem CNPJ',
            missao: `Instituição focada no desenvolvimento social e sustentabilidade da comunidade local.`,
            ods: idx % 2 === 0 ? ['ODS 3', 'ODS 10'] : ['ODS 17', 'ODS 9'],
            voluntarios: 10 + (idx * 5),
            impacto: 'Fomento a ações sociais locais',
            cor: colors[idx % colors.length],
            badge: badges[idx % badges.length],
            seal_active: ong.seal_active || false,
            location: 'Natal/RN'
          };
        });
      } else {
        mapped = MOCK_ONGS_FALLBACK;
      }
      setOngs(mapped);
      if (mapped.length > 0) {
        setOngSelecionada(mapped[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar ONGs:', err);
      setOngs(MOCK_ONGS_FALLBACK);
      setOngSelecionada(MOCK_ONGS_FALLBACK[0].id);
    } finally {
      setLoadingOngs(false);
    }
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [{ data: actions }, { data: profiles }, { data: donations }] = await Promise.all([
        supabase.from('volunteer_actions').select('horas'),
        supabase.from('profiles').select('id').eq('tipo_usuario', 'voluntario'),
        supabase.from('donations').select('id, doador_nome, valor, created_at, ong_id').order('created_at', { ascending: false }).limit(4)
      ]);

      const totalHoras = actions?.reduce((acc, a) => acc + Number(a.horas), 0) ?? 0;
      setStats({
        totalHoras,
        totalAcoes: actions?.length ?? 0,
        totalVoluntarios: profiles?.length ?? 0,
      });

      if (donations && donations.length > 0) {
        const ongIds = [...new Set(donations.map(d => d.ong_id))];
        const { data: ongsData } = await supabase.from('profiles').select('id, ong_name').in('id', ongIds);
        const ongMap = new Map(ongsData?.map(o => [o.id, o.ong_name]) ?? []);
        
        const mappedDonors = donations.map(d => ({
          name: d.doador_nome,
          amount: Number(d.valor),
          ong: ongMap.get(d.ong_id) || 'Instituição parceira',
          time: new Date(d.created_at).toLocaleDateString('pt-BR')
        }));
        setRecentDonors(mappedDonors);
      } else {
        // Fallback para doações estáticas se banco estiver vazio
        setRecentDonors([
          { name: 'Ana C.', amount: 150, ong: 'Casa Durval Paiva', time: 'há 2 horas' },
          { name: 'Marcos T.', amount: 50, ong: 'Liga Contra o Câncer', time: 'há 5 horas' },
          { name: 'Renata F.', amount: 300, ong: 'GACC-RN', time: 'ontem' }
        ]);
      }
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const valorFinal = valorCustom ? parseFloat(valorCustom) : valorSelecionado;
  const ongEscolhida = ongs.find(o => o.id === ongSelecionada);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorFinal || valorFinal < 5 || !nomeTitular || !emailDoador || !ongSelecionada) return;

    setSubmitting(true);
    try {
      const trackingCode = 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const { error } = await supabase
        .from('donations')
        .insert({
          ong_id: ongSelecionada,
          doador_nome: nomeTitular,
          valor: valorFinal,
          mensagem: 'Doação registrada na plataforma Raízes do Bem',
          tracking_code: trackingCode
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Erro ao salvar doação:', err);
      alert('Houve um erro ao processar a doação no banco de dados.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = cn(
    'w-full px-3.5 py-3 rounded-xl border border-border bg-background text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
    'transition-all duration-150 placeholder:text-muted-foreground/50'
  );

  // ── Tela de Confirmação ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Doação registrada!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Obrigado, <strong className="text-foreground">{nomeTitular.split(' ')[0]}</strong>!
              Sua contribuição de{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                R$ {valorFinal?.toFixed(2).replace('.', ',')}
              </strong>{' '}
              para <strong className="text-foreground">{ongEscolhida?.nome || 'Instituição'}</strong> foi recebida.
              Em breve você receberá a confirmação em <strong className="text-foreground">{emailDoador}</strong>.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted border border-border text-left space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Resumo da doação</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ONG beneficiada</span>
              <span className="font-medium text-foreground">{ongEscolhida?.nome || 'Instituição'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Método</span>
              <span className="font-medium text-foreground capitalize">{metodoPagamentoMeta[metodo].label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frequência</span>
              <span className="font-medium text-foreground">{recorrente ? 'Mensal recorrente' : 'Única'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all"
            >
              Fazer outra doação
            </button>
            <Link
              to="/"
              className="w-full py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-center"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-bold text-sm text-foreground">Raízes do Bem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              <ArrowLeft size={14} />
              Início
            </Link>
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* Banner de Direcionamento para Portal Corporativo */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 dark:bg-emerald-950/15 dark:border-emerald-900/40 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left shadow-sm">
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles size={15} />
              Área de Monitoramento Corporativo ESG
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-normal max-w-xl">
              Você é um patrocinador corporativo/empresa parceira? Acesse o Portal da Empresa para ver a evolução detalhada do seu Bosque, emitir selos ESG e relatórios de sustentabilidade.
            </p>
          </div>
          <Link to="/portal-empresa" className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 uppercase tracking-wider cursor-pointer">
            Acessar Portal Empresa
          </Link>
        </div>

        {/* ── Hero da Área do Doador ── */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-5">
            <Heart size={12} className="text-rose-500" />
            Área do Doador
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            Seu investimento gera{' '}
            <span className="text-brand">impacto real</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Cada contribuição é rastreável, transparente e auditável. Você acompanha onde seu dinheiro vai e o impacto que gera na comunidade.
          </p>
        </div>

        {/* ── Métricas de Impacto ── */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Impacto gerado pela plataforma até hoje
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Horas de Voluntariado',
                value: loadingStats ? '—' : `${stats.totalHoras.toFixed(0)}h`,
                icon: Clock,
                desc: 'Horas dedicadas a causas sociais',
                iconBg: 'bg-primary',
              },
              {
                label: 'Ações Realizadas',
                value: loadingStats ? '—' : stats.totalAcoes,
                icon: Leaf,
                desc: 'Intervenções registradas na plataforma',
                iconBg: 'bg-emerald-600',
              },
              {
                label: 'Voluntários Ativos',
                value: loadingStats ? '—' : stats.totalVoluntarios,
                icon: Users,
                desc: 'Pessoas comprometidas com o bem coletivo',
                iconBg: 'bg-violet-600',
              },
            ].map(({ label, value, icon: Icon, desc, iconBg }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-card flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Layout principal: Formulário + Sidebar ── */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── FORMULÁRIO DE DOAÇÃO ── */}
          <div className="space-y-6">

            {/* 1. Escolha a ONG */}
            <div className="rounded-xl border border-border bg-card shadow-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Building size={16} className="text-muted-foreground" />
                1. Escolha para onde sua doação vai
              </h3>

              <div className="space-y-3">
                {loadingOngs ? (
                  <div className="flex flex-col items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                    <Loader2 className="animate-spin text-primary" size={16} />
                    <span>Carregando instituições parceiras...</span>
                  </div>
                ) : ongs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Nenhuma instituição cadastrada para receber doações.
                  </div>
                ) : (
                  ongs.map(ong => (
                    <label
                      key={ong.id}
                      htmlFor={`ong-${ong.id}`}
                      className={cn(
                        'flex gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150',
                        ongSelecionada === ong.id
                          ? 'border-primary/50 bg-primary/4 ring-1 ring-primary/20'
                          : 'border-border hover:border-border/80 hover:bg-muted/40'
                      )}
                    >
                      <input
                        type="radio"
                        id={`ong-${ong.id}`}
                        name="ong"
                        value={ong.id}
                        checked={ongSelecionada === ong.id}
                        onChange={() => setOngSelecionada(ong.id)}
                        className="mt-1 accent-primary shrink-0"
                      />
                      <div className={cn('border-l-4 pl-3 w-full', ong.cor)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{ong.nome}</p>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">CNPJ: {ong.cnpj}</p>
                          </div>
                          {ong.seal_active && (
                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 shadow-sm shrink-0">
                              <ShieldCheck size={12} className="shrink-0" />
                              <span className="text-[10px] font-bold">Auditado por IA (IPEA)</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ong.missao}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex gap-1">
                            {ong.ods.map((o: any) => (
                              <span key={o} className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', ong.badge)}>
                                {o}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Users size={10} />
                            {ong.voluntarios} voluntários
                          </span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* 2. Valor da doação */}
            <div className="rounded-xl border border-border bg-card shadow-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Heart size={16} className="text-muted-foreground" />
                2. Defina o valor da contribuição
              </h3>

              {/* Sugestões rápidas */}
              <div className="grid grid-cols-3 gap-2">
                {valorSugestoes.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setValorSelecionado(v); setValorCustom(''); }}
                    className={cn(
                      'py-3 rounded-xl border text-sm font-semibold transition-all duration-150',
                      valorSelecionado === v && !valorCustom
                        ? 'border-primary/50 bg-primary/8 text-primary ring-1 ring-primary/20'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>

              {/* Campo personalizado */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="valor-custom" className="text-xs font-medium text-muted-foreground">
                  Ou insira um valor personalizado
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R$</span>
                  <input
                    id="valor-custom"
                    type="number"
                    min="5"
                    step="1"
                    placeholder="0,00"
                    value={valorCustom}
                    onChange={e => { setValorCustom(e.target.value); setValorSelecionado(null); }}
                    className={cn(inputClass, 'pl-10')}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Valor mínimo de R$ 5,00</p>
              </div>

              {/* Toggle Recorrência */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted transition-colors">
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={recorrente}
                    onChange={e => setRecorrente(e.target.checked)}
                    className="sr-only"
                    id="recorrente"
                  />
                  <div className={cn(
                    'w-10 h-6 rounded-full transition-colors duration-200',
                    recorrente ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}>
                    <div className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200',
                      recorrente ? 'left-5' : 'left-1'
                    )} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Doação mensal recorrente</p>
                  <p className="text-xs text-muted-foreground">Gere impacto contínuo com um único compromisso</p>
                </div>
              </label>
            </div>

            {/* 3. Método de pagamento */}
            <div className="rounded-xl border border-border bg-card shadow-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CreditCard size={16} className="text-muted-foreground" />
                3. Método de pagamento
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                {(Object.entries(metodoPagamentoMeta) as [MetodoPagamento, typeof metodoPagamentoMeta[MetodoPagamento]][]).map(
                  ([key, { label, icon: Icon, desc }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMetodo(key)}
                      className={cn(
                        'flex flex-col items-center gap-2 py-4 px-2 rounded-xl border text-center transition-all duration-150',
                        metodo === key
                          ? 'border-primary/50 bg-primary/6 ring-1 ring-primary/20'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      <Icon size={20} className={metodo === key ? 'text-primary' : 'text-muted-foreground'} />
                      <p className={cn('text-xs font-semibold', metodo === key ? 'text-primary' : 'text-foreground')}>
                        {label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </button>
                  )
                )}
              </div>

              {/* Aviso contextual por método */}
              {metodo === 'pix' && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                  <QrCode size={14} className="shrink-0 mt-0.5" />
                  <p>Após confirmar, o QR Code Pix será exibido para transferência imediata.</p>
                </div>
              )}
              {metodo === 'cartao' && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/8 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
                  <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                  <p>Pagamento processado com criptografia SSL. Seus dados são protegidos e não armazenados.</p>
                </div>
              )}
              {metodo === 'boleto' && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                  <Landmark size={14} className="shrink-0 mt-0.5" />
                  <p>O boleto será enviado ao e-mail informado. Vencimento em 3 dias úteis após emissão.</p>
                </div>
              )}
            </div>

            {/* 4. Dados do doador */}
            <form onSubmit={handleSubmit}>
              <div className="rounded-xl border border-border bg-card shadow-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  4. Seus dados para o recibo
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="nome-titular" className="text-sm font-medium text-foreground">
                      Nome completo
                    </label>
                    <input
                      id="nome-titular"
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={nomeTitular}
                      onChange={e => setNomeTitular(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cpf-doador" className="text-sm font-medium text-foreground">
                      CPF
                    </label>
                    <input
                      id="cpf-doador"
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpfDoador}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 11) val = val.slice(0, 11);
                        val = val.replace(/(\d{3})(\d)/, '$1.$2');
                        val = val.replace(/(\d{3})(\d)/, '$1.$2');
                        val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                        setCpfDoador(val);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="email-doador" className="text-sm font-medium text-foreground">
                      E-mail para recibo
                    </label>
                    <input
                      id="email-doador"
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={emailDoador}
                      onChange={e => setEmailDoador(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Botão de submissão */}
                <button
                  type="submit"
                  disabled={submitting || !valorFinal || (valorFinal < 5) || !nomeTitular || !emailDoador}
                  className={cn(
                    'w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2',
                    submitting || !valorFinal || (valorFinal < 5) || !nomeTitular || !emailDoador
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 hover:brightness-105'
                  )}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Heart size={16} />
                      Confirmar doação
                      {valorFinal && valorFinal >= 5 && (
                        <span className="font-bold">
                          · R$ {valorFinal.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-muted-foreground">
                  Interface demonstrativa — nenhuma cobrança real será efetuada.
                  <br />
                  Em produção, integrações com Stripe ou Efí Bank serão adicionadas.
                </p>
              </div>
            </form>
          </div>

          {/* ── SIDEBAR: Impacto estimado + Doadores recentes ── */}
          <div className="space-y-5">

            {/* Impacto estimado da doação */}
            <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4 sticky top-20">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Sparkles size={15} className="text-amber-500" />
                Impacto estimado da sua doação
              </h3>

              {valorFinal && valorFinal >= 5 ? (
                <div className="space-y-3">
                  {[
                    {
                      label: 'Horas de voluntariado viabilizadas',
                      value: `~${Math.round(valorFinal / 10)}h`,
                      icon: Clock,
                      color: 'text-primary',
                    },
                    {
                      label: 'Famílias potencialmente alcançadas',
                      value: `~${Math.round(valorFinal / 30)}`,
                      icon: Users,
                      color: 'text-violet-600 dark:text-violet-400',
                    },
                    {
                      label: 'Refeições ou kits de apoio',
                      value: `~${Math.round(valorFinal / 15)}`,
                      icon: Leaf,
                      color: 'text-emerald-600 dark:text-emerald-400',
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={color} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <span className={cn('text-sm font-bold shrink-0', color)}>{value}</span>
                    </div>
                  ))}

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    <strong>ONG selecionada:</strong> {ongEscolhida?.nome || 'Nenhuma'}
                    <br />
                    <span className="text-[10px] opacity-80">{ongEscolhida?.impacto || ''}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Selecione um valor para ver o impacto estimado.
                </p>
              )}

              {/* Selos de transparência */}
              <div className="pt-3 border-t border-border space-y-2">
                {[
                  'Dados auditáveis via RLS',
                  '100% rastreável na plataforma',
                  'Relatório ESG disponível',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck size={12} className="text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Doadores recentes */}
            <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Heart size={14} className="text-rose-500" />
                Doações recentes
              </h3>

              <div className="space-y-3">
                {recentDonors.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                      {d.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{d.ong}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {d.amount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{d.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/transparencia"
                className="flex items-center justify-between text-xs text-primary font-medium hover:underline pt-1"
              >
                Ver página de transparência
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dashboard Corporativo & Extrato do Bem ── */}
      <section className="py-12 bg-white dark:bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          
          <div className="p-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 mb-8">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Sparkles size={18} />
              Controle da Demonstração (Pitch)
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
              Selecione diferentes cenários de empresas patrocinadoras para ver como a "Floresta ESG" se adapta visualmente:
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setDemoProfile('mock-iniciante')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'mock-iniciante' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                🌱 Nível 1: Semente
              </button>
              <button
                onClick={() => setDemoProfile('mock-broto')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'mock-broto' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                🌿 Nível 2: Broto
              </button>
              <button
                onClick={() => setDemoProfile('mock-jovem')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'mock-jovem' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                🌲 Nível 3: Árvore Jovem
              </button>
              <button
                onClick={() => setDemoProfile('mock-carvalho')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'mock-carvalho' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                🌳 Nível 4: Carvalho Guardião
              </button>
              <button
                onClick={() => setDemoProfile('mock-ecossistema')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'mock-ecossistema' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                🌸 Nível 5: Ecossistema
              </button>
              <button
                onClick={() => setDemoProfile('mock-diamante')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'mock-diamante' ? 'bg-cyan-600 text-white border-cyan-700 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                💎 Nível 6: Floresta Diamante
              </button>
              <button
                onClick={() => setDemoProfile('mock-churn')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'mock-churn' ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                🍂 Risco de Churn (Seca)
              </button>
              <button
                onClick={() => setDemoProfile('default')}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer', 
                  demoProfile === 'default' ? 'bg-slate-800 text-white border-slate-900 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                🎲 Padrão Aleatório
              </button>
            </div>
          </div>

          <ImpactForest companyId={demoProfile} />
          
          <div className="pt-8">
            <DonationTracker />
          </div>
        </div>
      </section>

      {/* ── Footer minimalista ── */}
      <footer className="border-t border-border py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>Raízes do Bem © 2026 — Oxente Code</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/transparencia" className="hover:text-foreground transition-colors">Transparência</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
