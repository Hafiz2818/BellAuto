// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper: cek apakah env vars tersedia (hanya di runtime)
const isEnvConfigured = () => {
  // Jangan throw di build time, biarkan undefined untuk graceful fallback
  if (typeof window === 'undefined') {
    // Server-side: log warning tapi jangan crash build
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables not configured')
      return false
    }
    return true
  }
  // Client-side: bisa throw jika benar-benar diperlukan
  return !!(supabaseUrl && supabaseAnonKey)
}

// Export client yang aman: bisa undefined jika env tidak ter-set
export const supabase = isEnvConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Helper untuk operasi admin (opsional)
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not configured')
    return null
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

// Type guard untuk mengecek apakah client tersedia
export const isSupabaseReady = (): boolean => supabase !== null