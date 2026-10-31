import { createClient } from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseReady=Boolean(url&&key&&url.startsWith('https://')&&!key.includes('YOUR_'));
export const supabase=supabaseReady?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}}):null;
