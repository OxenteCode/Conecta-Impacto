import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabaseClient] Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão definidas no .env'
  );
}

/**
 * Instância única do cliente Supabase.
 * Toda interação com banco e auth deve usar este cliente.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
