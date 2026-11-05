import { createClient } from '@supabase/supabase-js'

let supabaseClient

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Липсва конфигурация за Supabase.')
  }

  supabaseClient = createClient(supabaseUrl, supabasePublishableKey)
  return supabaseClient
}
