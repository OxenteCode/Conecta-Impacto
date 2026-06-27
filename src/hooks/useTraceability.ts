import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface TraceabilityTimelineEvent {
  id: string;
  type: 'donation_received' | 'action_allocated' | 'action_delivered';
  title: string;
  description: string;
  timestamp: string;
  proofImageUrl?: string | null;
  volunteerName?: string;
  amount?: number;
}

export interface TraceabilityResult {
  trackingCode: string;
  events: TraceabilityTimelineEvent[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to trace a donation through the Ledger and verify its final delivery.
 * Anti-Fraud Logic: 
 * 1. The donation has a unique tracking_code.
 * 2. The ledger table immutably links the donation_id to a specific volunteer_action.
 * 3. The volunteer_action contains a server_timestamp and optionally a proof_image_url.
 * @param trackingCode The unique code provided to the donor.
 */
export function useTraceability(trackingCode: string): TraceabilityResult {
  const [events, setEvents] = useState<TraceabilityTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingCode || trackingCode.trim() === '') {
      setEvents([]);
      return;
    }

    const fetchTraceability = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch Donation
        const { data: donationData, error: donationError } = await supabase
          .from('donations')
          .select('*')
          .eq('tracking_code', trackingCode)
          .single();

        if (donationError || !donationData) {
          throw new Error('Doação não encontrada com este código de rastreio.');
        }

        const timeline: TraceabilityTimelineEvent[] = [
          {
            id: `don-${donationData.id}`,
            type: 'donation_received',
            title: 'Doação Recebida',
            description: `Valor de R$ ${donationData.valor.toFixed(2)} recebido de ${donationData.doador_nome}.`,
            timestamp: donationData.created_at,
            amount: donationData.valor,
          }
        ];

        // 2. Fetch Ledger Entry (Where was it allocated?)
        const { data: ledgerData, error: ledgerError } = await supabase
          .from('ledger')
          .select('*, volunteer_actions(*, profiles(nome))')
          .eq('donation_id', donationData.id)
          .maybeSingle(); // Might not be allocated yet

        if (ledgerError) {
          console.error('Error fetching ledger:', ledgerError);
        }

        if (ledgerData && ledgerData.volunteer_actions) {
          const action = ledgerData.volunteer_actions as any; // Using any due to complex join typing
          const volunteerName = action.profiles?.nome || 'Voluntário Anônimo';

          timeline.push({
            id: `alloc-${ledgerData.id}`,
            type: 'action_allocated',
            title: 'Recurso Alocado',
            description: `A doação foi vinculada à ação: "${action.title || action.descricao}".`,
            timestamp: ledgerData.created_at,
          });

          timeline.push({
            id: `act-${action.id}`,
            type: 'action_delivered',
            title: 'Impacto Entregue',
            description: `Ação concluída no local por ${volunteerName}.`,
            timestamp: action.server_timestamp || action.created_at,
            proofImageUrl: action.proof_image_url,
            volunteerName,
          });
        }

        setEvents(timeline);
      } catch (err: any) {
        console.error('Traceability search error:', err);
        setError(err.message || 'Erro ao rastrear a doação.');
      } finally {
        setLoading(false);
      }
    };

    fetchTraceability();
  }, [trackingCode]);

  return {
    trackingCode,
    events,
    loading,
    error,
  };
}
