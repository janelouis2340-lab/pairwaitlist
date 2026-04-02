// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Types for your data
export type WaitlistEntry = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  route: string
  discount_code: string
  referral_code: string
  waitlist_position: number
  created_at: string
}