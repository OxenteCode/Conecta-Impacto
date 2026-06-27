import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import {
  Frown,
  Meh,
  Smile,
  Laugh,
  Heart,
  Calendar,
  ShieldCheck,
  Activity,
  HeartHandshake
} from 'lucide-react';

interface EmotionRecord {
  id: string;
  score: number;
  checked_at: string;
  created_at: string;
}

const emotions = [
  { score: 1, label: 'Exausto', icon: Frown, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20 hover:bg-red-400/20', tip: 'Entendemos que o trabalho voluntário é intenso. Lembre-se de respirar e que está tudo bem dar uma pausa para recarregar. Seu bem-estar importa!' },
  { score: 2, label: 'Cansado', icon: Meh, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20 hover:bg-orange-400/20', tip: 'O cansaço físico faz parte da jornada. Tente descansar um pouco hoje e evite sobrecarregar suas escalas de atuação.' },
  { score: 3, label: 'Bem', icon: Smile, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20 hover:bg-yellow-400/20', tip: 'Que bom que você está bem! Continue com seu ritmo equilibrado e espalhando boas ações.' },
  { score: 4, label: 'Animado', icon: Laugh, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20', tip: 'Seu entusiasmo é contagiante! Aproveite essa energia positiva para motivar outros voluntários em campo hoje.' },
  { score: 5, label: 'Incrível', icon: Heart, color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20 hover:bg-teal-400/20', tip: 'Fantástico! Você está no auge do seu bem-estar. Obrigado por ser essa força de transformação tão ativa.' },
];

export default function BemEstarPage() {
  const { sessao } = useAuth();
  
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  
  const [history, setHistory] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Meu Bem-Estar — Conecta Impacto';
    if (!sessao) return;

    // Verificar localStorage primeiro para agilizar UI
    const hoje = new Date().toISOString().slice(0, 10);
    const ultimoCheckin = localStorage.getItem(`checkin_${sessao.id}`);
    const scoreCheckin = localStorage.getItem(`checkin_score_${sessao.id}`);
    
    if (ultimoCheckin === hoje) {
      setHasCheckedInToday(true);
      if (scoreCheckin) {
        setSelectedEmotion(parseInt(scoreCheckin));
      }
    }

    void loadCheckinHistory();
  }, [sessao]);

  const loadCheckinHistory = async () => {
    if (!sessao) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('emotion_checkins')
        .select('id, score, checked_at, created_at')
        .eq('user_id', sessao.id)
        .order('checked_at', { ascending: false });

      if (data) {
        setHistory(data as EmotionRecord[]);
        
        // Sincronizar estado diário real com o banco
        const hoje = new Date().toISOString().slice(0, 10);
        const checkinHoje = data.find(c => c.checked_at === hoje);
        if (checkinHoje) {
          setHasCheckedInToday(true);
          setSelectedEmotion(checkinHoje.score);
          localStorage.setItem(`checkin_${sessao.id}`, hoje);
          localStorage.setItem(`checkin_score_${sessao.id}`, checkinHoje.score.toString());
        }
      }
    } catch (err) {
      console.error('Erro ao carregar histórico de bem-estar:', err);
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
      void loadCheckinHistory();
    } catch (err) {
      console.error('Erro ao realizar check-in emocional:', err);
    } finally {
      setCheckingIn(false);
    }
  };

  const activeEmotionDetails = emotions.find(e => e.score === selectedEmotion);

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Cuidado e Bem-Estar
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          A saúde mental de quem apoia é nossa prioridade absoluta. Registre suas emoções diariamente.
        </p>
      </div>

      {/* Check-in Card (Pilar A) */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-rose-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Como está se sentindo hoje?</h2>
        </div>

        {hasCheckedInToday ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                {(() => {
                  const Icon = activeEmotionDetails?.icon ?? Smile;
                  return <Icon size={28} className="animate-pulse" />;
                })()}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-emerald-400">Check-in Concluído!</p>
                <p className="text-xs text-foreground">
                  Você está se sentindo <strong>{activeEmotionDetails?.label}</strong>.
                </p>
              </div>
            </div>

            {/* Tip Card */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/30 flex gap-3">
              <div className="text-amber-400 shrink-0 mt-0.5">
                <HeartHandshake size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-foreground">Conselho de Acolhimento</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activeEmotionDetails?.tip}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Selecione uma opção abaixo para registrar seu estado e ajudar a ONG a acompanhar a saúde coletiva da equipe de forma agregada:
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

      {/* Histórico Emocional */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-violet-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Meu Histórico Emocional</h2>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Carregando histórico...
            </div>
          ) : history.length > 0 ? (
            history.map((record) => {
              const emotion = emotions.find(e => e.score === record.score);
              const Icon = emotion?.icon ?? Smile;
              return (
                <div key={record.id} className="p-3 rounded-2xl border border-border/30 bg-background/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-1.5 rounded-xl bg-background/60 border border-border/40', emotion?.color)}>
                      <Icon size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">{emotion?.label ?? 'Indefinido'}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(record.checked_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                    <ShieldCheck size={10} />
                    <span>Seguro</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">
              Nenhum check-in emocional registrado ainda. Comece hoje mesmo!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
