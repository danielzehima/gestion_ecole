import { createClient } from '@supabase/supabase-js';

// Remplacer ces valeurs par vos vraies clés Supabase (idéalement depuis des variables d'environnement .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'votre-cle-anon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
