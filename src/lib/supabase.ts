// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client untuk browser & server (anon key aman untuk public read)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Opsional: Client dengan service role untuk operasi admin (hanya di server)
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false } // Jangan persist session untuk server
  })
}