import type { Database } from './src/types/database.types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>('https://xyz.supabase.co', '123');
const { data } = await supabase.from('profiles').select('*');
console.log(data);
