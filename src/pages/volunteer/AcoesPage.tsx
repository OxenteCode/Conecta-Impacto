import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import {
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Camera,
} from 'lucide-react';
import CheckInCamera from '@/components/shared/CheckInCamera';

interface ActionForm {
  descricao: string;
  horas: string;
  impacto: string;
}

interface UserAction {
  id: string;
  descricao: string;
  horas: number;
  impacto: string | null;
  ods_number: number;
  created_at: string;
}

export default function AcoesPage() {
  const { sessao } = useAuth();
  
  const [actionForm, setActionForm] = useState<ActionForm>({ descricao: '', horas: '', impacto: '' });
  const [selectedOds, setSelectedOds] = useState<number>(10); // Default ODS 10 - Desigualdade
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  
  const [totalHoras, setTotalHoras] = useState(0);
  const [totalAcoes, setTotalAcoes] = useState(0);
  const [history, setHistory] = useState<UserAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [ongId, setOngId] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    document.title = 'Minhas Ações — Raízes do Bem';
    void loadStatsAndHistory();
  }, [sessao]);

  const loadStatsAndHistory = async () => {
    if (!sessao) return;
    setLoading(true);
    try {
      // Carrega associação da ONG do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('ong_id')
        .eq('id', sessao.id)
        .single();
      
      if (profile?.ong_id) {
        setOngId(profile.ong_id);
      }

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
        setHistory(mapped);
        setTotalAcoes(mapped.length);
        setTotalHoras(mapped.reduce((acc, a) => acc + Number(a.horas), 0));
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessao) return;
    setSubmittingAction(true);
    try {
      await supabase.from('volunteer_actions').insert({
        user_id: sessao.id,
        descricao: actionForm.descricao,
        horas: parseFloat(actionForm.horas),
        impacto: actionForm.impacto || null,
        ods_number: selectedOds,
        ong_id: ongId
      });

      setActionForm({ descricao: '', horas: '', impacto: '' });
      setActionSuccess('Sua ação foi registrada com sucesso no Supabase!');
      void loadStatsAndHistory();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Erro ao registrar ação:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-500">
      
      {/* â”€â”€ Check-in em Campo â”€â”€ */}
      {showCheckIn ? (
        <CheckInCamera
          onSuccess={() => {
            setTimeout(() => setShowCheckIn(false), 2200);
          }}
          onClose={() => setShowCheckIn(false)}
        />
      ) : (
        <button
          onClick={() => setShowCheckIn(true)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/8 to-teal-500/8 hover:from-emerald-500/15 hover:to-teal-500/15 hover:border-emerald-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Camera size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground leading-tight">Check-in em Campo</p>
              <p className="text-[10px] text-muted-foreground">Foto + carimbo auditÃ¡vel â†’ Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
            <ShieldCheck size={13} />
            <span>Abrir</span>
          </div>
        </button>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Ações Solidárias
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Cadastre suas atividades em campo e alimente os relatórios ESG em tempo real.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
            <Bookmark size={14} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Ações</span>
          </div>
          <p className="text-2xl font-black text-foreground">{totalAcoes}</p>
        </div>
        <div className="p-4 rounded-2xl border border-teal-500/20 bg-teal-500/5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-teal-400 mb-1">
            <Clock size={14} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Horas</span>
          </div>
          <p className="text-2xl font-black text-foreground">{totalHoras.toFixed(1)}h</p>
        </div>
      </div>

      {/* Cadastro de Ação Form */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-emerald-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Registrar Nova Ação</h2>
        </div>

        <form onSubmit={handleActionSubmit} className="space-y-4">
          
          {/* ODS Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Objetivo ODS Apoiado</label>
            <div className="flex flex-wrap gap-1">
              {[
                { value: 3, label: 'ODS 3: Saúde' },
                { value: 9, label: 'ODS 9: Infra' },
                { value: 10, label: 'ODS 10: Desigualdade' },
                { value: 16, label: 'ODS 16: Eficácia' },
                { value: 17, label: 'ODS 17: Parcerias' }
              ].map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSelectedOds(item.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl border text-[9px] font-bold transition-all duration-200",
                    selectedOds === item.value
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                      : "bg-muted/20 border-border/20 text-muted-foreground hover:border-border/40"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label htmlFor="acoes-desc" className="text-[10px] uppercase font-bold text-muted-foreground">O que você realizou?</label>
            <input
              id="acoes-desc"
              type="text"
              required
              value={actionForm.descricao}
              onChange={e => setActionForm(p => ({ ...p, descricao: e.target.value }))}
              placeholder="Ex: Doação de cobertores para moradores de rua"
              className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Horas e Impacto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="acoes-horas" className="text-[10px] uppercase font-bold text-muted-foreground">Tempo (Horas)</label>
              <input
                id="acoes-horas"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                required
                value={actionForm.horas}
                onChange={e => setActionForm(p => ({ ...p, horas: e.target.value }))}
                placeholder="Ex: 3.5"
                className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="acoes-impacto" className="text-[10px] uppercase font-bold text-muted-foreground">Impacto (Entregas)</label>
              <input
                id="acoes-impacto"
                type="text"
                value={actionForm.impacto}
                onChange={e => setActionForm(p => ({ ...p, impacto: e.target.value }))}
                placeholder="Ex: 20 cobertores"
                className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {actionSuccess && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] animate-in fade-in duration-300">
              <CheckCircle2 size={12} className="shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submittingAction}
            className={cn(
              'w-full py-3.5 rounded-2xl font-bold text-xs transition-all duration-200',
              submittingAction
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.01]'
            )}
          >
            {submittingAction ? 'Salvando...' : 'Registrar Ação'}
          </button>
        </form>
      </div>

      {/* Histórico de Ações */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Histórico de Ações</h2>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Carregando histórico...
            </div>
          ) : history.length > 0 ? (
            history.map((act) => (
              <div key={act.id} className="p-4 rounded-2xl border border-border/30 bg-background/40 hover:border-border/60 transition-all flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-foreground leading-tight">{act.descricao}</span>
                  <span className="text-xs font-black text-emerald-400 shrink-0">{act.horas.toFixed(1)}h</span>
                </div>
                {act.impacto && (
                  <p className="text-[10px] text-emerald-400 font-medium">Impacto: {act.impacto}</p>
                )}
                <div className="flex justify-between items-center text-[9px] text-muted-foreground mt-2">
                  <div className="flex items-center gap-2">
                    <span>{new Date(act.created_at).toLocaleDateString()}</span>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-md font-bold text-[8px]">
                      ODS {act.ods_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck size={10} />
                    <span>Incorruptível RLS</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">
              Nenhuma ação cadastrada. Comece preenchendo o formulário acima!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
