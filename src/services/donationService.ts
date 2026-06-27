import { supabase } from '@/lib/supabaseClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TopDonor {
  /** Nome do doador conforme preenchido na tabela donations */
  doador_nome: string;
  /** Soma de todas as contribuições (R$) */
  total: number;
  /** Número de transações registradas */
  count: number;
  /** Posição no ranking (1-indexed) */
  rank: number;
}

export interface GetTopDonorsResult {
  data: TopDonor[];
  /** Indica se os dados vieram do banco (true) ou do mock de fallback (false) */
  isReal: boolean;
  error: string | null;
}

// ── Serviço ───────────────────────────────────────────────────────────────────

/**
 * Busca o ranking de top doadores agrupado por nome, ordenado pelo total acumulado decrescente.
 * Retorna dados reais do banco. Se não houver doações, retorna uma lista vazia.
 *
 * @param limit - Máximo de doadores no ranking (padrão: 5)
 */
export async function getTopDonors(limit = 5): Promise<GetTopDonorsResult> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('doador_nome, valor')
      .order('valor', { ascending: false });

    if (error) {
      console.warn('[donationService] Erro ao buscar doações:', error.message);
      return { data: [], isReal: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isReal: true, error: null };
    }

    // ── Agregação: soma por doador_nome ──────────────────────────────────────
    const aggMap = new Map<string, { total: number; count: number }>();
    data.forEach(row => {
      const key = row.doador_nome.trim();
      const prev = aggMap.get(key) ?? { total: 0, count: 0 };
      aggMap.set(key, { total: prev.total + Number(row.valor), count: prev.count + 1 });
    });

    const ranked: TopDonor[] = Array.from(aggMap.entries())
      .map(([doador_nome, { total, count }]) => ({ doador_nome, total, count, rank: 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
      .map((d, i) => ({ ...d, rank: i + 1 }));

    return { data: ranked, isReal: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro inesperado.';
    console.error('[donationService] Exceção ao buscar doações:', msg);
    return { data: [], isReal: true, error: msg };
  }
}
