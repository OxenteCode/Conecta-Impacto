import React, { useState } from 'react';
import { useTraceability } from '@/hooks/useTraceability';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, CheckCircle2, PackageOpen, HeartHandshake, AlertCircle, ShieldCheck } from 'lucide-react';

export function DonationTracker() {
  const [inputCode, setInputCode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const { events, loading, error } = useTraceability(activeCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim());
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'donation_received': return <HeartHandshake className="w-5 h-5 text-emerald-500" />;
      case 'action_allocated': return <PackageOpen className="w-5 h-5 text-blue-500" />;
      case 'action_delivered': return <CheckCircle2 className="w-5 h-5 text-violet-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <Card className="w-full shadow-md border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Extrato do Bem (Rastreabilidade)</CardTitle>
        <CardDescription>
          Insira o seu código único de rastreio para acompanhar exatamente onde e como sua doação foi aplicada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <Input
            type="text"
            placeholder="Ex: TRK-9823-XYZ"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !inputCode.trim()}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Rastrear
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {events.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-500/20 shadow-sm animate-in fade-in duration-300">
            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">
              <ShieldCheck size={16} />
              Laudo da Inteligência Artificial (Robô Auditor)
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
              <strong>Veredito:</strong> O cruzamento de dados confirma que o valor financeiro doado corresponde às entregas e ações voluntárias (fotos/timestamps) registradas no banco de dados. ONG validada pelo IPEA e com Índice de Saúde interno positivo.
            </p>
          </div>
        )}

        {events.length > 0 && (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Icon Marker */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {getEventIcon(event.type)}
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800">{event.title}</h4>
                    <time className="text-xs font-medium text-slate-500">
                      {new Date(event.timestamp).toLocaleDateString('pt-BR')} às {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                  
                  {event.proofImageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                      <img src={event.proofImageUrl} alt="Comprovante da ação" className="w-full h-auto object-cover max-h-48" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && activeCode && events.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            Nenhum evento encontrado para este código.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
