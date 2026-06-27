import React, { useState } from 'react';
import { useImpactForest, getTierDetails, type ForestTier, type DonationCommit } from '@/hooks/useImpactForest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Leaf, Sprout, TreePine, TreeDeciduous, Trophy, Gem, Loader2, AlertCircle, ShieldCheck, HeartHandshake, PackageOpen, CheckCircle2, X } from 'lucide-react';

interface ImpactForestProps {
  companyId: string;
}

const tierVisuals: Record<ForestTier, { icon: React.ElementType, color: string, bg: string }> = {
  'Semente da Esperança': { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  'Broto Sustentável': { icon: Sprout, color: 'text-green-600', bg: 'bg-green-100' },
  'Árvore Jovem': { icon: TreePine, color: 'text-teal-600', bg: 'bg-teal-100' },
  'Carvalho Guardião': { icon: TreeDeciduous, color: 'text-emerald-700', bg: 'bg-emerald-200' },
  'Ecossistema de Ouro': { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  'Floresta Diamante': { icon: Gem, color: 'text-cyan-400', bg: 'bg-cyan-100' },
};

// Helper to determine the color intensity of the "commit" square based on donation amount
const getCommitColor = (amount: number, isSuffering: boolean) => {
  if (amount === 0) return 'bg-slate-100 dark:bg-slate-800';
  
  if (isSuffering) {
    // If churning, the trees look somewhat dry/yellowish
    if (amount < 100) return 'bg-yellow-200/50';
    if (amount < 300) return 'bg-yellow-300/60';
    if (amount < 500) return 'bg-amber-400/70';
    return 'bg-amber-500/80';
  }

  // Healthy green forest
  if (amount < 100) return 'bg-emerald-200 dark:bg-emerald-900/40';
  if (amount < 300) return 'bg-emerald-400 dark:bg-emerald-700/60';
  if (amount < 500) return 'bg-emerald-600 dark:bg-emerald-500/80';
  return 'bg-emerald-800 dark:bg-emerald-400';
};

export function ImpactForest({ companyId }: ImpactForestProps) {
  const { totalDonated, level, tierName, nextTierThreshold, progress, loading, error, commits, isSuffering, daysSinceLastDonation } = useImpactForest(companyId);
  const [selectedCommit, setSelectedCommit] = useState<DonationCommit | null>(null);

  if (loading) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-2 p-6 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  const Visual = tierVisuals[tierName];
  const Icon = Visual.icon;

  // Group commits by week for the GitHub style grid
  const weeks: DonationCommit[][] = [];
  let currentWeek: DonationCommit[] = [];
  commits.forEach((commit, i) => {
    currentWeek.push(commit);
    if (currentWeek.length === 7 || i === commits.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <>
      <Card className={`w-full overflow-hidden shadow-xl border-t-4 transition-all duration-700 ${isSuffering ? 'border-t-amber-400 shadow-amber-900/5' : 'border-t-emerald-500 shadow-emerald-900/5'}`}>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Bosque do Impacto
                {isSuffering && <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" title="Risco de Churn" />}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                A constância do seu impacto transforma vidas. Cada doação é uma semente plantada.
              </CardDescription>
            </div>
            
            <div className={`px-4 py-2 rounded-xl border flex flex-col items-end ${isSuffering ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-100'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isSuffering ? 'text-amber-700' : 'text-emerald-700'}`}>
                Nível {level}
              </span>
              <span className={`font-semibold ${isSuffering ? 'text-amber-900' : 'text-emerald-900'}`}>
                {tierName}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Main Info Area */}
          <div className="flex flex-col md:flex-row items-center gap-8 py-6 mb-8 relative">
            {/* Visual Avatar */}
            <div className={`relative w-36 h-36 rounded-3xl ${isSuffering ? 'bg-amber-100' : Visual.bg} flex items-center justify-center shadow-inner shrink-0 transition-all duration-500 hover:scale-105 rotate-3 hover:rotate-0`}>
              <Icon size={72} className={`${isSuffering ? 'text-amber-500 opacity-80' : Visual.color} drop-shadow-md`} strokeWidth={1.5} />
              
              {isSuffering && (
                <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">
                  +30 dias sem doar
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 w-full space-y-5">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${isSuffering ? 'text-amber-600' : 'text-emerald-600'}`}>
                  Volume Total Semeado
                </p>
                <p className="text-4xl font-black text-slate-800 dark:text-slate-100">
                  R$ {totalDonated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {nextTierThreshold ? (
                <div className="space-y-2 max-w-md">
                  <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span>Evolução da Floresta</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className={`h-3 ${isSuffering ? 'bg-amber-100 [&>div]:bg-amber-400' : 'bg-slate-100 [&>div]:bg-emerald-500'}`} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Faltam <strong className={isSuffering ? 'text-amber-600' : 'text-emerald-600'}>R$ {(nextTierThreshold - totalDonated).toLocaleString('pt-BR')}</strong> para expandir seu bioma para <strong className="text-slate-700 dark:text-slate-300">{getTierDetails(nextTierThreshold).name}</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-100 rounded-xl border border-amber-200 text-amber-800 text-sm font-medium shadow-sm">
                  <span className="text-lg mr-2">🌟</span> Parabéns! Sua empresa atingiu o ápice do impacto sustentável.
                </div>
              )}
            </div>
          </div>

          {/* GitHub Style Commit Grid */}
          <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Histórico de Impacto (Último ano)
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Menos</span>
                <div className="flex gap-1">
                  <div className={`w-3 h-3 rounded-sm ${getCommitColor(0, isSuffering)}`} />
                  <div className={`w-3 h-3 rounded-sm ${getCommitColor(50, isSuffering)}`} />
                  <div className={`w-3 h-3 rounded-sm ${getCommitColor(200, isSuffering)}`} />
                  <div className={`w-3 h-3 rounded-sm ${getCommitColor(400, isSuffering)}`} />
                  <div className={`w-3 h-3 rounded-sm ${getCommitColor(800, isSuffering)}`} />
                </div>
                <span>Mais</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex gap-1 min-w-max">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((commit, dayIdx) => (
                      <button
                        key={`${weekIdx}-${dayIdx}`}
                        title={`${new Date(commit.date).toLocaleDateString('pt-BR')}: ${commit.amount > 0 ? `R$ ${commit.amount} em ${commit.count} ações` : 'Nenhuma doação'}`}
                        onClick={() => commit.amount > 0 && setSelectedCommit(commit)}
                        disabled={commit.amount === 0}
                        className={`w-[14px] h-[14px] rounded-[3px] transition-all hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400 hover:z-10 focus:outline-none ${getCommitColor(commit.amount, isSuffering)} ${commit.amount > 0 ? 'cursor-pointer shadow-sm' : 'cursor-default'}`}
                        aria-label={`Doação de R$ ${commit.amount} no dia ${commit.date}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traceability Receipt Modal */}
      {selectedCommit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-emerald-600 text-white relative">
              <button 
                onClick={() => setSelectedCommit(null)}
                className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-emerald-200" />
                <h2 className="text-xl font-bold tracking-tight">Nota Fiscal Social</h2>
              </div>
              <p className="text-emerald-100 text-sm">
                Rastreabilidade de ponta a ponta (Ledger imutável)
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Data do Aporte</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedCommit.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Valor Auditado</p>
                  <p className="text-2xl font-black text-emerald-600">
                    R$ {selectedCommit.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Desdobramento da Ação</h4>
                
                {/* Mocked steps for the specific commit to show traceability in action */}
                <div className="relative flex items-start gap-4 before:absolute before:left-4 before:top-8 before:bottom-[-16px] before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-slate-950">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recurso Recebido</p>
                    <p className="text-xs text-slate-500 mt-0.5">Assinado digitalmente às 09:15 pelo Smart Contract</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 before:absolute before:left-4 before:top-8 before:bottom-[-16px] before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-slate-950">
                    <PackageOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Conversão em Insumos</p>
                    <p className="text-xs text-slate-500 mt-0.5">Alocado para compra de cestas básicas (ONG Valida)</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-slate-950">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Entrega Realizada (Timestamp)</p>
                    <p className="text-xs text-slate-500 mt-0.5 mb-2">Check-in do voluntário às 14:30 na comunidade.</p>
                    
                    {/* Simulated Proof Image */}
                    <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-slate-700">
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold px-3 py-1 bg-black/50 rounded-full backdrop-blur-md">Ver Evidência Criptográfica</span>
                      </div>
                      <img src="https://images.unsplash.com/photo-1593113514088-348e35183424?q=80&w=600&auto=format&fit=crop" alt="Prova da entrega" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full" variant="outline" onClick={() => setSelectedCommit(null)}>
                  Fechar Extrato
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

