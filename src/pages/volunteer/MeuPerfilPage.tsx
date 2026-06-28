import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Frown,
  Meh,
  Smile,
  Laugh,
  Heart,
  Plus,
  Clock,
  Sparkles,
  Award,
  Bookmark,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface UserAction {
  id: string;
  descricao: string;
  horas: number;
  impacto: string | null;
  ods_number: number;
  created_at: string;
}

const emotions = [
  { score: 1, label: 'Exausto', icon: Frown, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  { score: 2, label: 'Cansado', icon: Meh, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  { score: 3, label: 'Bem', icon: Smile, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  { score: 4, label: 'Animado', icon: Laugh, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
  { score: 5, label: 'Incrível', icon: Heart, color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/30' },
];

export default function MeuPerfilPage() {
  const { sessao } = useAuth();
  
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  
  const [totalHoras, setTotalHoras] = useState(0);
  const [totalAcoes, setTotalAcoes] = useState(0);
  const [recentHistory, setRecentHistory] = useState<UserAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Meu Portal — Raízes do Bem';
    if (!sessao) return;

    // Verificar se o check-in emocional já foi feito hoje
    const hoje = new Date().toISOString().slice(0, 10);
    const ultimoCheckin = localStorage.getItem(`checkin_${sessao.id}`);
    const scoreCheckin = localStorage.getItem(`checkin_score_${sessao.id}`);
    
    if (ultimoCheckin === hoje) {
      setHasCheckedInToday(true);
      if (scoreCheckin) {
        setSelectedEmotion(parseInt(scoreCheckin));
      }
    }

    void loadStatsAndHistory();
  }, [sessao]);

  const loadStatsAndHistory = async () => {
    if (!sessao) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('volunteer_actions')
        .select('id, descricao, horas, impacto, ods_number, created_at')
        .eq('user_id', sessao.id)
        .order('created_at', { ascending: false });

      if (data) {
        const mapped: UserAction[] = data.map(a => ({
          id: a.id,
          descricao: a.descricao,
          horas: Number(a.horas),
          impacto: a.impacto,
          ods_number: Number(a.ods_number ?? 10),
          created_at: a.created_at
        }));
        setRecentHistory(mapped.slice(0, 2)); // Mostra apenas as 2 mais recentes no dashboard
        setTotalAcoes(mapped.length);
        setTotalHoras(mapped.reduce((acc, a) => acc + Number(a.horas), 0));
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionCheckIn = async (score: number) => {
    if (!sessao || hasCheckedInToday) return;
    setCheckingIn(true);
    try {
      const hoje = new Date().toISOString().slice(0, 10);
      await supabase.from('emotion_checkins').insert({
        user_id: sessao.id,
        score: score,
        checked_at: hoje,
      });

      localStorage.setItem(`checkin_${sessao.id}`, hoje);
      localStorage.setItem(`checkin_score_${sessao.id}`, score.toString());
      
      setSelectedEmotion(score);
      setHasCheckedInToday(true);
    } catch (err) {
      console.error('Erro ao realizar check-in emocional:', err);
    } finally {
      setCheckingIn(false);
    }
  };

  const insignias = [
    { label: 'Semente Social', emoji: '🌱', unlocked: totalAcoes >= 1, desc: 'Registrou 1 ação' },
    { label: 'Farol do Bem', emoji: '⏰', unlocked: totalHoras >= 10, desc: 'Doou mais de 10h' },
    { label: 'Cuidado Diário', emoji: '💚', unlocked: hasCheckedInToday, desc: 'Fez check-in hoje' },
    { label: 'Herói Potiguar', emoji: '🚀', unlocked: totalAcoes >= 5, desc: 'Registrou 5 ações' },
  ];

  const currentDayText = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 rounded-3xl">
        <div className="space-y-1">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {currentDayText}
          </span>
          <h1 className="text-xl font-extrabold text-foreground">
            Olá, {sessao?.nome?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-muted-foreground">
            Obrigado por apoiar a comunidade hoje.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20 shrink-0">
          {sessao?.nome?.[0]?.toUpperCase() ?? 'V'}
        </div>
      </div>

      {/* Stats Row (Links para ações e bem-estar) */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/meu-perfil/acoes" className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-center block group">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
            <Bookmark size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Minhas Ações</span>
          </div>
          <p className="text-2xl font-black text-foreground">{totalAcoes}</p>
          <span className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver todas <ArrowRight size={8} />
          </span>
        </Link>
        <Link to="/meu-perfil/bem-estar" className="p-4 rounded-2xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 transition-all text-center block group">
          <div className="flex items-center justify-center gap-1.5 text-teal-400 mb-1">
            <Clock size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Minhas Horas</span>
          </div>
          <p className="text-2xl font-black text-foreground">{totalHoras.toFixed(1)}h</p>
          <span className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Bem-estar <ArrowRight size={8} />
          </span>
        </Link>
      </div>

      {/* Pilar A: Check-in Emocional Integrado */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Como você está hoje?</h2>
          </div>
          <Link to="/meu-perfil/bem-estar" className="text-[10px] font-bold text-teal-400 hover:underline">
            Histórico →
          </Link>
        </div>

        {hasCheckedInToday ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              {(() => {
                const emotion = emotions.find(e => e.score === selectedEmotion);
                const Icon = emotion?.icon ?? Smile;
                return <Icon size={28} className="animate-pulse" />;
              })()}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-emerald-400">Check-in Concluído!</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sentindo-se <strong>{emotions.find(e => e.score === selectedEmotion)?.label}</strong>. Parabéns por tirar um tempo para si!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Selecione o estado emocional para registrar seu check-in diário:
            </p>
            <div className="flex justify-between gap-1.5">
              {emotions.map((emotion) => {
                const Icon = emotion.icon;
                return (
                  <button
                    key={emotion.score}
                    disabled={checkingIn}
                    onClick={() => void handleEmotionCheckIn(emotion.score)}
                    className={cn(
                      'flex-1 py-3 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-1 bg-muted/30 border-border/40 hover:border-border hover:scale-105 active:scale-95'
                    )}
                    title={emotion.label}
                  >
                    <Icon size={20} className={emotion.color} />
                    <span className="text-[9px] font-medium text-muted-foreground mt-0.5">{emotion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pilar A: Gamificação Carinhosa */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-amber-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Minhas Conquistas</h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {insignias.map(({ label, emoji, unlocked, desc }) => (
            <div
              key={label}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border text-center transition-all duration-300',
                unlocked 
                  ? 'border-amber-500/30 bg-amber-500/5' 
                  : 'border-border/40 opacity-30 grayscale'
              )}
            >
              <span className={cn('text-3xl', unlocked && 'animate-pulse')}>{emoji}</span>
              <p className="text-[11px] font-bold leading-tight text-foreground">{label}</p>
              <p className="text-[9px] text-muted-foreground leading-none mt-0.5">{desc}</p>
              {unlocked && (
                <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest mt-1">
                  Ativo
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recentes & Atalho Rápido */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Ações Recentes</h2>
          </div>
          <Link to="/meu-perfil/acoes" className="text-[10px] font-bold text-violet-400 hover:underline flex items-center gap-0.5">
            Ver todas <Plus size={10} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {loading ? (
            <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
              Carregando histórico...
            </div>
          ) : recentHistory.length > 0 ? (
            recentHistory.map((act) => (
              <div key={act.id} className="p-3 rounded-2xl border border-border/30 bg-background/40 flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-foreground leading-tight">{act.descricao}</span>
                  <span className="text-xs font-black text-emerald-400 shrink-0">{act.horas.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-muted-foreground mt-1">
                  <span>{new Date(act.created_at).toLocaleDateString()}</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-md font-bold text-[8px]">
                    ODS {act.ods_number}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl flex flex-col gap-3 items-center">
              <span>Nenhuma ação registrada recentemente.</span>
              <Link to="/meu-perfil/acoes" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl text-[10px] shadow-md shadow-emerald-500/10">
                Registrar Primeira Ação
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
