import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? ''

const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey)
  : createClient('https://example.supabase.co', 'public-anon-key')