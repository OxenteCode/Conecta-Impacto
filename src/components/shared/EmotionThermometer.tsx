import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Frown, Meh, Smile, Laugh, Heart } from 'lucide-react';

interface EmotionThermometerProps {
  /** Chamado após registro bem-sucedido do check-in */
  onComplete: () => void;
}

const emotions = [
  { score: 1, label: 'Exausto', icon: Frown, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30 hover:bg-red-400/20' },
  { score: 2, label: 'Cansado', icon: Meh, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30 hover:bg-orange-400/20' },
  { score: 3, label: 'Bem', icon: Smile, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30 hover:bg-yellow-400/20' },
  { score: 4, label: 'Animado', icon: Laugh, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30 hover:bg-emerald-400/20' },
  { score: 5, label: 'Incrível', icon: Heart, color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/30 hover:bg-teal-400/20' },
];

/**
 * Modal bloqueante de check-in emocional (Termômetro de Emoções).
 * Exibido uma vez por dia para cada voluntário.
 * O score é gravado na tabela `emotion_checkins` de forma anônima/agregada.
 */
export function EmotionThermometer({ onComplete }: EmotionThermometerProps) {
  const { sessao } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected || !sessao) return;
    setLoading(true);

    await supabase.from('emotion_checkins').insert({
      user_id: sessao.id,
      score: selected,
      checked_at: new Date().toISOString().slice(0, 10),
    });

    // Salva a data do check-in no localStorage para não exibir novamente hoje
    localStorage.setItem(`checkin_${sessao.id}`, new Date().toISOString().slice(0, 10));

    setLoading(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
            <Heart size={26} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Como você está hoje?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Seu bem-estar importa para nós. Selecione como está se sentindo agora.
          </p>
        </div>

        {/* Emotion cards */}
        <div className="flex flex-col gap-2 mb-6">
          {emotions.map(({ score, label, icon: Icon, color, bg }) => (
            <button
              key={score}
              onClick={() => setSelected(score)}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-200 text-left',
                bg,
                selected === score
                  ? 'ring-2 ring-offset-1 ring-offset-card scale-[1.02]'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <Icon size={24} className={color} />
              <div>
                <p className={cn('text-sm font-semibold', color)}>{label}</p>
                <p className="text-xs text-muted-foreground">Nível {score} de 5</p>
              </div>
              {selected === score && (
                <div className={cn('ml-auto w-2 h-2 rounded-full', color.replace('text-', 'bg-'))} />
              )}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          disabled={!selected || loading}
          onClick={handleSubmit}
          className={cn(
            'w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200',
            selected && !loading
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {loading ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}
