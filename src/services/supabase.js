import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Missing env vars should be handled silently or with fallback if necessary
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
