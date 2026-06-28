import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Search,
  Heart,
  Clock,
  Activity,
  Mail,
  Frown,
  Meh,
  Smile,
  Laugh,
  MessageSquareHeart,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

interface VolunteerList {
  id: string;
  nome: string;
  email: string;
  totalHoras: number;
  totalAcoes: number;
  ultimoHumor: {
    score: number;
    checked_at: string;
  } | null;
}

const moodMeta: Record<number, { label: string; icon: any; color: string; bg: string }> = {
  1: { label: 'Exausto', icon: Frown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  2: { label: 'Cansado', icon: Meh, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  3: { label: 'Bem', icon: Smile, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  4: { label: 'Animado', icon: Laugh, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  5: { label: 'Incrível', icon: Heart, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
};

export default function VoluntariosPage() {
  const { sessao } = useAuth();
  const [volunteers, setVolunteers] = useState<VolunteerList[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'nome' | 'horas' | 'acoes'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Gestão de Voluntários — Raízes do Bem';
    if (sessao) {
      void loadVolunteers();
    }
  }, [sessao]);

  const loadVolunteers = async () => {
    if (!sessao) return;
    setLoading(true);
    try {
      // 1. Buscar perfis de voluntários associados a esta ONG
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('tipo_usuario', 'voluntario')
        .eq('ong_id', sessao.id);

      if (!profiles || profiles.length === 0) {
        setVolunteers([]);
        return;
      }

      const volunteerIds = profiles.map(p => p.id);

      // 2. Buscar e somar horas/ações
      const { data: actions } = await supabase
        .from('volunteer_actions')
        .select('user_id, horas')
        .in('user_id', volunteerIds);

      const hoursMap: Record<string, number> = {};
      const actionsCountMap: Record<string, number> = {};
      
      volunteerIds.forEach(id => {
        hoursMap[id] = 0;
        actionsCountMap[id] = 0;
      });

      actions?.forEach(a => {
        hoursMap[a.user_id] += Number(a.horas);
        actionsCountMap[a.user_id]++;
      });

      // 3. Buscar os check-ins emocionais para obter o último de cada voluntário
      const { data: checkins } = await supabase
        .from('emotion_checkins')
        .select('user_id, score, checked_at')
        .in('user_id', volunteerIds)
        .order('checked_at', { ascending: false });

      // Agrupa para pegar o mais recente por user_id
      const latestCheckinMap = new Map<string, { score: number; checked_at: string }>();
      checkins?.forEach(c => {
        if (!latestCheckinMap.has(c.user_id)) {
          latestCheckinMap.set(c.user_id, { score: c.score, checked_at: c.checked_at });
        }
      });

      // 4. Montar lista de voluntários (mocking email since auth table reads require admin schemas in Supabase client)
      const list: VolunteerList[] = profiles.map(p => ({
        id: p.id,
        nome: p.nome,
        email: `${p.nome.toLowerCase().replace(/\s+/g, '.')}@conecta.org`,
        totalHoras: hoursMap[p.id],
        totalAcoes: actionsCountMap[p.id],
        ultimoHumor: latestCheckinMap.get(p.id) ?? null
      }));

      setVolunteers(list);
    } catch (err) {
      console.error('Erro ao carregar lista de voluntários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = (name: string) => {
    setSupportSuccess(`Notificação de suporte emocional e agradecimento enviada para ${name.split(' ')[0]}!`);
    setTimeout(() => setSupportSuccess(null), 4000);
  };

  const toggleSort = (field: 'nome' | 'horas' | 'acoes') => {
    if (sortBy === field) {
      setSortOrder(p => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to high-to-low for stats
    }
  };

  // Filtrar e Ordenar
  const filteredVolunteers = volunteers
    .filter(v => v.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let valA: any = a.nome;
      let valB: any = b.nome;
      
      if (sortBy === 'horas') {
        valA = a.totalHoras;
        valB = b.totalHoras;
      } else if (sortBy === 'acoes') {
        valA = a.totalAcoes;
        valB = b.totalAcoes;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Gestão de Voluntários
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe o engajamento individual, horas acumuladas e bem-estar da sua equipe de campo.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
          <Users size={14} />
          <span>{volunteers.length} Voluntários Cadastrados</span>
        </div>
      </div>

      {/* Alerta de Ação Bem-sucedida */}
      {supportSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <MessageSquareHeart size={16} className="animate-bounce" />
          <span>{supportSuccess}</span>
        </div>
      )}

      {/* Controles de busca e ordenação */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-card/40 border border-border/40 p-4 rounded-2xl">
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar voluntário pelo nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto justify-end">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mr-2 shrink-0">Ordenar por</span>
          <button
            onClick={() => toggleSort('nome')}
            className={cn(
              "px-3 py-2 rounded-xl border text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all",
              sortBy === 'nome' ? "bg-violet-500/10 border-violet-500 text-violet-400" : "bg-muted/30 border-border/20 text-muted-foreground hover:border-border/40"
            )}
          >
            Nome
            <ArrowUpDown size={10} />
          </button>
          <button
            onClick={() => toggleSort('horas')}
            className={cn(
              "px-3 py-2 rounded-xl border text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all",
              sortBy === 'horas' ? "bg-violet-500/10 border-violet-500 text-violet-400" : "bg-muted/30 border-border/20 text-muted-foreground hover:border-border/40"
            )}
          >
            Horas doadas
            <ArrowUpDown size={10} />
          </button>
          <button
            onClick={() => toggleSort('acoes')}
            className={cn(
              "px-3 py-2 rounded-xl border text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all",
              sortBy === 'acoes' ? "bg-violet-500/10 border-violet-500 text-violet-400" : "bg-muted/30 border-border/20 text-muted-foreground hover:border-border/40"
            )}
          >
            Ações
            <ArrowUpDown size={10} />
          </button>
        </div>
      </div>

      {/* Grid de Voluntários */}
      {filteredVolunteers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVolunteers.map((vol) => {
            const isExhausted = vol.ultimoHumor !== null && vol.ultimoHumor.score <= 2;
            const mood = vol.ultimoHumor ? moodMeta[vol.ultimoHumor.score] : null;
            const MoodIcon = mood ? mood.icon : null;

            return (
              <div
                key={vol.id}
                className={cn(
                  "rounded-2xl border bg-card/30 backdrop-blur-sm p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg",
                  isExhausted ? "border-red-500/30 shadow-red-500/5 hover:border-red-500/50" : "border-border/40 hover:border-border/80"
                )}
              >
                <div className="space-y-3">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-base shrink-0">
                        {vol.nome[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground leading-tight truncate">{vol.nome}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Mail size={10} className="shrink-0" />
                          <span className="truncate">{vol.email}</span>
                        </div>
                      </div>
                    </div>

                    {isExhausted && (
                      <div className="text-red-400 bg-red-500/10 p-1 border border-red-500/25 rounded-lg animate-pulse" title="Risco de Burnout Detectado">
                        <ShieldAlert size={14} />
                      </div>
                    )}
                  </div>

                  {/* Humor do Voluntário (Termômetro) */}
                  <div className="pt-2 border-t border-border/10 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Humor Recente</span>
                    {mood && MoodIcon ? (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${mood.bg} ${mood.color}`}>
                        <MoodIcon size={12} className="shrink-0" />
                        <span>{mood.label}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60 italic">Sem check-in recente</span>
                    )}
                  </div>

                  {/* Estatísticas Individuais */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/10">
                    <div className="bg-background/40 p-2 border border-border/15 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                        <Activity size={10} />
                        <span className="text-[9px] uppercase font-semibold">Ações</span>
                      </div>
                      <p className="text-sm font-extrabold text-foreground">{vol.totalAcoes}</p>
                    </div>
                    <div className="bg-background/40 p-2 border border-border/15 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-400 mb-0.5">
                        <Clock size={10} />
                        <span className="text-[9px] uppercase font-semibold">Horas</span>
                      </div>
                      <p className="text-sm font-extrabold text-foreground">{vol.totalHoras.toFixed(1)}h</p>
                    </div>
                  </div>
                </div>

                {/* Ação de Apoio */}
                <button
                  onClick={() => handleSupport(vol.nome)}
                  className={cn(
                    "w-full py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5",
                    isExhausted
                      ? "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600"
                      : "bg-muted text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <MessageSquareHeart size={12} />
                  <span>{isExhausted ? 'Oferecer Apoio Crítico' : 'Dar Feedback Positivo'}</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-border/50 rounded-3xl bg-card/10">
          <Users size={48} className="mx-auto mb-2 opacity-20 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">Nenhum voluntário encontrado.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Experimente ajustar o termo de busca.</p>
        </div>
      )}

    </div>
  );
}
