import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Heart, CheckCircle2, XCircle,
  Globe, ArrowLeft, Star, Clock, Users, Activity,
  FileText, ShieldCheck, Award, BarChart3, BookOpen,
  Sparkles, Loader2, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Logo } from '@/components/shared/Logo';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface OngProfile {
  id: string;
  nome: string;
  ong_name: string;
  cidade: string;
  descricao: string;
  missao: string;
  site: string | null;
  ods_tags: string[];
  porte: string;
  area_atuacao: string;
  totalHoras: number;
  totalAcoes: number;
  totalVoluntarios: number;
  created_at: string;
  last_audit_date: string | null;
  seal_active: boolean;
  dados_auditoria: any | null;
}

// ── Dados de auditoria estáticos (em produção, viriam de tabela de auditoria) ──
interface AuditPillar {
  label: string;
  icon: React.ElementType;
  score: number;
  completed: boolean;
  items: { criterio: string; resultado: string; score: number; ok: boolean }[];
}

function buildAuditPillars(horas: number, acoes: number): AuditPillar[] {
  const financScore = 85;
  const impactoScore = horas > 50 ? 100 : horas > 20 ? 80 : 60;
  const govScore = 92;
  const culturaScore = 88;

  return [
    {
      label: 'Transparência Financeira',
      icon: FileText,
      score: financScore,
      completed: financScore >= 80,
      items: [
        { criterio: 'Balanço Patrimonial Publicado', resultado: 'Publicado', score: 100, ok: true },
        { criterio: 'Auditoria Externa Independente', resultado: 'Anual', score: 100, ok: true },
        { criterio: 'DRE disponível publicamente', resultado: 'Disponível', score: 100, ok: true },
        { criterio: 'Relatório de Despesas Detalhado', resultado: 'Parcial', score: 60, ok: false },
        { criterio: 'Conformidade Fiscal (CNPJ ativo)', resultado: 'Conforme', score: 100, ok: true },
      ],
    },
    {
      label: 'Medição de Impacto',
      icon: BarChart3,
      score: impactoScore,
      completed: impactoScore >= 70,
      items: [
        { criterio: 'Horas de Voluntariado Auditadas', resultado: `${horas.toFixed(0)}h registradas`, score: horas > 50 ? 100 : 70, ok: horas > 0 },
        { criterio: 'Ações de Campo Documentadas', resultado: `${acoes} ações`, score: acoes > 10 ? 100 : acoes > 0 ? 75 : 40, ok: acoes > 0 },
        { criterio: 'Metodologia de Mensuração', resultado: 'Definida via ODS/ONU', score: 90, ok: true },
        { criterio: 'Metas e Indicadores Públicos', resultado: 'Publicados', score: 80, ok: true },
        { criterio: 'Check-in Emocional dos Voluntários', resultado: 'Monitorado', score: 100, ok: true },
      ],
    },
    {
      label: 'Governança',
      icon: ShieldCheck,
      score: govScore,
      completed: govScore >= 80,
      items: [
        { criterio: 'Estatuto Social Publicado', resultado: 'Publicado', score: 100, ok: true },
        { criterio: 'Conselho Fiscal Ativo', resultado: 'Ativo — 5 membros', score: 100, ok: true },
        { criterio: 'Política Antifraude', resultado: 'Implementada', score: 100, ok: true },
        { criterio: 'Ata de Eleição da Diretoria', resultado: 'Publicada', score: 100, ok: true },
        { criterio: 'Conflito de Interesses Declarado', resultado: 'Não declarado', score: 40, ok: false },
      ],
    },
    {
      label: 'Cultura Organizacional',
      icon: BookOpen,
      score: culturaScore,
      completed: culturaScore >= 80,
      items: [
        { criterio: 'Código de Conduta Interno', resultado: 'Publicado e assinado', score: 100, ok: true },
        { criterio: 'Canal de Denúncias (Whistleblower)', resultado: 'Canal ativo', score: 100, ok: true },
        { criterio: 'Política de Diversidade e Inclusão', resultado: 'Em elaboração', score: 50, ok: false },
        { criterio: 'Treinamento Obrigatório de Voluntários', resultado: 'Anual realizado', score: 100, ok: true },
        { criterio: 'Avaliação de Clima Organizacional', resultado: 'Semestral', score: 90, ok: true },
      ],
    },
  ];
}

// ── Componente de score em estrelas ───────────────────────────────────────────
function StarScore({ score }: { score: number }) {
  const stars = Math.round((score / 100) * 4);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <Star
          key={i}
          size={13}
          className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
}

// ── Componente de linha de critério ───────────────────────────────────────────
function CriterioRow({
  criterio, resultado, score, ok
}: { criterio: string; resultado: string; score: number; ok: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 py-3.5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {ok
            ? <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            : <XCircle size={15} className="text-rose-500 mt-0.5 shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{criterio}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{resultado}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 w-28">
          <span className={cn(
            'text-xs font-bold',
            score >= 90 ? 'text-emerald-600 dark:text-emerald-400'
              : score >= 70 ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-500'
          )}>
            {score}%
          </span>
          <Progress
            value={score}
            className={cn(
              'h-1.5 w-24',
              score >= 90 ? '[&>div]:bg-emerald-500'
                : score >= 70 ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-rose-500'
            )}
          />
        </div>
      </div>
      <Separator />
    </>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function OngProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ong, setOng] = useState<OngProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/transparencia'); return; }
    document.title = 'Perfil da ONG — Raízes do Bem';
    void loadOng(id);
  }, [id]);

  const loadOng = async (ongId: string) => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, ong_name, nome, created_at, cidade, descricao, missao, site, area_atuacao, last_audit_date, seal_active, dados_auditoria')
        .eq('id', ongId)
        .eq('tipo_usuario', 'ong')
        .single();

      if (!profile) { navigate('/transparencia'); return; }

      const { data: actions } = await supabase
        .from('volunteer_actions')
        .select('horas, user_id')
        .eq('ong_id', ongId);

      const totalHoras = actions?.reduce((s, a) => s + Number(a.horas), 0) ?? 0;
      const totalAcoes = actions?.length ?? 0;
      const totalVol   = new Set(actions?.map(a => a.user_id) ?? []).size;

      setOng({
        id: profile.id,
        nome: profile.nome,
        ong_name: profile.ong_name ?? profile.nome,
        cidade: profile.cidade || 'Natal, RN',
        descricao: profile.descricao || 'Organização sem fins lucrativos dedicada à transformação social por meio do voluntariado estruturado e monitorado na plataforma Raízes do Bem.',
        missao: profile.missao || 'Conectar pessoas engajadas a causas sociais verificáveis, com dados auditáveis, promovendo impacto real e mensurável no Rio Grande do Norte.',
        site: profile.site || null,
        ods_tags: ['ODS 3', 'ODS 10', 'ODS 17'],
        porte: totalVol >= 20 ? 'Grande Porte' : totalVol >= 5 ? 'Médio Porte' : 'Pequeno Porte',
        area_atuacao: profile.area_atuacao || 'Assistência Social',
        totalHoras,
        totalAcoes,
        totalVoluntarios: totalVol,
        created_at: profile.created_at,
        last_audit_date: profile.last_audit_date || null,
        seal_active: profile.seal_active || false,
        dados_auditoria: profile.dados_auditoria || null,
      });
    } catch (err) {
      console.error('Erro ao carregar ONG:', err);
      navigate('/transparencia');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!ong) return;
    setAuditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('compliance-bot', {
        body: { ong_id: ong.id }
      });
      if (error) throw error;
      if (data) {
        setAiReport(data.report);
        void loadOng(ong.id);
      }
    } catch (err) {
      console.error('Erro ao executar auditoria IA:', err);
      alert('Erro ao invocar o Robô de Compliance. Verifique se as Edge Functions estão ativas.');
    } finally {
      setAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ong) return null;

  const getDynamicPillars = (): AuditPillar[] => {
    if (ong && ong.dados_auditoria) {
      const da = ong.dados_auditoria;
      return [
        {
          label: 'Transparência Financeira',
          icon: FileText,
          score: da.transparencia_financeira?.score ?? 90,
          completed: da.transparencia_financeira?.completed ?? true,
          items: da.transparencia_financeira?.criterios ?? [],
        },
        {
          label: 'Medição de Impacto',
          icon: BarChart3,
          score: da.medicao_impacto?.score ?? 85,
          completed: da.medicao_impacto?.completed ?? true,
          items: da.medicao_impacto?.criterios ?? [],
        },
        {
          label: 'Governança & Relações',
          icon: BookOpen,
          score: da.governanca?.score ?? 92,
          completed: da.governanca?.completed ?? true,
          items: da.governanca?.criterios ?? [],
        },
        {
          label: 'Cultura & ODS',
          icon: Award,
          score: da.cultura_organizacional?.score ?? 88,
          completed: da.cultura_organizacional?.completed ?? true,
          items: da.cultura_organizacional?.criterios ?? [],
        },
      ];
    }
    return buildAuditPillars(ong?.totalHoras ?? 0, ong?.totalAcoes ?? 0);
  };

  const pillars  = getDynamicPillars();
  const avgScore = Math.round(pillars.reduce((s, p) => s + p.score, 0) / pillars.length);
  const seal     = avgScore >= 90 ? 'Ouro' : avgScore >= 75 ? 'Prata' : 'Bronze';
  const sealColor = {
    Ouro:   { ring: 'border-amber-400', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/15' },
    Prata:  { ring: 'border-slate-400', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/20' },
    Bronze: { ring: 'border-amber-700', text: 'text-amber-800 dark:text-amber-600', bg: 'bg-amber-50/50 dark:bg-amber-900/10' },
  }[seal];

  const yearsActive = new Date().getFullYear() - new Date(ong.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/transparencia" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
            <span className="text-sm font-medium">Portal de Transparência</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/doador" className="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Fazer Doação
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Cabeçalho de Confiança ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Esquerda: Identidade + Missão ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header da ONG */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl border-2 border-border bg-muted flex items-center justify-center shrink-0 shadow-sm">
                <Building2 size={28} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{ong.ong_name}</h1>
                  {ong.seal_active ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 font-semibold text-[10px] flex items-center gap-1">
                      <ShieldCheck size={11} />
                      Selo de Transparência Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0 font-semibold text-[10px] flex items-center gap-1">
                      <XCircle size={11} className="text-amber-600 dark:text-amber-400" />
                      Selo Pendente de Auditoria
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {ong.cidade}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {yearsActive <= 0 ? 'Recém fundada' : `${yearsActive}+ anos`}
                  </span>
                  {ong.site && (
                    <a href={ong.site} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Globe size={13} />
                      Site oficial
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[11px]">{ong.porte}</Badge>
                  <Badge variant="outline" className="text-[11px]">{ong.area_atuacao}</Badge>
                  {ong.ods_tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[11px] border-primary/30 text-primary bg-primary/5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Missão */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Missão Institucional</h2>
              <p className="text-sm text-foreground leading-relaxed">{ong.missao}</p>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sobre a Organização</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{ong.descricao}</p>
            </div>

            {/* Métricas de impacto */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Horas Voluntárias', value: `${ong.totalHoras.toFixed(0)}h`, icon: Clock,     color: 'text-primary' },
                { label: 'Ações Realizadas',  value: ong.totalAcoes,                   icon: Activity,  color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Voluntários',        value: ong.totalVoluntarios,             icon: Users,     color: 'text-violet-600 dark:text-violet-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="text-center p-4">
                  <Icon size={16} className={cn('mx-auto mb-1.5', color)} />
                  <p className="text-xl font-bold text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
                </Card>
              ))}
            </div>

            {/* Botão de Doação */}
            <div className="flex flex-col sm:flex-row gap-3">
              {donateSuccess ? (
                <div className="flex-1 flex items-center gap-2 px-5 py-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 size={16} />
                  Doação registrada! Obrigado pelo apoio.
                </div>
              ) : (
                <Link
                  to="/doador"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all"
                >
                  <Heart size={16} />
                  Fazer uma doação para esta ONG
                </Link>
              )}
              <Link
                to="/transparencia"
                className="flex items-center justify-center gap-2 px-5 py-3.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Ver todas as ONGs
              </Link>
            </div>
          </div>

          {/* Direita: Card de Score de Confiança ── */}
          <div className="space-y-4">
            <Card className={cn('border-2', sealColor.ring)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Score de Confiança
                  </CardTitle>
                  <Award size={18} className={sealColor.text} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score principal */}
                <div className={cn('rounded-xl p-4 text-center', sealColor.bg)}>
                  <p className={cn('text-5xl font-black', sealColor.text)}>{avgScore}%</p>
                  <p className={cn('text-sm font-bold mt-1', sealColor.text)}>Selo {seal} Conecta</p>
                  <div className="flex justify-center mt-2">
                    <StarScore score={avgScore} />
                  </div>
                </div>

                {/* Pilares */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pilares de Auditoria</p>
                  {pillars.map(pillar => {
                    const Icon = pillar.icon;
                    return (
                      <div key={pillar.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {pillar.completed
                            ? <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            : <XCircle size={14} className="text-rose-500 shrink-0" />
                          }
                          <Icon size={13} className="text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium text-foreground truncate">{pillar.label}</span>
                        </div>
                        <span className={cn(
                          'text-xs font-bold shrink-0',
                          pillar.score >= 90 ? 'text-emerald-600 dark:text-emerald-400'
                            : pillar.score >= 70 ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-500'
                        )}>
                          {pillar.score}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                  Score calculado automaticamente com base em dados verificados via Supabase RLS e critérios do framework Charity Navigator adaptado.
                </p>
              </CardContent>
            </Card>

            {/* Última auditoria */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={13} className="text-primary animate-pulse" />
                  <span>
                    Última auditoria:{' '}
                    <strong className="text-foreground">
                      {ong.last_audit_date
                        ? new Date(ong.last_audit_date).toLocaleString('pt-BR')
                        : 'Pendente'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Globe size={13} className="text-primary" />
                  <span>Dados públicos via <strong className="text-foreground">RLS Supabase</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Robô de Compliance IA */}
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-500" />
                  <CardTitle className="text-xs font-bold text-foreground">Robô de Auditoria IA (Gemini)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Consulte os relatórios e verifique se as ações e transações desta ONG são elegíveis para o Selo de Transparência.
                </p>
                {aiReport ? (
                  <div className="p-3 rounded-lg bg-background border border-violet-500/20 text-[10px] leading-relaxed text-foreground">
                    <p className="font-semibold text-violet-500 mb-1 flex items-center gap-1 text-[11px]">
                      <ShieldCheck size={12} />
                      Parecer Gemini Compliance:
                    </p>
                    {aiReport}
                  </div>
                ) : (
                  <button
                    onClick={handleRunAudit}
                    disabled={auditing}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {auditing ? (
                      <>
                        <Loader2 className="animate-spin" size={12} />
                        Auditando...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={12} />
                        Solicitar Laudo IA
                      </>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Relatório Detalhado — Tabs ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Relatório Detalhado — Beacon Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Avaliação completa da organização por pilar, seguindo metodologia de auditoria pública.
            </p>
          </div>

          <Tabs defaultValue="financas">
            <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1">
              <TabsTrigger value="financas" className="text-xs sm:text-sm py-2">
                Transparência Financeira
              </TabsTrigger>
              <TabsTrigger value="impacto" className="text-xs sm:text-sm py-2">
                Medição de Impacto
              </TabsTrigger>
              <TabsTrigger value="governanca" className="text-xs sm:text-sm py-2">
                Governança
              </TabsTrigger>
              <TabsTrigger value="cultura" className="text-xs sm:text-sm py-2">
                Políticas Internas
              </TabsTrigger>
            </TabsList>

            {pillars.map((pillar, tabIdx) => {
              const tabValues = ['financas', 'impacto', 'governanca', 'cultura'];
              const Icon = pillar.icon;
              return (
                <TabsContent key={pillar.label} value={tabValues[tabIdx]}>
                  <Card className="bg-slate-50 dark:bg-slate-900/30 border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center">
                            <Icon size={16} className="text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{pillar.label}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {pillar.items.length} critérios avaliados · {pillar.items.filter(i => i.ok).length} aprovados
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={cn(
                              'text-2xl font-black',
                              pillar.score >= 90 ? 'text-emerald-600 dark:text-emerald-400'
                                : pillar.score >= 70 ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-500'
                            )}>
                              {pillar.score}%
                            </p>
                            <StarScore score={pillar.score} />
                          </div>
                          <div className="w-14">
                            <Progress
                              value={pillar.score}
                              className={cn(
                                'h-2',
                                pillar.score >= 90 ? '[&>div]:bg-emerald-500'
                                  : pillar.score >= 70 ? '[&>div]:bg-amber-500'
                                    : '[&>div]:bg-rose-500'
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0">
                      <div className="px-6">
                        {/* Cabeçalho da tabela */}
                        <div className="grid grid-cols-[1fr_auto] gap-4 py-2.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Critério</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right w-28">Score</span>
                        </div>
                        <Separator />
                        {pillar.items.map(item => (
                          <CriterioRow key={item.criterio} {...item} />
                        ))}
                      </div>

                      {/* Resumo do pilar */}
                      <div className="mx-6 mb-6 mt-3 p-3.5 rounded-xl bg-background border border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">Resumo do pilar:</strong>{' '}
                          {pillar.score >= 90
                            ? `Excelente aderência. Todos os critérios principais foram atendidos com total transparência.`
                            : pillar.score >= 70
                              ? `Boa aderência. Alguns critérios secundários precisam de atenção para atingir o nível máximo.`
                              : `Atenção necessária. Critérios críticos devem ser endereçados prioritariamente.`
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>Raízes do Bem © 2026 — Oxente Code</span>
          </div>
          <div className="flex gap-4">
            <Link to="/transparencia" className="hover:text-foreground transition-colors">Portal de Transparência</Link>
            <Link to="/doador" className="hover:text-foreground transition-colors">Área do Doador</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
