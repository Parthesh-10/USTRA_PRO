import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing URL or Key in .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log("Testing connection to:", supabaseUrl)
  const { data, error } = await supabase.from('salons').select('*').limit(1)
  if (error) {
    console.error('❌ Supabase connection failed:', error)
  } else {
    console.log('✅ Supabase connected successfully. Data:', data)
  }
}

testConnection()
