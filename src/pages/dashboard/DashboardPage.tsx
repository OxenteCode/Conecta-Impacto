import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { getTopDonors, type TopDonor } from '@/services/donationService';
import {
  Users, Clock, Activity, Heart, TrendingUp, AlertTriangle,
  ShieldCheck, Award, Info, FileDown, Loader2, Building2,
  Trophy, FlaskConical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashMetrics {
  voluntariosAtivos: number;
  horasAcumuladas: number;
  totalAcoes: number;
  mediaEmocional: number | null;
}
interface EmotionPoint { checked_at: string; avg: number }
interface RecentAction {
  id: string; descricao: string; horas: number;
  impacto: string | null; ods_number: number;
  created_at: string; profile: { nome: string } | null;
}
interface OdsDataItem { name: string; horas: number; acoes: number; fill: string }
interface EmotionBarItem { label: string; count: number; fill: string; pct: number }

// ── Color palette ─────────────────────────────────────────────────────────────
const ODS_COLORS: Record<number, string> = {
  3: '#10b981', 9: '#3b82f6', 10: '#f43f5e', 16: '#8b5cf6', 17: '#f59e0b',
};
const EMOTION_COLORS = ['#f87171', '#fb923c', '#facc15', '#34d399', '#2dd4bf'];

// ── Custom Recharts Tooltip ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-card-lg text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill ?? p.stroke }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
          {p.dataKey === 'horas' || p.dataKey === 'avg' ? 'h' : ''}
        </p>
      ))}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { sessao } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState<DashMetrics>({
    voluntariosAtivos: 0, horasAcumuladas: 0, totalAcoes: 0, mediaEmocional: null,
  });
  const [emotionHistory, setEmotionHistory] = useState<EmotionPoint[]>([]);
  const [recentActions, setRecentActions]   = useState<RecentAction[]>([]);
  const [odsData, setOdsData]               = useState<OdsDataItem[]>([]);
  const [emotionBarData, setEmotionBarData] = useState<EmotionBarItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [exporting, setExporting]           = useState(false);
  const [sponsors, setSponsors]             = useState<any[]>([]);

  // ── Ranking de doadores ────────────────────────────────────────────────────
  const [donorRanking, setDonorRanking]         = useState<TopDonor[]>([]);
  const [donorRankingIsReal, setDonorRankingIsReal] = useState<boolean | null>(null);
  const [loadingDonors, setLoadingDonors]       = useState(true);

  useEffect(() => {
    document.title = `Dashboard — ${sessao?.ongName ?? 'Raízes do Bem'}`;
    void loadDashboard();
  }, [sessao]);

  // ── PDF via window.print() ────────────────────────────────────────────────
  const handleExportPDF = async () => {
    setExporting(true);
    // Pequeno delay para o state de "Gerando…" aparecer antes do diálogo
    await new Promise(r => setTimeout(r, 120));
    window.print();
    setExporting(false);
  };

  // ── Carrega ranking de doadores ─────────────────────────────────────────
  useEffect(() => {
    void (async () => {
      setLoadingDonors(true);
      const result = await getTopDonors(5);
      setDonorRanking(result.data);
      setDonorRankingIsReal(result.isReal);
      setLoadingDonors(false);
    })();
  }, [sessao]);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadDashboard = async () => {
    if (!sessao) return;
    setLoading(true);
    try {
      /* 1 ── Ações voluntárias */
      const { data: actionsData } = await supabase
        .from('volunteer_actions')
        .select('id, descricao, horas, impacto, ods_number, created_at, user_id, ong_id')
        .eq('ong_id', sessao.id)
        .order('created_at', { ascending: false });

      let mappedActions: RecentAction[] = [];
      if (actionsData?.length) {
        const userIds = [...new Set(actionsData.map(a => a.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles').select('id, nome').in('id', userIds);
        const profileMap = new Map(profilesData?.map(p => [p.id, p.nome]) ?? []);

        mappedActions = actionsData.map(a => ({
          id: a.id, descricao: a.descricao, horas: Number(a.horas),
          impacto: a.impacto, ods_number: Number(a.ods_number ?? 10),
          created_at: a.created_at,
          profile: profileMap.has(a.user_id) ? { nome: profileMap.get(a.user_id)! } : null,
        }));

        /* ODS aggregation */
        const mapH: Record<number, number> = { 3: 0, 9: 0, 10: 0, 16: 0, 17: 0 };
        const mapA: Record<number, number> = { 3: 0, 9: 0, 10: 0, 16: 0, 17: 0 };
        const ongActionsCount: Record<string, number> = {};
        
        actionsData.forEach(a => {
          const o = Number(a.ods_number ?? 10);
          if (o in mapH) { mapH[o] += Number(a.horas); mapA[o]++; }
          
          if (a.ong_id) {
            ongActionsCount[a.ong_id] = (ongActionsCount[a.ong_id] || 0) + 1;
          }
        });
        
        setOdsData([
          { name: 'ODS 3',  horas: mapH[3],  acoes: mapA[3],  fill: ODS_COLORS[3]  },
          { name: 'ODS 9',  horas: mapH[9],  acoes: mapA[9],  fill: ODS_COLORS[9]  },
          { name: 'ODS 10', horas: mapH[10], acoes: mapA[10], fill: ODS_COLORS[10] },
          { name: 'ODS 16', horas: mapH[16], acoes: mapA[16], fill: ODS_COLORS[16] },
          { name: 'ODS 17', horas: mapH[17], acoes: mapA[17], fill: ODS_COLORS[17] },
        ]);

        /* Parceiros/ONGs Ranking */
        const ongIds = Object.keys(ongActionsCount);
        if (ongIds.length > 0) {
          const { data: ongsData } = await supabase.from('profiles').select('id, ong_name').in('id', ongIds);
          const realSponsors = (ongsData || []).map(ong => {
            const name = ong.ong_name || 'Instituição Anônima';
            return {
              nome: name,
              sigla: name.substring(0, 2).toUpperCase(),
              ods: 'Múltiplos ODS',
              engajamento: ongActionsCount[ong.id] || 0
            };
          }).sort((a, b) => b.engajamento - a.engajamento).slice(0, 3);
          setSponsors(realSponsors);
        } else {
          setSponsors([]);
        }
      }

      setRecentActions(mappedActions.slice(0, 5));
      const uniqueVol   = new Set(actionsData?.map(a => a.user_id) ?? []);
      const totalHoras  = actionsData?.reduce((s, a) => s + Number(a.horas), 0) ?? 0;

      /* 2 ── Check-ins emocionais */
      const { data: checkins } = await supabase
        .from('emotion_checkins')
        .select('score, checked_at')
        .eq('ong_id', sessao.id);

      let mediaEmocional: number | null = null;
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (checkins?.length) {
        mediaEmocional = checkins.reduce((s, c) => s + c.score, 0) / checkins.length;
        checkins.forEach(c => { if (c.score >= 1 && c.score <= 5) dist[c.score]++; });
      }

      const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
      setEmotionBarData([
        { label: 'Incrível', count: dist[5], fill: EMOTION_COLORS[4], pct: (dist[5] / total) * 100 },
        { label: 'Animado',  count: dist[4], fill: EMOTION_COLORS[3], pct: (dist[4] / total) * 100 },
        { label: 'Bem',      count: dist[3], fill: EMOTION_COLORS[2], pct: (dist[3] / total) * 100 },
        { label: 'Cansado',  count: dist[2], fill: EMOTION_COLORS[1], pct: (dist[2] / total) * 100 },
        { label: 'Exausto',  count: dist[1], fill: EMOTION_COLORS[0], pct: (dist[1] / total) * 100 },
      ]);

      /* Histórico diário */
      const grouped: Record<string, number[]> = {};
      checkins?.forEach(c => {
        if (!grouped[c.checked_at]) grouped[c.checked_at] = [];
        grouped[c.checked_at].push(c.score);
      });
      setEmotionHistory(
        Object.entries(grouped)
          .map(([date, scores]) => ({ checked_at: date, avg: scores.reduce((a, b) => a + b) / scores.length }))
          .sort((a, b) => a.checked_at.localeCompare(b.checked_at))
      );

      setMetrics({ voluntariosAtivos: uniqueVol.size, horasAcumuladas: totalHoras, totalAcoes: actionsData?.length ?? 0, mediaEmocional });
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasAlert = metrics.mediaEmocional !== null && metrics.mediaEmocional < 3.5;

  /* Dados radial para gauge do humor */
  const radialData = metrics.mediaEmocional !== null
    ? [{ name: 'Saúde', value: (metrics.mediaEmocional / 5) * 100, fill: hasAlert ? '#f43f5e' : '#10b981' }]
    : [];

  const metricCards = [
    { label: 'Voluntários',     value: metrics.voluntariosAtivos,           icon: Users,     iconBg: 'bg-violet-600',  trend: '+4 este mês' },
    { label: 'Horas Totais',    value: `${metrics.horasAcumuladas.toFixed(0)}h`, icon: Clock, iconBg: 'bg-blue-600', trend: 'Acumulado' },
    { label: 'Ações de Campo',  value: metrics.totalAcoes,                  icon: Activity,  iconBg: 'bg-emerald-600', trend: 'Verificadas via RLS' },
    { label: 'Saúde Emocional', value: metrics.mediaEmocional !== null ? `${metrics.mediaEmocional.toFixed(1)} / 5` : '—',
      icon: Heart, iconBg: hasAlert ? 'bg-rose-600' : 'bg-teal-600', trend: hasAlert ? '⚠ Atenção necessária' : 'Equipe saudável' },
  ];

  return (
    <>
      {/* ── @media print styles inlined via <style> ────────────────────────── */}
      <style>{`
        @media print {
          /* Esconde tudo e mostra apenas a área de relatório */
          body * { visibility: hidden !important; }
          #dashboard-report, #dashboard-report * { visibility: visible !important; }
          #dashboard-report {
            position: absolute !important;
            inset: 0 !important;
            padding: 24px !important;
          }
          /* Força cores de fundo para impressão */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Oculta elementos não relevantes */
          .no-print { display: none !important; }
          /* Evita quebra de page no meio de cards */
          .print-avoid-break { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>

      <div id="dashboard-report" ref={reportRef} className="max-w-7xl mx-auto px-4 py-8 space-y-7 animate-in fade-in duration-500">

        {/* ── Header com botão de PDF ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Painel Geral de Impacto
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {sessao?.ongName ?? 'Raízes do Bem'} · Análise ESG em tempo real
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Badge live */}
            <div className="flex items-center gap-2 text-xs border border-border bg-card px-3 py-2 rounded-lg text-muted-foreground shadow-card">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              RLS Ativo · {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>

            {/* Botão Gerar PDF */}
            <button
              onClick={handleExportPDF}
              disabled={exporting || loading}
              className={cn(
                'no-print flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                exporting || loading
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-card-hover'
              )}
            >
              {exporting
                ? <><Loader2 size={15} className="animate-spin" /> Gerando PDF…</>
                : <><FileDown size={15} /> Exportar PDF</>
              }
            </button>
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map(({ label, value, icon: Icon, iconBg, trend }) => (
            <div key={label} className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
                  <Icon size={15} className="text-white" />
                </div>
              </div>
              {loading
                ? <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                : <p className="text-2xl font-bold text-foreground">{value}</p>
              }
              <p className="text-[11px] text-muted-foreground">{trend}</p>
            </div>
          ))}
        </div>

        {/* ── Alerta de Burnout ────────────────────────────────────────────── */}
        {hasAlert && (
          <div className="print-avoid-break rounded-xl border border-rose-500/30 bg-rose-500/8 p-5 flex flex-col md:flex-row items-start md:items-center gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="p-2.5 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/25 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-rose-600 dark:text-rose-400">Alerta de Saúde Emocional</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                O Índice de Saúde Organizacional caiu para{' '}
                <strong className="text-rose-500">{metrics.mediaEmocional?.toFixed(1)} / 5.0</strong>.
                Scores abaixo de 3.5 indicam exaustão acumulada. Recomenda-se sessão de acolhimento.
              </p>
            </div>
            <button
              className="no-print w-full md:w-auto px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
              onClick={() => alert('Notificação de suporte enviada para voluntários.')}
            >
              Oferecer Suporte
            </button>
          </div>
        )}

        {/* ── Grid principal ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Coluna 2/3: Gráficos ESG + Ações Recentes ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gráfico de barras — Horas por ODS */}
            <div className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Métricas ESG — Horas por ODS</h2>
                </div>
                <span className="text-[10px] font-semibold text-primary border border-primary/25 bg-primary/6 px-2 py-0.5 rounded-md">
                  Impacto ODS / ONU
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Horas dedicadas por voluntários a cada Objetivo de Desenvolvimento Sustentável.
              </p>

              {loading ? (
                <div className="h-52 bg-muted/40 rounded-xl animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={odsData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--color-muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--color-muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--color-muted))', opacity: 0.5 }} />
                    <Bar dataKey="horas" name="Horas" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {odsData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Legenda ODS inline */}
              {!loading && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-border">
                  {odsData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.fill }} />
                      {d.name} · {d.horas.toFixed(0)}h · {d.acoes} ações
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gráfico de linha — Evolução Emocional */}
            <div className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                <h2 className="font-semibold text-foreground">Evolução do Bem-Estar Coletivo</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Média diária dos check-ins emocionais — detecta tendências de exaustão preventivamente.
              </p>

              {loading ? (
                <div className="h-44 bg-muted/40 rounded-xl animate-pulse" />
              ) : emotionHistory.length < 2 ? (
                <div className="h-44 flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground text-xs gap-2">
                  <Heart size={24} className="opacity-20" />
                  Dados insuficientes para gerar o gráfico de linha.
                  <span className="opacity-60">Mínimo: 2 datas distintas de check-in.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={emotionHistory} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" opacity={0.5} />
                    <XAxis
                      dataKey="checked_at"
                      tick={{ fontSize: 10, fill: 'hsl(var(--color-muted-foreground))' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: 'hsl(var(--color-muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    {/* Linha de alerta em 3.5 */}
                    <ReferenceLine y={3.5} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Limite', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                    <Line
                      type="monotone" dataKey="avg" name="Média"
                      stroke="#10b981" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981', stroke: 'hsl(var(--color-card))', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Log de Ações Recentes */}
            <div className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <h2 className="font-semibold text-foreground">Rastreador de Ações (RLS Auditável)</h2>
                </div>
                <span className="text-[10px] font-semibold flex items-center gap-1 bg-primary/6 border border-primary/20 text-primary px-2 py-0.5 rounded-md">
                  <ShieldCheck size={10} /> Selo Anti-Greenwashing
                </span>
              </div>

              <div className="space-y-2.5">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />)
                ) : recentActions.length > 0 ? (
                  recentActions.map(action => (
                    <div key={action.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:border-border/80 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                        {(action.profile?.nome ?? 'V')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{action.profile?.nome ?? 'Voluntário'}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(action.created_at).toLocaleDateString('pt-BR')}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: `${ODS_COLORS[action.ods_number]}18`, color: ODS_COLORS[action.ods_number] }}>
                            ODS {action.ods_number}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 truncate">{action.descricao}</p>
                        {action.impacto && <p className="text-[10px] text-primary font-medium">{action.impacto}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{action.horas.toFixed(1)}h</p>
                        <ShieldCheck size={12} className="text-primary ml-auto mt-0.5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center border border-dashed border-border rounded-xl">
                    <Activity size={28} className="mx-auto mb-2 text-muted-foreground opacity-20" />
                    <p className="text-xs text-muted-foreground">Nenhuma ação registrada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Coluna 1/3: Gauge + Distribuição + Parceiros ── */}
          <div className="space-y-6">

            {/* ── Ranking de Top Doadores ─────────────────────────────────── */}
            <div className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={15} className="text-amber-500" />
                  <h3 className="font-semibold text-foreground text-sm">Top Doadores</h3>
                </div>

                {/* Badge: dados reais ou mock */}
                {donorRankingIsReal !== null && (
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                    donorRankingIsReal
                      ? 'bg-primary/6 border-primary/20 text-primary'
                      : 'bg-amber-50 border-amber-300/50 text-amber-700 dark:bg-amber-900/15 dark:border-amber-700/30 dark:text-amber-400'
                  )}>
                    {donorRankingIsReal ? '● Dados reais' : '◌ Dados de demonstração'}
                  </span>
                )}
              </div>

              {/* Aviso de mock */}
              {!donorRankingIsReal && donorRankingIsReal !== null && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/25 text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  <FlaskConical size={11} className="shrink-0 mt-0.5" />
                  <span>
                    A tabela <code className="bg-amber-100 dark:bg-amber-900/30 px-0.5 rounded font-mono">donations</code> está vazia
                    ou inacessível. Dados de demonstração estão sendo exibidos.
                    Execute a migration <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-0.5 rounded">20260627000003_fix_donations_ranking_policy.sql</code> para habilitar a leitura pública.
                  </span>
                </div>
              )}

              {loadingDonors ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 bg-muted/40 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : donorRanking.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border rounded-xl">
                  <Trophy size={24} className="mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p className="text-xs text-muted-foreground">Nenhum doador registrado.</p>
                </div>
              ) : (
                <>
                  {/* Top 3 em destaque */}
                  <div className="flex items-end justify-center gap-2 pt-1 pb-3">
                    {/* Monta a ordem: 2º | 1º | 3º */}
                    {([donorRanking[1], donorRanking[0], donorRanking[2]] as (TopDonor | undefined)[]).map((donor, i) => {
                      if (!donor) return null;
                      const podiumMeta = [
                        { medal: '🥈', height: 52, bg: 'bg-slate-300/20 dark:bg-slate-600/20', label: '2º' },
                        { medal: '🥇', height: 76, bg: 'bg-amber-400/15',                       label: '1º' },
                        { medal: '🥉', height: 38, bg: 'bg-amber-700/15',                       label: '3º' },
                      ][i];
                      return (
                        <div key={donor.rank} className="flex flex-col items-center flex-1 min-w-0">
                          <span className="text-base mb-0.5">{podiumMeta.medal}</span>
                          <span className="text-[10px] font-bold text-foreground text-center truncate w-full px-0.5 leading-tight">
                            {donor.doador_nome.split(' ')[0]}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            R$ {donor.total.toLocaleString('pt-BR')}
                          </span>
                          <div
                            className={cn('w-full rounded-t-lg mt-1 flex items-center justify-center', podiumMeta.bg)}
                            style={{ height: podiumMeta.height }}
                          >
                            <span className="text-xs font-black text-muted-foreground">{podiumMeta.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Lista completa com barras de progresso relativas */}
                  <div className="space-y-2.5 border-t border-border pt-3">
                    {donorRanking.map(donor => {
                      const maxTotal = donorRanking[0]?.total ?? 1;
                      const barPct   = (donor.total / maxTotal) * 100;
                      const rankMedal = donor.rank === 1 ? '🥇' : donor.rank === 2 ? '🥈' : donor.rank === 3 ? '🥉' : null;

                      return (
                        <div key={donor.rank} className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {rankMedal
                                ? <span className="text-sm shrink-0">{rankMedal}</span>
                                : <span className="text-[10px] font-bold text-muted-foreground w-4 text-center shrink-0">#{donor.rank}</span>
                              }
                              <span className="text-xs font-medium text-foreground truncate">{donor.doador_nome}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-right">
                              <span className="text-[10px] text-muted-foreground">{donor.count}x</span>
                              <span className="text-xs font-bold text-foreground">
                                R$ {donor.total.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 dark:bg-amber-500 transition-all duration-700"
                              style={{ width: `${barPct.toFixed(1)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>


            {/* Gauge de Saúde Organizacional */}
            <div className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Heart size={15} className="text-rose-500" />
                <h3 className="font-semibold text-foreground text-sm">Índice de Saúde Org.</h3>
              </div>

              {loading ? (
                <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
              ) : metrics.mediaEmocional !== null ? (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <RadialBarChart
                      innerRadius="62%" outerRadius="90%"
                      data={radialData} startAngle={220} endAngle={-40}
                    >
                      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'hsl(var(--color-muted))' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-4">
                    <p className={cn('text-2xl font-bold', hasAlert ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400')}>
                      {metrics.mediaEmocional.toFixed(1)}
                      <span className="text-sm font-medium text-muted-foreground"> / 5</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hasAlert ? 'Atenção necessária' : 'Equipe saudável'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                  Sem check-ins registrados.
                </div>
              )}
            </div>

            {/* Distribuição Emocional */}
            <div className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-muted-foreground" />
                <h3 className="font-semibold text-foreground text-sm">Distribuição Emocional</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Frequência de estados emocionais nos check-ins da equipe.
              </p>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-7 bg-muted/40 rounded animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {emotionBarData.map(item => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${item.pct.toFixed(1)}%`, background: item.fill }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[10px] text-muted-foreground leading-relaxed">
                <Info size={12} className="shrink-0 mt-0.5 text-primary" />
                Check-ins anônimos e agregados. Individualmente, nenhum dado é identificável.
              </div>
            </div>

            {/* Pódio de Parceiros */}
            <div className="print-avoid-break rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Award size={15} className="text-amber-500" />
                <h3 className="font-semibold text-foreground text-sm">Ranking de Parceiros</h3>
              </div>
              <p className="text-xs text-muted-foreground">Engajamento institucional com ações de impacto.</p>

              {sponsors.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border rounded-xl mt-4">
                  <Award size={24} className="mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p className="text-xs text-muted-foreground">Nenhum parceiro registrado.</p>
                </div>
              ) : (
                <>
                  {/* Podium visual simplificado */}
                  <div className="flex items-end justify-center gap-2 pt-2 pb-1">
                    {([sponsors[1], sponsors[0], sponsors[2]] as (any | undefined)[]).map((sp, i) => {
                      if (!sp) return null;
                      const heights = [56, 80, 40];
                      const medals  = ['🥈', '🥇', '🥉'];
                      const bgColors = [
                        'bg-slate-300/20 dark:bg-slate-600/20',
                        'bg-amber-400/20',
                        'bg-amber-700/20'
                      ];
                      return (
                        <div key={sp.nome} className="flex flex-col items-center flex-1">
                          <span className="text-base mb-1">{medals[i]}</span>
                          <span className="text-[10px] font-bold text-center truncate w-full text-foreground px-1">{sp.sigla}</span>
                          <div
                            className={cn('w-full rounded-t-lg flex items-center justify-center mt-1', bgColors[i])}
                            style={{ height: heights[i] }}
                          >
                            <span className="text-xs font-black text-muted-foreground">{i === 1 ? '1º' : i === 0 ? '2º' : '3º'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Lista detalhada */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    {sponsors.map((sp, idx) => (
                      <div key={sp.nome} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                          <Building2 size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{sp.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{sp.ods} · {sp.engajamento} ações</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ── Rodapé do relatório (visível no PDF) ─────────────────────────── */}
        <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Raízes do Bem · {sessao?.ongName ?? 'Relatório Institucional'}</span>
          <span>Gerado em {new Date().toLocaleString('pt-BR')}</span>
        </div>

      </div>
    </>
  );
}
