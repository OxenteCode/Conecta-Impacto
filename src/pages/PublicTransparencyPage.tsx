import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  Globe, Building2, MapPin, Search, Clock, Users, Activity,
  Star, TrendingUp, ShieldCheck, SlidersHorizontal, Award,
  Heart, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Logo } from '@/components/shared/Logo';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface OngCard {
  id: string;
  nome: string;
  ong_name: string;
  cidade: string;
  area_atuacao: string;
  porte: string;
  totalHoras: number;
  totalAcoes: number;
  totalVoluntarios: number;
  score: number;
  seal: 'Ouro' | 'Prata' | 'Bronze';
  ods_tags: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcScore(horas: number, acoes: number, vol: number): number {
  const h = Math.min(100, (horas / 100) * 40);
  const a = Math.min(100, (acoes / 20)  * 30);
  const v = Math.min(100, (vol  / 10)   * 30);
  return Math.round(h + a + v);
}

function getSeal(score: number): 'Ouro' | 'Prata' | 'Bronze' {
  if (score >= 70) return 'Ouro';
  if (score >= 40) return 'Prata';
  return 'Bronze';
}

function StarScore({ score, size = 13 }: { score: number; size?: number }) {
  const stars = Math.round((score / 100) * 4);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <Star key={i} size={size}
          className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'} />
      ))}
    </div>
  );
}

const sealMeta = {
  Ouro:   { text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-300 dark:border-amber-700/40' },
  Prata:  { text: 'text-slate-500 dark:text-slate-400',   bg: 'bg-slate-50 dark:bg-slate-800/20',   border: 'border-slate-300 dark:border-slate-700/40' },
  Bronze: { text: 'text-amber-800 dark:text-amber-600',   bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-amber-600/30 dark:border-amber-800/30' },
};

// ── ONG Card ──────────────────────────────────────────────────────────────────
function OngCardItem({ ong }: { ong: OngCard }) {
  const meta = sealMeta[ong.seal];

  return (
    <Card className="group flex flex-col h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Ícone da ONG */}
          <div className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
            <Building2 size={18} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                {ong.ong_name}
              </h3>
              <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full border shrink-0 text-[10px] font-bold', meta.bg, meta.border, meta.text)}>
                <Award size={10} />
                {ong.seal}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPin size={11} />
              <span>{ong.cidade}</span>
            </div>
          </div>
        </div>

        {/* Badges de categoria */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-[10px] h-5">{ong.porte}</Badge>
          <Badge variant="outline" className="text-[10px] h-5">{ong.area_atuacao}</Badge>
          {ong.ods_tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] h-5 border-primary/30 text-primary bg-primary/4">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {/* Descrição */}
      <CardContent className="flex-1 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          Organização dedicada à gestão de voluntariado estruturado no Rio Grande do Norte,
          com ações verificadas e auditadas pela plataforma Raízes do Bem.
        </p>

        {/* Mini métricas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { value: `${ong.totalHoras.toFixed(0)}h`, label: 'horas', icon: Clock },
            { value: ong.totalAcoes,                   label: 'ações', icon: Activity },
            { value: ong.totalVoluntarios,              label: 'vol.', icon: Users },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-lg bg-muted/50 p-2">
              <p className="text-sm font-bold text-foreground">{value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <Separator />

      {/* Footer: Score de Transparência */}
      <CardFooter className="pt-3 pb-4 flex-col items-start gap-2">
        <div className="flex items-center justify-between w-full">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Score de Transparência</p>
            <div className="flex items-center gap-2">
              <span className={cn('text-base font-black', meta.text)}>{ong.score}%</span>
              <StarScore score={ong.score} />
            </div>
          </div>
          <Link
            to={`/transparencia/ong/${ong.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Ver perfil
            <ChevronRight size={12} />
          </Link>
        </div>
        <Progress
          value={ong.score}
          className={cn(
            'h-1.5 w-full',
            ong.seal === 'Ouro'   ? '[&>div]:bg-amber-400' :
            ong.seal === 'Prata'  ? '[&>div]:bg-slate-400' :
                                    '[&>div]:bg-amber-700'
          )}
        />
      </CardFooter>
    </Card>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function PublicTransparencyPage() {
  const [ongs, setOngs]             = useState<OngCard[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterSeal, setFilterSeal] = useState<'Todos' | 'Ouro' | 'Prata' | 'Bronze'>('Todos');
  const [sortBy, setSortBy]         = useState<'score' | 'horas' | 'acoes'>('score');
  const [globalStats, setGlobalStats] = useState({ horas: 0, acoes: 0, vol: 0, ongs: 0 });

  useEffect(() => {
    document.title = 'Portal de Transparência — Raízes do Bem';
    void loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1. Busca todas as ONGs
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, ong_name, created_at, cidade, area_atuacao')
        .eq('tipo_usuario', 'ong');

      if (!profiles?.length) { setLoading(false); return; }

      // 2. Ações voluntárias
      const { data: actions } = await supabase
        .from('volunteer_actions')
        .select('ong_id, horas, user_id, ods_number');

      // 3. Agrupa por ONG
      const aggMap = new Map<string, { horas: number; acoes: number; vols: Set<string>; ods: Set<string> }>();
      actions?.forEach(a => {
        const ongId = a.ong_id ?? 'unknown';
        if (!aggMap.has(ongId)) aggMap.set(ongId, { horas: 0, acoes: 0, vols: new Set(), ods: new Set() });
        const entry = aggMap.get(ongId)!;
        entry.horas += Number(a.horas);
        entry.acoes += 1;
        entry.vols.add(a.user_id);
        if (a.ods_number) entry.ods.add(`ODS ${a.ods_number}`);
      });

      // Totais globais
      let gH = 0, gA = 0, gV = new Set<string>();
      aggMap.forEach(({ horas, acoes, vols }) => { gH += horas; gA += acoes; vols.forEach(v => gV.add(v)); });
      setGlobalStats({ horas: gH, acoes: gA, vol: gV.size, ongs: profiles.length });

      const ODS_DEFAULTS = ['ODS 3', 'ODS 10', 'ODS 17'];
      const mapped: OngCard[] = profiles.map(p => {
        const agg      = aggMap.get(p.id) ?? { horas: 0, acoes: 0, vols: new Set<string>(), ods: new Set<string>() };
        const score    = calcScore(agg.horas, agg.acoes, agg.vols.size);
        const seal     = getSeal(score);
        const vol      = agg.vols.size;
        return {
          id: p.id,
          nome: p.nome,
          ong_name: p.ong_name ?? p.nome,
          cidade: p.cidade || 'Natal, RN',
          area_atuacao: p.area_atuacao || 'Assistência Social',
          porte: vol >= 20 ? 'Grande Porte' : vol >= 5 ? 'Médio Porte' : 'Pequeno Porte',
          totalHoras: agg.horas,
          totalAcoes: agg.acoes,
          totalVoluntarios: vol,
          score,
          seal,
          ods_tags: agg.ods.size ? [...agg.ods].slice(0, 3) : ODS_DEFAULTS,
        };
      });

      setOngs(mapped);
    } catch (err) {
      console.error('Erro ao carregar ONGs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return ongs
      .filter(o => {
        const matchSearch = !search || o.ong_name.toLowerCase().includes(search.toLowerCase());
        const matchSeal   = filterSeal === 'Todos' || o.seal === filterSeal;
        return matchSearch && matchSeal;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'horas') return b.totalHoras - a.totalHoras;
        return b.totalAcoes - a.totalAcoes;
      });
  }, [ongs, search, filterSeal, sortBy]);

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse rounded-lg bg-muted', className)} />
  );

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-bold text-sm text-foreground">Raízes do Bem</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Acessar plataforma
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="border-b border-border bg-slate-50 dark:bg-slate-900/30 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/6 text-primary text-xs font-semibold mb-4">
                <ShieldCheck size={12} />
                Dados auditados em tempo real · RLS Supabase
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">
                Portal de Transparência
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pesquise ONGs verificadas do Rio Grande do Norte, avalie seus scores de transparência
                e tome decisões de apoio baseadas em dados reais.
              </p>
            </div>

            {/* Global stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              {[
                { label: 'ONGs verificadas', value: globalStats.ongs, icon: Building2 },
                { label: 'Horas de impacto', value: `${globalStats.horas.toFixed(0)}h`, icon: Clock },
                { label: 'Ações validadas', value: globalStats.acoes, icon: Activity },
                { label: 'Voluntários',      value: globalStats.vol,  icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-background border border-border rounded-xl px-3 py-2.5 text-center shadow-sm">
                  <Icon size={14} className="text-primary mx-auto mb-1" />
                  <p className="text-base font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Filtros e Busca ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Busca */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome da ONG..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Filtro Selo */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-card">
            {(['Todos', 'Ouro', 'Prata', 'Bronze'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterSeal(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  filterSeal === s
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2 border border-border bg-card rounded-xl px-3 py-2">
            <SlidersHorizontal size={13} className="text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs text-foreground bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="score">Ordenar: Score</option>
              <option value="horas">Ordenar: Horas</option>
              <option value="acoes">Ordenar: Ações</option>
            </select>
          </div>
        </div>

        {/* ── Legenda de Selos ── */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pb-1">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <TrendingUp size={13} className="text-primary" />
            Sistema de avaliação:
          </span>
          {(Object.entries(sealMeta) as [string, typeof sealMeta.Ouro][]).map(([seal, m]) => (
            <span key={seal} className={cn('flex items-center gap-1.5 font-semibold', m.text)}>
              <Award size={12} />
              {seal} ≥ {seal === 'Ouro' ? '70%' : seal === 'Prata' ? '40%' : '0%'}
            </span>
          ))}
        </div>

        {/* ── Grid de ONGs ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl">
            <Building2 size={36} className="mx-auto mb-3 text-muted-foreground opacity-20" />
            <p className="text-sm font-medium text-muted-foreground">
              {ongs.length === 0
                ? 'Nenhuma ONG cadastrada ainda. Registre sua organização!'
                : `Nenhuma ONG encontrada para "${search}".`}
            </p>
            {ongs.length === 0 && (
              <Link
                to="/cadastro"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Cadastrar ONG
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'organização encontrada' : 'organizações encontradas'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(ong => <OngCardItem key={ong.id} ong={ong} />)}
            </div>
          </>
        )}

        {/* ── Banner CTA ── */}
        <div className="rounded-2xl border border-primary/20 bg-primary/4 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Heart size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Sua ONG ainda não está aqui?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cadastre sua organização e comece a construir transparência com dados verificáveis.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/cadastro"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Cadastrar ONG
            </Link>
            <Link
              to="/doador"
              className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Área do Doador
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4 mt-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>Raízes do Bem © 2026 — Oxente Code</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <CheckCircle2 size={11} className="text-primary" />
            <span>Dados auditados via RLS · Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
