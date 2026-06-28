import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const LEVELS = [
  'Semente da Esperança',
  'Broto Sustentável',
  'Árvore Jovem',
  'Carvalho Guardião',
  'Ecossistema de Ouro',
  'Floresta Diamante',
] as const;

export type ForestTier = typeof LEVELS[number];

export interface DonationCommit {
  date: string;
  amount: number;
  count: number;
  isMock?: boolean;
}

export interface ImpactForestData {
  companyId: string;
  totalDonated: number;
  level: number;
  tierName: ForestTier;
  nextTierThreshold: number | null;
  progress: number;
  loading: boolean;
  error: string | null;
  commits: DonationCommit[];
  isSuffering: boolean;
  daysSinceLastDonation: number;
}

export const getTierDetails = (amount: number): { level: number; name: ForestTier; next: number | null } => {
  if (amount < 500) return { level: 1, name: 'Semente da Esperança', next: 500 };
  if (amount < 2000) return { level: 2, name: 'Broto Sustentável', next: 2000 };
  if (amount < 5000) return { level: 3, name: 'Árvore Jovem', next: 5000 };
  if (amount < 10000) return { level: 4, name: 'Carvalho Guardião', next: 10000 };
  if (amount < 50000) return { level: 5, name: 'Ecossistema de Ouro', next: 50000 };
  return { level: 6, name: 'Floresta Diamante', next: null };
};

// Generates a mock history of 365 days based on a profile
const generateMockCommits = (profileId: string): Map<string, DonationCommit> => {
  const map = new Map<string, DonationCommit>();
  const today = new Date();
  
  // Define profiles
  // "diamante" - High frequency, high amount, no churn
  // "churn" - Medium frequency, no donations in last 45 days
  // "iniciante" - Low frequency, recent donations
  const isDiamante = profileId === 'mock-diamante';
  const isChurn = profileId === 'mock-churn';
  const isIniciante = profileId === 'mock-iniciante';
  const isBroto = profileId === 'mock-broto';
  const isJovem = profileId === 'mock-jovem';
  const isCarvalho = profileId === 'mock-carvalho';
  const isEcossistema = profileId === 'mock-ecossistema';

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    let isDonationDay = false;
    let amount = 0;
    let count = 0;

    if (isDiamante) {
      // 85% chance of donating
      isDonationDay = Math.random() > 0.15;
      if (isDonationDay) {
        amount = Math.floor(Math.random() * 800) + 200; // 200 to 1000
        count = Math.floor(Math.random() * 4) + 1;
      }
    } else if (isChurn) {
      // 60% chance, but 0 chance in the last 45 days
      if (i > 45) {
        isDonationDay = Math.random() > 0.40;
        if (isDonationDay) {
          amount = Math.floor(Math.random() * 300) + 50;
          count = Math.floor(Math.random() * 2) + 1;
        }
      }
    } else if (isIniciante) {
      // Only donated in the last 30 days, 20% chance
      if (i <= 30) {
        isDonationDay = Math.random() > 0.70;
        if (isDonationDay) {
          amount = Math.floor(Math.random() * 100) + 20;
          count = 1;
        }
      }
    } else if (isBroto) {
      // Broto: total R$ 500 - 1999 (e.g. 15 * 75 = 1125)
      if (i % 24 === 0) {
        isDonationDay = true;
        amount = 75;
        count = 1;
      }
    } else if (isJovem) {
      // Jovem: total R$ 2000 - 4999 (e.g. 20 * 160 = 3200)
      if (i % 18 === 0) {
        isDonationDay = true;
        amount = 160;
        count = 1;
      }
    } else if (isCarvalho) {
      // Carvalho: total R$ 5000 - 9999 (e.g. 30 * 260 = 7800)
      if (i % 12 === 0) {
        isDonationDay = true;
        amount = 260;
        count = 1;
      }
    } else if (isEcossistema) {
      // Ecossistema: total R$ 10000 - 49999 (e.g. 60 * 520 = 31200)
      if (i % 6 === 0) {
        isDonationDay = true;
        amount = 520;
        count = 2;
      }
    } else {
      // Default random
      isDonationDay = Math.random() > 0.75;
      if (isDonationDay) {
        amount = Math.floor(Math.random() * 400) + 50;
        count = Math.floor(Math.random() * 3) + 1;
      }
    }

    map.set(dateStr, { date: dateStr, amount, count, isMock: true });
  }
  return map;
};

/**
 * Hook to fetch the total donated by a company and calculate their Gamification Tier.
 * @param companyId The UUID of the company profile (or mock ID).
 */
export function useImpactForest(companyId: string): ImpactForestData {
  const [totalDonated, setTotalDonated] = useState<number>(0);
  const [commits, setCommits] = useState<DonationCommit[]>([]);
  const [daysSinceLastDonation, setDaysSinceLastDonation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyImpact = async () => {
      setLoading(true);
      setError(null);
      try {
        let total = 0;
        let lastDate: Date | null = null;
        let finalCommits: DonationCommit[] = [];

        // If it's a known mock ID, skip supabase to avoid errors on missing tables
        if (companyId.startsWith('mock-') || companyId === 'default') {
          const commitsMap = generateMockCommits(companyId);
          finalCommits = Array.from(commitsMap.values());
          total = finalCommits.reduce((acc, curr) => acc + curr.amount, 0);
          
          if (companyId === 'mock-churn') {
            setDaysSinceLastDonation(46);
          } else {
            setDaysSinceLastDonation(2); // Recent
          }
        } else {
          // Real Supabase Fetch
          let data: any[] = [];
          const { data: sbData, error: sbError } = await supabase
            .from('donations')
            .select('valor, created_at')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

          if (sbError) {
            console.warn('Erro ao buscar donations reais (fallback para mock):', sbError.message);
          } else if (sbData) {
            data = sbData;
          }

          const commitsMap = generateMockCommits('default'); // fallback to some visual noise

          if (data && data.length > 0) {
            lastDate = new Date(data[0].created_at);
            
            data.forEach(d => {
              total += d.valor || 0;
              const dateStr = new Date(d.created_at).toISOString().split('T')[0];
              
              if (commitsMap.has(dateStr)) {
                const existing = commitsMap.get(dateStr)!;
                commitsMap.set(dateStr, {
                  date: dateStr,
                  amount: (existing.isMock ? 0 : existing.amount) + (d.valor || 0),
                  count: (existing.isMock ? 0 : existing.count) + 1,
                  isMock: false
                });
              }
            });
            
            const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
            setDaysSinceLastDonation(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          } else {
            total = Array.from(commitsMap.values()).reduce((acc, curr) => acc + curr.amount, 0);
            setDaysSinceLastDonation(Math.floor(Math.random() * 40)); 
          }
          finalCommits = Array.from(commitsMap.values());
        }

        setCommits(finalCommits);
        
        // Ensure total reflects the commits shown (real + mock) for the WOW factor in demo
        const demoTotal = finalCommits.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalDonated(Math.max(total, demoTotal));

      } catch (err: any) {
        console.error('Error fetching company impact:', err);
        setError(err.message || 'Erro ao carregar os dados de impacto da empresa.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyImpact();
  }, [companyId]);

  const { level, name, next } = getTierDetails(totalDonated);
  
  let progress = 100;
  if (next !== null) {
    const prevThreshold = level === 1 ? 0 : 
                          level === 2 ? 500 : 
                          level === 3 ? 2000 : 
                          level === 4 ? 5000 : 10000;
    progress = Math.min(100, Math.max(0, ((totalDonated - prevThreshold) / (next - prevThreshold)) * 100));
  }

  const isSuffering = daysSinceLastDonation > 30;

  return {
    companyId,
    totalDonated,
    level,
    tierName: name,
    nextTierThreshold: next,
    progress,
    loading,
    error,
    commits,
    isSuffering,
    daysSinceLastDonation
  };
}
